import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/* Supabase OAuth (Google) redirects here with a code; we exchange it for a
 * session cookie, then bounce to wherever the user was headed (`next`). */

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/upgrade";

  if (code) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // `next` is our own relative path (may carry ?ext_id=...).
  return NextResponse.redirect(`${origin}${next.startsWith("/") ? next : `/${next}`}`);
}
