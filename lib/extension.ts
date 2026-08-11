/* Browser-side helpers for talking to the Inboxed extension and reading the
 * signed-in user's Pro status. Both run in the browser only (they touch
 * `window.chrome` and the Supabase browser session). */

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

/** Narrow view of the web-page-facing chrome messaging API (present in Chrome
 * when an extension lists this origin in externally_connectable). */
type ChromeExt = {
  runtime?: {
    sendMessage: (id: string, msg: unknown, cb?: (resp: unknown) => void) => void;
    lastError?: unknown;
  };
};

export type HandoffState = "idle" | "sent" | "unavailable";

/** Push the current Supabase session to the extension via externally_connectable.
 * Returns "sent" if we dispatched the token, "unavailable" if there's no ext id,
 * no session, or Chrome messaging isn't reachable (extension not installed). */
export async function connectExtension(
  extId: string | undefined,
): Promise<HandoffState> {
  if (!extId) return "unavailable";

  const supabase = createSupabaseBrowserClient();
  const { data } = await supabase.auth.getSession();
  const session = data.session;
  const chromeExt = (window as unknown as { chrome?: ChromeExt }).chrome;

  if (!session || !chromeExt?.runtime?.sendMessage) return "unavailable";

  chromeExt.runtime.sendMessage(extId, {
    type: "INBOXED_AUTH",
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    expiresAt: session.expires_at ? session.expires_at * 1000 : undefined,
  });
  // Ignore lastError — the message may still have been delivered.
  return "sent";
}

/** Ask our entitlement API whether the signed-in user is Pro (reads Stripe
 * live). Returns false if signed out or on any error. */
export async function fetchProStatus(): Promise<boolean> {
  const supabase = createSupabaseBrowserClient();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) return false;

  try {
    const res = await fetch("/api/entitlement", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return false;
    const j = (await res.json()) as { pro?: boolean };
    return !!j.pro;
  } catch {
    return false;
  }
}
