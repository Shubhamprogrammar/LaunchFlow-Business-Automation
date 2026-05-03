import { prisma } from "../../config/prisma";
import { stripe } from "../../config/stripe";
import { env } from "../../config/env";

const PRICE_IDS = {
  PRO: env.STRIPE_PRICE_PRO!,
  TEAM: env.STRIPE_PRICE_TEAM!,
  ENTERPRISE: env.STRIPE_PRICE_ENTERPRISE!,
};

export const createCheckoutSessionService = async (
  workspaceId: string,
  plan: "PRO" | "TEAM" | "ENTERPRISE"
) => {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
  });

  if (!workspace) {
    const error: any = new Error("Workspace not found");
    error.statusCode = 404;
    throw error;
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["upi","card", "paypal", "amazon_pay"],
    line_items: [
      {
        price: PRICE_IDS[plan],
        quantity: 1,
      },
    ],
    success_url: `${env.FRONTEND_URL}/billing/success`,
    cancel_url: `${env.FRONTEND_URL}/billing/cancel`,
    metadata: {
      workspaceId,
      plan,
    },
  });
  return session;
};

export const getCurrentPlanService = async (
  workspaceId: string
) => {
  const subscription = await prisma.subscription.findFirst({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
  });

  if (!subscription) {
    return {
      plan: "FREE",
      status: "TRIALING",
    };
  }

  return subscription;
};

export const cancelSubscriptionService = async (
  workspaceId: string
) => {
  const subscription = await prisma.subscription.findFirst({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
  });

  if (!subscription?.stripeSubscriptionId) {
    const error: any = new Error("No active subscription found");
    error.statusCode = 404;
    throw error;
  }

  await stripe.subscriptions.cancel(
    subscription.stripeSubscriptionId
  );

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status: "CANCELLED",
    },
  });

  return true;
};

export const createCustomerPortalSessionService = async (
  workspaceId: string
) => {
  const subscription = await prisma.subscription.findFirst({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
  });

  if (!subscription || !subscription.stripeCustomerId) {
    const error: any = new Error("No active billing account found. Please subscribe first.");
    error.statusCode = 404;
    throw error;
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: `${env.FRONTEND_URL}/dashboard/billing`,
  });

  return session;
};