import { eventBus } from "./event.bus";
import { EventTypes } from "./event.types";
import { notifyUser } from "../notifications/notify";
import { createAuditLog } from "../audit/audit.service";

export const registerEventListeners = () => {
  /**
   * ==================================================
   * INVITE CREATED
   * ==================================================
   */
  eventBus.on(EventTypes.INVITE_CREATED, async (payload) => {
    try {
      console.log("INVITE_CREATED listener", payload);
      // 🔔 Notification
      await notifyUser({
        userId: payload.userId,
        title: "Invite Sent",
        message: `You invited ${payload.email} to ${payload.workspaceName}`,
        type: "SUCCESS",
        workspaceId: payload.workspaceId,
        eventType: EventTypes.INVITE_CREATED,
      });

      // 📜 Audit Log
      await createAuditLog({
        workspaceId: payload.workspaceId,
        actorId: payload.userId,
        action: "INVITE_CREATED",
        entityType: "INVITE",
        metadata: {
          invitedEmail: payload.email,
          workspaceName: payload.workspaceName,
        },
      });
    } catch (error) {
      console.error("INVITE_CREATED listener error:", error);
    }
  });

  /**
   * ==================================================
   * INVITE ACCEPTED
   * ==================================================
   */
  eventBus.on(EventTypes.INVITE_ACCEPTED, async (payload) => {
    try {
      console.log("INVITE_ACCEPTED listener", payload);
      // 🔔 Notify inviter
      await notifyUser({
        userId: payload.invitedById,
        title: "Invite Accepted",
        message: `${payload.userEmail} joined your workspace`,
        type: "SUCCESS",
        workspaceId: payload.workspaceId,
        eventType: EventTypes.INVITE_ACCEPTED,
      });

      // 📜 Audit Log
      await createAuditLog({
        workspaceId: payload.workspaceId,
        actorId: payload.userId,
        action: "INVITE_ACCEPTED",
        entityType: "MEMBERSHIP",
        metadata: {
          joinedEmail: payload.userEmail,
          workspaceName: payload.workspace,
        },
      });
    } catch (error) {
      console.error("INVITE_ACCEPTED listener error:", error);
    }
  });

  /**
   * ==================================================
   * WORKSPACE JOINED
   * ==================================================
   */
  eventBus.on(EventTypes.WORKSPACE_JOINED, async (payload) => {
    try {
      console.log("WORKSPACE_JOINED listener", payload);
      // 🔔 Notify joining user
      await notifyUser({
        userId: payload.userId,
        title: "Welcome!",
        message: `You joined ${payload.workspaceName}`,
        type: "SUCCESS",
        workspaceId: payload.workspaceId,
        eventType: EventTypes.WORKSPACE_JOINED,
      });

      // 📜 Audit Log
      await createAuditLog({
        workspaceId: payload.workspaceId,
        actorId: payload.userId,
        action: "MEMBER_JOINED",
        entityType: "MEMBERSHIP",
        metadata: {
          workspaceName: payload.workspaceName,
          joinedEmail: payload.userEmail,
        },
      });
    } catch (error) {
      console.error("WORKSPACE_JOINED listener error:", error);
    }
  });

  /**
   * ==================================================
   * WORKSPACE CREATED
   * ==================================================
   */
  eventBus.on(EventTypes.WORKSPACE_CREATED, async (payload) => {
    try {
      console.log("WORKSPACE_CREATED listener", payload);
      await createAuditLog({
        workspaceId: payload.workspaceId,
        actorId: payload.userId,
        action: "WORKSPACE_CREATED",
        entityType: "WORKSPACE",
        entityId: payload.workspaceId,
        metadata: {
          workspaceName: payload.workspaceName,
        },
      });
    } catch (error) {
      console.error("WORKSPACE_CREATED listener error:", error);
    }
  });

  /**
   * ==================================================
   * ROLE UPDATED
   * ==================================================
   */
  eventBus.on(EventTypes.ROLE_UPDATED, async (payload) => {
    try {
      await createAuditLog({
        workspaceId: payload.workspaceId,
        actorId: payload.actorId,
        action: "ROLE_UPDATED",
        entityType: "MEMBERSHIP",
        entityId: payload.targetUserId,
        metadata: {
          targetUserId: payload.targetUserId,
          oldRole: payload.oldRole,
          newRole: payload.newRole,
        },
      });
    } catch (error) {
      console.error("ROLE_UPDATED listener error:", error);
    }
  });

  /**
   * ==================================================
   * SUBSCRIPTION UPDATED
   * ==================================================
   */
  eventBus.on(EventTypes.SUBSCRIPTION_UPDATED, async (payload) => {
    try {
      await notifyUser({
        userId: payload.userId,
        title: "Subscription Updated",
        message: `Your workspace is now on ${payload.plan}`,
        type: "SUCCESS",
        workspaceId: payload.workspaceId,
        eventType: EventTypes.SUBSCRIPTION_UPDATED,
      });

      await createAuditLog({
        workspaceId: payload.workspaceId,
        actorId: payload.userId,
        action: "SUBSCRIPTION_UPDATED",
        entityType: "SUBSCRIPTION",
        metadata: {
          plan: payload.plan,
          status: payload.status,
        },
      });
    } catch (error) {
      console.error("SUBSCRIPTION_UPDATED listener error:", error);
    }
  });

  /**
   * ==================================================
   * API KEY CREATED
   * ==================================================
   */
  eventBus.on(EventTypes.API_KEY_CREATED, async (payload) => {
    try {
      await createAuditLog({
        workspaceId: payload.workspaceId,
        actorId: payload.userId,
        action: "API_KEY_CREATED",
        entityType: "API_KEY",
        entityId: payload.apiKeyId,
        metadata: {
          name: payload.name,
        },
      });
    } catch (error) {
      console.error("API_KEY_CREATED listener error:", error);
    }
  });

  /**
   * ==================================================
   * FILE UPLOADED
   * ==================================================
   */
  eventBus.on(EventTypes.FILE_UPLOADED, async (payload) => {
    try {
      await createAuditLog({
        workspaceId: payload.workspaceId,
        actorId: payload.userId,
        action: "FILE_UPLOADED",
        entityType: "FILE",
        entityId: payload.fileId,
        metadata: {
          fileName: payload.fileName,
          size: payload.size,
        },
      });
    } catch (error) {
      console.error("FILE_UPLOADED listener error:", error);
    }
  });

  /**
   * ==================================================
   * WEBHOOK CREATED
   * ==================================================
   */
  eventBus.on(EventTypes.WEBHOOK_CREATED, async (payload) => {
    try {
      await createAuditLog({
        workspaceId: payload.workspaceId,
        actorId: payload.userId,
        action: "WEBHOOK_CREATED",
        entityType: "WEBHOOK",
        entityId: payload.webhookId,
        metadata: {
          url: payload.url,
        },
      });
    } catch (error) {
      console.error("WEBHOOK_CREATED listener error:", error);
    }
  });
};