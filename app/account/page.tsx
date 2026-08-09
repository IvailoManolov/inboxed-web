"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    createSupabaseBrowserClient()
      .auth.getUser()
      .then(({ data }) => {
        setUser(data.user);
        setLoading(false);
      });
  }, []);

  async function manage() {
    setMsg(null);
    const res = await fetch("/api/portal", { method: "POST" });
    if (res.ok) {
      const { url } = (await res.json()) as { url?: string };
      if (url) window.location.href = url;
    } else if (res.status === 404) {
      setMsg("No active subscription found on this account.");
    } else {
      setMsg("Couldn't open the billing portal. Please try again.");
    }
  }

  async function signOut() {
    await createSupabaseBrowserClient().auth.signOut();
    setUser(null);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <h1 className="font-display text-3xl font-bold text-ink">Your account</h1>

      {loading ? (
        <p className="mt-4 text-ink-soft">Loading…</p>
      ) : user ? (
        <div className="mt-6 rounded-2xl border border-line bg-paper p-6">
          <p className="text-sm text-ink-soft">Signed in as</p>
          <p className="font-medium text-ink">{user.email}</p>

          {msg && <p className="mt-4 text-sm text-amber-900">{msg}</p>}

          <div className="mt-6 space-y-3">
            <button
              onClick={manage}
              className="w-full rounded-xl bg-coral py-3 font-semibold text-white transition hover:bg-coral-deep"
            >
              Manage subscription
            </button>
            <button
              onClick={signOut}
              className="w-full rounded-xl border border-line py-3 font-medium text-ink-soft transition hover:bg-cream"
            >
              Sign out
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-6 text-ink-soft">
          You&apos;re not signed in.{" "}
          <a href="/upgrade" className="text-coral underline">
            Go to upgrade
          </a>
        </p>
      )}
    </main>
  );
}
