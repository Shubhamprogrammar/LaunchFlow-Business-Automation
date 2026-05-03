import { prisma } from "../../config/prisma";
import { env } from "../../config/env";
import crypto from "crypto";
import { InviteStatus } from "../../../generated/prisma/enums";
import { addInviteEmailJob } from "../../jobs/email.jobs";
import { eventBus } from "../events/event.bus";
import { EventTypes } from "../events/event.types";

export const createInviteService = async (
  workspaceId: string,
  email: string,
  invitedById: string
) => {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
  });

  if (!workspace) throw new Error("Workspace not found");

  const membership = await prisma.membership.findFirst({
    where: { workspaceId, userId: invitedById },
  });

  if (!membership || (membership.role !== "OWNER" && membership.role !== "ADMIN")) {
    throw new Error("Unauthorized to invite");
  }

  // --- PLAN LIMIT CHECK ---
  // ... (previous logic)
  const [memberCount, pendingInvites, subscription] = await Promise.all([
    prisma.membership.count({ where: { workspaceId } }),
    prisma.invite.count({ where: { workspaceId, status: InviteStatus.PENDING } }),
    prisma.subscription.findFirst({
      where: { workspaceId, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const currentPlan = subscription?.plan || "FREE";
  const limit = currentPlan === "PRO" ? 20 : (currentPlan === "TEAM" || currentPlan === "ENTERPRISE") ? Infinity : 3;

  if (memberCount + pendingInvites >= limit) {
    throw new Error(`Member limit reached for ${currentPlan} plan.`);
  }

  const existingInvite = await prisma.invite.findFirst({
    where: { workspaceId, email, status: InviteStatus.PENDING },
  });

  if (existingInvite) throw new Error("Invite already exists");

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

  eventBus.emit(EventTypes.INVITE_CREATED, {
    workspaceId,
    userId: invitedById,
    email,
    workspaceName: workspace.name,
  });

  await addInviteEmailJob({
    email,
    workspaceName: workspace.name,
    inviteLink: `${env.FRONTEND_URL}/invite/${token}`,
  });

  return { invite };
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

  // 4.5 Plan limit check on acceptance
  const [memberCount, subscription] = await Promise.all([
    prisma.membership.count({ where: { workspaceId: invite.workspaceId } }),
    prisma.subscription.findFirst({
      where: { workspaceId: invite.workspaceId, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const currentPlan = subscription?.plan || "FREE";
  const limit = currentPlan === "PRO" ? 20 : (currentPlan === "TEAM" || currentPlan === "ENTERPRISE") ? Infinity : 3;

  if (memberCount >= limit) {
    const error: any = new Error(
      `Workspace member limit reached (${limit} members). The workspace owner needs to upgrade their plan.`
    );
    error.statusCode = 403;
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

  // Emit events AFTER transaction succeeds
  eventBus.emit(EventTypes.INVITE_ACCEPTED, {
    workspaceId: invite.workspaceId,
    userId,
    invitedById: invite.invitedById,
    userEmail: user.email,
    workspace: invite.workspace.name,
  });

  eventBus.emit(EventTypes.WORKSPACE_JOINED, {
    userId,
    workspaceId: invite.workspaceId,
    workspaceName: invite.workspace.name,
  });

  return result;
};

export const getWorkspaceInvitesService = async (workspaceId: string) => {
  return prisma.invite.findMany({
    where: {
      workspaceId,
      status: InviteStatus.PENDING,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};