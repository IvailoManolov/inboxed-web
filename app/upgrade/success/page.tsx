"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { connectExtension, type HandoffState } from "@/lib/extension";

function SuccessInner() {
  const params = useSearchParams();
  const extId = params.get("ext_id") ?? undefined;
  const [state, setState] = useState<HandoffState>("idle");

  const handoff = useCallback(async () => {
    setState(await connectExtension(extId));
  }, [extId]);

  useEffect(() => {
    void handoff();
  }, [handoff]);

  return (
    <main className="bg-grain flex min-h-screen flex-col items-center justify-center px-5 py-16">
      <div className="w-full max-w-md rounded-[var(--radius-2xl)] border border-line bg-paper p-8 text-center shadow-lift">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-coral-soft text-4xl">
          🎉
        </div>
        <h1 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-ink">
          You&apos;re Pro!
        </h1>
        <p className="mt-3 text-ink-soft">
          Thanks for upgrading. Inboxed Pro is now active on your account.
        </p>

        {state === "sent" && (
          <p className="mt-6 rounded-[var(--radius-xl)] border border-green/20 bg-green-soft px-4 py-3 text-sm font-medium text-green">
            ✓ Synced to your extension. Head back to Gmail — one-click fixes are
            unlocked.
          </p>
        )}

        {state === "unavailable" && (
          <div className="mt-6 rounded-[var(--radius-xl)] border border-amber/30 bg-amber/10 px-4 py-4 text-sm text-ink-soft">
            <p>We couldn&apos;t reach the extension automatically.</p>
            <button
              onClick={handoff}
              className="mt-3 rounded-full bg-ink px-5 py-2.5 font-semibold text-paper transition-transform hover:-translate-y-0.5"
            >
              Sync to extension
            </button>
            <p className="mt-3 text-xs text-muted">
              Make sure the Inboxed extension is installed in this browser, then
              click Sync.
            </p>
          </div>
        )}

        <div className="mt-8 space-y-3">
          <a
            href="https://mail.google.com"
            className="block w-full rounded-full bg-coral py-3.5 font-semibold text-paper shadow-lift transition-transform hover:-translate-y-0.5 hover:bg-coral-deep"
          >
            Back to Gmail
          </a>
          <a
            href="/account"
            className="block w-full rounded-full border border-line py-3.5 font-medium text-ink-soft transition hover:bg-cream-deep"
          >
            Manage subscription
          </a>
        </div>
      </div>
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
