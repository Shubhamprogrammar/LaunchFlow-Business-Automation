import { prisma } from "../../config/prisma";
import crypto from "crypto";
import { InviteStatus } from "../../../generated/prisma/enums";
import { addInviteEmailJob } from "../../jobs/email.jobs";

export const createInviteService = async (
  workspaceId: string,
  email: string,
  invitedById: string
) => {
  const workspace = await prisma.workspace.findUnique({
    where: {
      id: workspaceId,
    },
  });

  if (!workspace) {
    const error: any = new Error("Workspace not found");
    error.statusCode = 404;
    throw error;
  }

  const membership = await prisma.membership.findFirst({
    where: {
      workspaceId,
      userId: invitedById,
    },
  });

  if (!membership) {
    const error: any = new Error(
      "You are not a member of this workspace"
    );
    error.statusCode = 403;
    throw error;
  }
  if (
    membership.role !== "OWNER" &&
    membership.role !== "ADMIN"
  ) {
    const error: any = new Error(
      "You do not have permission to invite users"
    );
    error.statusCode = 403;
    throw error;
  }
const existingInvite = await prisma.invite.findFirst({
    where: {
      workspaceId,
      email,
      status: InviteStatus.PENDING,
    },
  });

  if (existingInvite) {
    const error: any = new Error(
      "Invite already exists"
    );
    error.statusCode = 409;
    throw error;
  }
  const token = crypto.randomBytes(24).toString("hex");

  const invite = await prisma.invite.create({
    data: {
      workspaceId,
      email,
      token,
      invitedById,
      status: InviteStatus.PENDING,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  // EMAIL (SIDE EFFECT BUT OK HERE BECAUSE IT'S QUEUE-BASED)
  await addInviteEmailJob({
    email,
    workspaceName:workspace.name,
    inviteLink: `${process.env.FRONTEND_URL}/invite/${token}`,
  });

  // RETURN EVENT DATA (NO NOTIFICATIONS HERE)
  return {
    invite,
    event: {
      type: "INVITE_CREATED",
      userId: invitedById,
      email,
      workspaceName: workspace.name,
      workspaceId,
    },
  };
};

export const acceptInviteService = async (
  token: string,
  userId: string
) => {
  // 1. Fetch invite
  const invite = await prisma.invite.findUnique({
    where: { token },
    include: { workspace: true },
  });

  if (!invite) {
    const error: any = new Error("Invite not found");
    error.statusCode = 404;
    throw error;
  }

  if (invite.status !== InviteStatus.PENDING) {
    const error: any = new Error("Invite is no longer valid");
    error.statusCode = 400;
    throw error;
  }

  // 2. Expiry check (with update outside transaction)
  if (invite.expiresAt < new Date()) {
    await prisma.invite.update({
      where: { id: invite.id },
      data: { status: InviteStatus.EXPIRED },
    });

    const error: any = new Error("Invite has expired");
    error.statusCode = 400;
    throw error;
  }

  // 3. Validate user
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    const error: any = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  if (user.email.toLowerCase() !== invite.email.toLowerCase()) {
    const error: any = new Error(
      "This invite belongs to another email address"
    );
    error.statusCode = 403;
    throw error;
  }

  // 4. Check existing membership
  const existingMembership = await prisma.membership.findFirst({
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

  // 5. Transaction ONLY for writes
  const result = await prisma.$transaction(async (tx) => {
    const membership = await tx.membership.create({
      data: {
        userId,
        workspaceId: invite.workspaceId,
        role: invite.role,
      },
    });

    await tx.invite.update({
      where: { id: invite.id },
      data: { status: InviteStatus.ACCEPTED },
    });

    return {
      workspace: invite.workspace,
      role: invite.role,
      invitedById: invite.invitedById,
      workspaceId: invite.workspaceId,
      userEmail: user.email,
      membershipId: membership.id,
      userId,
    };
  });

  return result;
};