import { prisma } from "../../config/prisma";
import crypto from "crypto";
import { InviteStatus } from "../../../generated/prisma/enums";

export const createInviteService = async (
  workspaceId: string,
  email: string,
  invitedById: string
) => {
  const token = crypto.randomBytes(24).toString("hex");

  return prisma.invite.create({
    data: {
      workspaceId,
      email,
      token,
      invitedById,
      status: InviteStatus.PENDING,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });
};

export const acceptInviteService = async (
  token: string,
  userId: string
) => {
  return prisma.$transaction(async (tx) => {
    // 1. Find invite
    const invite = await tx.invite.findUnique({
      where: { token },
      include: {
        workspace: true,
      },
    });

    if (!invite) {
      const error: any = new Error("Invite not found");
      error.statusCode = 404;
      throw error;
    }

    // 2. Validate status
    if (invite.status !== InviteStatus.PENDING) {
      const error: any = new Error("Invite is no longer valid");
      error.statusCode = 400;
      throw error;
    }

    // 3. Validate expiry
    if (invite.expiresAt < new Date()) {
      await tx.invite.update({
        where: { id: invite.id },
        data: {
          status: InviteStatus.EXPIRED,
        },
      });

      const error: any = new Error("Invite has expired");
      error.statusCode = 400;
      throw error;
    }

    // 4. Find logged-in user
    const user = await tx.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      const error: any = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    // 5. Email must match invite email
    if (user.email.toLowerCase() !== invite.email.toLowerCase()) {
      const error: any = new Error(
        "This invite belongs to another email address"
      );
      error.statusCode = 403;
      throw error;
    }

    // 6. Already member?
    const existingMembership = await tx.membership.findFirst({
      where: {
        userId,
        workspaceId: invite.workspaceId,
      },
    });

    if (existingMembership) {
      const error: any = new Error("You are already a workspace member");
      error.statusCode = 409;
      throw error;
    }

    // 7. Create membership
    await tx.membership.create({
      data: {
        userId,
        workspaceId: invite.workspaceId,
        role: invite.role,
      },
    });

    // 8. Mark invite accepted
    await tx.invite.update({
      where: { id: invite.id },
      data: {
        status: InviteStatus.ACCEPTED,
      },
    });

    return {
      workspace: invite.workspace,
      role: invite.role,
    };
  });
};