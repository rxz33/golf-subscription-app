import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const VALID_STATUSES = ["active", "inactive"] as const;
type SubscriptionStatus = (typeof VALID_STATUSES)[number];

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
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("subscriptions")
      .select("status")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") throw error;

    return NextResponse.json({ status: data?.status ?? "active" });
  } catch (err) {
    console.error("[GET /api/subscription]", err);
    return NextResponse.json({ error: "Failed to fetch subscription" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const response = NextResponse.next();

  try {
    const supabase = makeSupabaseWithResponse(response);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status }: { status: SubscriptionStatus } = await request.json();

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const { error } = await supabase
      .from("subscriptions")
      .upsert(
        { user_id: user.id, status, updated_at: new Date().toISOString() },
        { onConflict: "user_id" }
      );

    if (error) throw error;

    return NextResponse.json({ status });
  } catch (err) {
    console.error("[POST /api/subscription]", err);
    return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 });
  }
}