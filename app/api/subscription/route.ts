export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Stripe from "stripe";

const stripe = new Stripe(process.env['STRIPE_SECRET_KEY']!);

function makeSupabaseWithResponse(response: NextResponse) {
  const cookieStore = cookies();

  return createServerClient(
    process.env['NEXT_PUBLIC_SUPABASE_URL']!,
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );
}

export async function GET() {
  const response = NextResponse.next();

  try {
    const supabase = makeSupabaseWithResponse(response);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 🔥 Get subscriptions from Stripe
    const subscriptions = await stripe.subscriptions.list({
      status: "active",
      limit: 10,
      expand: ["data.customer"],
    });

    // 🔍 Find subscription for this user
    const activeSub = subscriptions.data.find((sub) => {
      const customer = sub.customer as any;
      return customer?.email === user.email;
    });

    return NextResponse.json({
      status: activeSub ? "active" : "inactive",
      subscription: activeSub ?? null,
    });
  } catch (err) {
    console.error("[GET /api/subscription]", err);
    return NextResponse.json(
      {
        status: "inactive",
        subscription: null,
        error: "Failed to fetch subscription",
      },
      { status: 500 }
    );
  }
}