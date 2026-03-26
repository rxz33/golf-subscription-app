import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const VALID_CHARITIES = ["1", "2", "3"];

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
      .from("user_preferences")
      .select("charity")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") throw error;

    return NextResponse.json({ charity: data?.charity ?? "1" });
  } catch (err) {
    console.error("[GET /api/charity]", err);
    return NextResponse.json({ error: "Failed to fetch charity" }, { status: 500 });
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

    const { charity } = await request.json();

    if (!VALID_CHARITIES.includes(charity)) {
      return NextResponse.json({ error: "Invalid charity" }, { status: 400 });
    }

    const { error } = await supabase
      .from("user_preferences")
      .upsert(
        { user_id: user.id, charity, updated_at: new Date().toISOString() },
        { onConflict: "user_id" }
      );

    if (error) throw error;

    return NextResponse.json({ charity });
  } catch (err) {
    console.error("[POST /api/charity]", err);
    return NextResponse.json({ error: "Failed to update charity" }, { status: 500 });
  }
}