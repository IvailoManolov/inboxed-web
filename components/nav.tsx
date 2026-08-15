"use client";

import { useEffect, useState } from "react";
import { Mail, UserCircle2, Puzzle, Menu, X } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { EXTENSION_URL } from "@/lib/config";

const LINKS = [
  { href: "/#how", label: "How it works" },
  { href: "/#try", label: "Try it" },
  { href: "/story", label: "Story" },
  { href: "/stats", label: "The data" },
  { href: "/#pricing", label: "Pricing" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  // null = still checking; avoids flashing the wrong label on load.
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => setSignedIn(!!data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      setSignedIn(!!session?.user),
    );

    return () => {
      window.removeEventListener("scroll", onScroll);
      sub.subscription.unsubscribe();
    };
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled || menuOpen
          ? "border-b border-line bg-cream/80 backdrop-blur-md"
          : "border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <a href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-coral text-paper">
            <Mail className="h-[18px] w-[18px]" strokeWidth={2.4} />
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-ink">
            HitSend
          </span>
        </a>

        {/* desktop links */}
        <div className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-ink-soft transition-colors hover:text-ink"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3 sm:gap-5">
          {/* account/sign-in: desktop only; on mobile it lives in the menu */}
          {signedIn !== null &&
            (signedIn ? (
              <a
                href="/account"
                className="hidden items-center gap-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-ink md:inline-flex"
              >
                <UserCircle2 className="h-4 w-4" /> Account
              </a>
            ) : (
              <a
                href="/account"
                className="hidden text-sm font-medium text-ink-soft transition-colors hover:text-ink md:inline-flex"
              >
                Sign in
              </a>
            ))}

          {EXTENSION_URL ? (
            <a
              href={EXTENSION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-cream transition-transform hover:-translate-y-0.5 hover:bg-ink-soft"
            >
              <Puzzle className="h-4 w-4" /> Add to Chrome
            </a>
          ) : (
            <a
              href="/#try"
              className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-cream transition-transform hover:-translate-y-0.5 hover:bg-ink-soft"
            >
              Check an email
            </a>
          )}

          {/* mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-ink transition-colors hover:bg-cream-deep md:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* mobile dropdown panel */}
      {menuOpen && (
        <div className="border-t border-line bg-cream/95 backdrop-blur-md md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col px-3 py-3 sm:px-6">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-3 text-base font-medium text-ink-soft transition-colors hover:bg-cream-deep hover:text-ink"
              >
                {l.label}
              </a>
            ))}
            <a
              href="/account"
              onClick={() => setMenuOpen(false)}
              className="mt-1 flex items-center gap-2 border-t border-line px-3 pt-4 pb-2 text-base font-medium text-ink-soft transition-colors hover:text-ink"
            >
              <UserCircle2 className="h-4 w-4" />
              {signedIn ? "Account" : "Sign in"}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
