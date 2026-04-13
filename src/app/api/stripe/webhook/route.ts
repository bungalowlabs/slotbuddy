import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import Stripe from "stripe";
import { sendAdminNotification } from "@/lib/email";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.id;

        await db
          .update(users)
          .set({
            subscriptionStatus: subscription.status,
            stripeCustomerId: customerId,
          })
          .where(eq(users.stripeCustomerId, customerId));

        // Notify on new active subscriptions
        if (event.type === "customer.subscription.created" && subscription.status === "active") {
          const [subscriber] = await db
            .select({ email: users.email, name: users.name })
            .from(users)
            .where(eq(users.stripeCustomerId, customerId))
            .limit(1);

          if (subscriber) {
            sendAdminNotification({
              subject: `New subscriber: ${subscriber.name || subscriber.email}`,
              body: `
                <h2>New Paid Subscriber!</h2>
                <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
                  <p style="margin: 0 0 8px;"><strong>Name:</strong> ${subscriber.name || "—"}</p>
                  <p style="margin: 0;"><strong>Email:</strong> ${subscriber.email}</p>
                </div>
              `,
            }).catch(() => {});
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.id;

        await db
          .update(users)
          .set({ subscriptionStatus: "expired" })
          .where(eq(users.stripeCustomerId, customerId));
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId =
          typeof invoice.customer === "string"
            ? invoice.customer
            : invoice.customer?.id;

        if (customerId) {
          await db
            .update(users)
            .set({ subscriptionStatus: "past_due" })
            .where(eq(users.stripeCustomerId, customerId));
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
