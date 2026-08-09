"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

/** Narrow view of the web-page-facing chrome messaging API (present in Chrome
 * when an extension lists this origin in externally_connectable). */
type ChromeExt = {
  runtime?: {
    sendMessage: (id: string, msg: unknown, cb?: (resp: unknown) => void) => void;
    lastError?: unknown;
  };
};

type HandoffState = "idle" | "sent" | "unavailable";

function SuccessInner() {
  const params = useSearchParams();
  const extId = params.get("ext_id") ?? undefined;
  const [state, setState] = useState<HandoffState>("idle");

  const handoff = useCallback(async () => {
    if (!extId) {
      setState("unavailable");
      return;
    }
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase.auth.getSession();
    const session = data.session;
    const chromeExt = (window as unknown as { chrome?: ChromeExt }).chrome;

    if (!session || !chromeExt?.runtime?.sendMessage) {
      setState("unavailable");
      return;
    }

    chromeExt.runtime.sendMessage(
      extId,
      {
        type: "INBOXED_AUTH",
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        expiresAt: session.expires_at ? session.expires_at * 1000 : undefined,
      },
      () => {
        // Ignore lastError — the message may still have been delivered.
        setState("sent");
      },
    );
    setState("sent");
  }, [extId]);

  useEffect(() => {
    void handoff();
  }, [handoff]);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16 text-center">
      <div className="text-5xl">🎉</div>
      <h1 className="mt-4 font-display text-3xl font-bold text-ink">You&apos;re Pro!</h1>
      <p className="mt-3 text-ink-soft">
        Thanks for upgrading. Inboxed Pro is now active on your account.
      </p>

      {state === "sent" && (
        <p className="mt-6 rounded-lg bg-green/10 px-4 py-3 text-sm text-green">
          Synced to your extension. Head back to Gmail — one-click fixes are unlocked.
        </p>
      )}

      {state === "unavailable" && (
        <div className="mt-6 rounded-lg bg-amber-100 px-4 py-3 text-sm text-amber-900">
          <p>We couldn&apos;t reach the extension automatically.</p>
          <button
            onClick={handoff}
            className="mt-3 rounded-lg bg-ink px-4 py-2 font-medium text-white"
          >
            Sync to extension
          </button>
          <p className="mt-2 text-xs">
            Make sure the Inboxed extension is installed in this browser, then click Sync.
          </p>
        </div>
      )}

      <a href="/account" className="mt-8 text-sm text-ink-soft underline">
        Manage your subscription
      </a>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessInner />
    </Suspense>
  );
}
