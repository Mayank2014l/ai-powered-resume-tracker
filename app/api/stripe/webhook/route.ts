import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("Stripe-Signature") || "";

  let event;
  try {
    if (process.env.STRIPE_WEBHOOK_SECRET) {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } else {
      event = JSON.parse(body);
    }
  } catch (error: any) {
    console.error("Stripe webhook verification failed:", error.message);
    return NextResponse.json({ error: "Webhook verification failed" }, { status: 400 });
  }

  const session = event.data.object as any;

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const userId = session.metadata?.userId;
        const subscriptionId = session.subscription as string;

        if (userId && subscriptionId) {
          const subscription = (await stripe.subscriptions.retrieve(subscriptionId)) as any;
          await prisma.user.update({
            where: { id: userId },
            data: { plan: "pro" },
          });

          await prisma.subscription.upsert({
            where: { stripeSubscriptionId: subscriptionId },
            update: {
              status: subscription.status,
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
            create: {
              userId,
              stripeSubscriptionId: subscriptionId,
              plan: "pro",
              status: subscription.status,
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
          });
        }
        break;
      }
      case "customer.subscription.updated": {
        const subscriptionId = session.id as string;
        const status = session.status;
        const currentPeriodEnd = new Date(session.current_period_end * 1000);

        const dbSub = await prisma.subscription.findUnique({
          where: { stripeSubscriptionId: subscriptionId },
        });

        if (dbSub) {
          await prisma.subscription.update({
            where: { stripeSubscriptionId: subscriptionId },
            data: { status, currentPeriodEnd },
          });

          await prisma.user.update({
            where: { id: dbSub.userId },
            data: { plan: status === "active" ? "pro" : "free" },
          });
        }
        break;
      }
      case "customer.subscription.deleted": {
        const subscriptionId = session.id as string;

        const dbSub = await prisma.subscription.findUnique({
          where: { stripeSubscriptionId: subscriptionId },
        });

        if (dbSub) {
          await prisma.subscription.update({
            where: { stripeSubscriptionId: subscriptionId },
            data: { status: "canceled" },
          });

          await prisma.user.update({
            where: { id: dbSub.userId },
            data: { plan: "free" },
          });
        }
        break;
      }
    }
    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Stripe webhook processing failed:", error);
    return NextResponse.json({ error: "Webhook event handling failed" }, { status: 500 });
  }
}
export const runtime = "nodejs";
