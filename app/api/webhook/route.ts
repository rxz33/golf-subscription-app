import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env["STRIPE_SECRET_KEY"]!);

// Use service role key for webhook — bypasses RLS
const supabase = createClient(
  process.env["NEXT_PUBLIC_SUPABASE_URL"]!,
  process.env["SUPABASE_SERVICE_ROLE_KEY"]!,
);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env["STRIPE_WEBHOOK_SECRET"]!,
    );
  } catch (err) {
    console.error("[Webhook] Invalid signature", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadata = session.metadata as {
          user_id?: string;
          plan?: "monthly" | "yearly";
        } | null;

        const userId = metadata?.user_id ?? null;
        const plan = metadata?.plan ?? "monthly";
        const subscriptionId = session.subscription as string;

        const subscription =
          await stripe.subscriptions.retrieve(subscriptionId);

        const periodEnd = (subscription as any).current_period_end
          ? new Date(
              (subscription as any).current_period_end * 1000,
            ).toISOString()
          : null;

        if (!userId) {
          console.error("❌ Missing userId in webhook");
          break; // IMPORTANT: do NOT return inside switch
        }

        await supabase.from("subscriptions").upsert(
          {
            user_id: userId,
            status: "active",
            plan,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: subscriptionId,
            current_period_end: periodEnd,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" },
        );
        break;
      }

      case "customer.subscription.deleted":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;

        const status = sub.status === "active" ? "active" : "cancelled";

        const subPeriodEnd = (sub as any).current_period_end
          ? new Date((sub as any).current_period_end * 1000).toISOString()
          : null;

        await supabase
          .from("subscriptions")
          .update({
            status,
            current_period_end: subPeriodEnd,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", sub.id);

        break;
      }
    }
  } catch (err) {
    console.error("[Webhook] Handler error", err);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}
