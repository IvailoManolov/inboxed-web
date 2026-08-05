"use client";

import { useEffect, useState } from "react";
import { Mail } from "lucide-react";

const LINKS = [
  { href: "/#how", label: "How it works" },
  { href: "/#try", label: "Try it" },
  { href: "/stats", label: "The data" },
  { href: "/#pricing", label: "Pricing" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
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
            Inboxed
          </span>
        </a>

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

        <a
          href="/#try"
          className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-cream transition-transform hover:-translate-y-0.5 hover:bg-ink-soft"
        >
          Check an email
        </a>
      </nav>
    </header>
  );
}
