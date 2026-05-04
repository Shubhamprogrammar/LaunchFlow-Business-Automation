import { Request, Response } from "express";
import { stripe } from "../../config/stripe";
import { prisma } from "../../config/prisma";

export const stripeWebhookController = async (
  req: Request,
  res: Response
) => {
  const sig = req.headers["stripe-signature"] as string;

  let event: any;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;

    const workspaceId = session.metadata?.workspaceId!;
    const plan = session.metadata?.plan as
      | "PRO"
      | "TEAM"
      | "ENTERPRISE"
      | undefined;

    if (!workspaceId || !plan) {
      console.warn("Invalid Stripe checkout metadata");
      return res.status(200).json({ received: true });
    }

    await prisma.subscription.create({
      data: {
        workspaceId,
        plan,
        status: "ACTIVE",
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: session.subscription as string,
      },
    });

    await prisma.workspace.update({
      where: { id: workspaceId },
      data: { plan },
    });
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as any;

    await prisma.subscription.updateMany({
      where: {
        stripeSubscriptionId: sub.id,
      },
      data: {
        status: "CANCELLED",
      },
    });
  }

  return res.status(200).json({ received: true });
};