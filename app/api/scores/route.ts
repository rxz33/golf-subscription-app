import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const VALID_CHARITIES = ["1", "2", "3"];
const MAX_SCORES = 5;

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
      .from("golf_scores")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(MAX_SCORES);

    if (error) throw error;

    return NextResponse.json({ scores: data ?? [] });
  } catch (err) {
    console.error("[GET /api/scores]", err);
    return NextResponse.json({ error: "Failed to fetch scores" }, { status: 500 });
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

    const { score, charity } = await request.json();

    if (!Number.isInteger(score) || score < 1 || score > 45) {
      return NextResponse.json(
        { error: "Score must be between 1 and 45" },
        { status: 400 }
      );
    }

    if (!VALID_CHARITIES.includes(charity)) {
      return NextResponse.json({ error: "Invalid charity" }, { status: 400 });
    }

    // Insert new score
    const { error: insertError } = await supabase
      .from("golf_scores")
      .insert({ user_id: user.id, score, charity });

    if (insertError) throw insertError;

    // Fetch all score IDs to determine overflow
    const { data: allScores, error: fetchError } = await supabase
      .from("golf_scores")
      .select("id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (fetchError) throw fetchError;

    // Delete oldest scores beyond the limit in one query
    if (allScores.length > MAX_SCORES) {
      const idsToDelete = allScores
        .slice(MAX_SCORES)
        .map((s: { id: string }) => s.id);

      const { error: deleteError } = await supabase
        .from("golf_scores")
        .delete()
        .in("id", idsToDelete);

      if (deleteError) throw deleteError;
    }

    // Return latest scores
    const { data: latestScores, error: finalError } = await supabase
      .from("golf_scores")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(MAX_SCORES);

    if (finalError) throw finalError;

    return NextResponse.json({ scores: latestScores ?? [] });
  } catch (err) {
    console.error("[POST /api/scores]", err);
    return NextResponse.json({ error: "Failed to add score" }, { status: 500 });
  }
}