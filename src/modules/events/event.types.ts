// src/modules/events/event.types.ts

export const EventTypes = {
  /**
   * ===============================
   * INVITES
   * ===============================
   */
  INVITE_CREATED: "INVITE_CREATED",
  INVITE_ACCEPTED: "INVITE_ACCEPTED",
  INVITE_EXPIRED: "INVITE_EXPIRED",
  INVITE_CANCELLED: "INVITE_CANCELLED",

  /**
   * ===============================
   * WORKSPACE
   * ===============================
   */
  WORKSPACE_CREATED: "WORKSPACE_CREATED",
  WORKSPACE_UPDATED: "WORKSPACE_UPDATED",
  WORKSPACE_DELETED: "WORKSPACE_DELETED",
  WORKSPACE_JOINED: "WORKSPACE_JOINED",

  /**
   * ===============================
   * MEMBERSHIP / ROLES
   * ===============================
   */
  MEMBER_JOINED: "MEMBER_JOINED",
  MEMBER_REMOVED: "MEMBER_REMOVED",
  ROLE_UPDATED: "ROLE_UPDATED",
  OWNERSHIP_TRANSFERRED: "OWNERSHIP_TRANSFERRED",

  /**
   * ===============================
   * BILLING / STRIPE
   * ===============================
   */
  SUBSCRIPTION_CREATED: "SUBSCRIPTION_CREATED",
  SUBSCRIPTION_UPDATED: "SUBSCRIPTION_UPDATED",
  SUBSCRIPTION_CANCELLED: "SUBSCRIPTION_CANCELLED",
  PLAN_UPGRADED: "PLAN_UPGRADED",
  PLAN_DOWNGRADED: "PLAN_DOWNGRADED",
  PAYMENT_FAILED: "PAYMENT_FAILED",
  INVOICE_PAID: "INVOICE_PAID",

  /**
   * ===============================
   * API KEYS
   * ===============================
   */
  API_KEY_CREATED: "API_KEY_CREATED",
  API_KEY_REVOKED: "API_KEY_REVOKED",

  /**
   * ===============================
   * FILES
   * ===============================
   */
  FILE_UPLOADED: "FILE_UPLOADED",
  FILE_DELETED: "FILE_DELETED",

  /**
   * ===============================
   * WEBHOOKS
   * ===============================
   */
  WEBHOOK_CREATED: "WEBHOOK_CREATED",
  WEBHOOK_UPDATED: "WEBHOOK_UPDATED",
  WEBHOOK_DELETED: "WEBHOOK_DELETED",
  WEBHOOK_FAILED: "WEBHOOK_FAILED",

  /**
   * ===============================
   * AUTH / SECURITY
   * ===============================
   */
  USER_LOGIN: "USER_LOGIN",
  USER_LOGOUT: "USER_LOGOUT",
  PASSWORD_CHANGED: "PASSWORD_CHANGED",
  EMAIL_VERIFIED: "EMAIL_VERIFIED",
  NEW_DEVICE_LOGIN: "NEW_DEVICE_LOGIN",

  /**
   * ===============================
   * JOBS / AUTOMATION
   * ===============================
   */
  JOB_CREATED: "JOB_CREATED",
  JOB_COMPLETED: "JOB_COMPLETED",
  JOB_FAILED: "JOB_FAILED",
} as const;

export type EventType =
  (typeof EventTypes)[keyof typeof EventTypes];