import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/* Public "talk to us" contact form. Writes to contact_inquiries via the
 * service role (RLS is on with no public policies, so the anon key can't touch
 * it). Protected by: email validation, a unique-email constraint (dedup), and
 * per-IP rate limiting (one submit / 30s, plus an hourly cap to stop floods). */

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RATE_WINDOW_MS = 30_000; // one submission per 30s per IP
const HOURLY_CAP = 5; // max submissions per IP per hour

function clientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex");
}

export async function POST(req: NextRequest) {
  let body: { email?: string; name?: string; message?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const name = (body.name ?? "").trim().slice(0, 120) || null;
  const message = (body.message ?? "").trim().slice(0, 2000) || null;

  if (!EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  const ipHash = hashIp(clientIp(req));
  const admin = createSupabaseAdminClient();
  const now = Date.now();

  // Rate limit: pull this IP's submissions in the last hour, then check both
  // the hourly cap and the 30-second window in one query.
  const { data: recent } = await admin
    .from("contact_inquiries")
    .select("created_at")
    .eq("ip_hash", ipHash)
    .gte("created_at", new Date(now - 3_600_000).toISOString());

  if (recent && recent.length >= HOURLY_CAP) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }
  if (
    recent?.some((r) => new Date(r.created_at).getTime() > now - RATE_WINDOW_MS)
  ) {
    return NextResponse.json(
      { error: "Please wait a moment before submitting again." },
      { status: 429 },
    );
  }

  const { error } = await admin
    .from("contact_inquiries")
    .insert({ email, name, message, ip_hash: ipHash });

  if (error) {
    // 23505 = unique_violation on email → this address already reached out.
    if (error.code === "23505") {
      return NextResponse.json(
        {
          error:
            "We already have an inquiry from this email — we'll be in touch soon.",
        },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
