import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isProFromRow } from "@/lib/subscription";

/* The extension calls this with the user's Supabase access token to learn
 * whether they're Pro. No cookies — pure Bearer auth — so it works from the
 * extension's background worker. */

export const runtime = "nodejs";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

function reply(body: { pro: boolean; until: string | null }, status = 200) {
  return NextResponse.json(body, { status, headers: CORS });
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function GET(req: NextRequest) {
  const authz = req.headers.get("authorization") ?? "";
  const token = authz.startsWith("Bearer ") ? authz.slice(7) : "";
  if (!token) return reply({ pro: false, until: null }, 401);

  const admin = createSupabaseAdminClient();

  const { data: userData, error } = await admin.auth.getUser(token);
  if (error || !userData.user) return reply({ pro: false, until: null }, 401);

  const { data: row } = await admin
    .from("subscriptions")
    .select("status, current_period_end")
    .eq("user_id", userData.user.id)
    .maybeSingle();

  const pro = isProFromRow(row, new Date());
  return reply({ pro, until: pro ? row!.current_period_end : null });
}
