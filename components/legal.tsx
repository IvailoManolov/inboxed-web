import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Nav } from "./nav";
import { Footer } from "./footer";

/* Shared shell for Privacy / Terms / Data & Security.
   NOTE: placeholder entity (HitSend), domain (hitsend.app) and contact
   (hello@hitsend.app) - replace with real details + legal review before launch. */

export function LegalShell({
  title,
  updated,
  intro,
  children,
}: {
  title: string;
  updated: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-coral transition-colors hover:text-coral-deep"
          >
            <ArrowLeft className="h-4 w-4" /> Back home
          </a>
          <h1 className="mt-5 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
            {title}
          </h1>
          <p className="mt-3 text-sm text-muted">Last updated {updated}</p>
          {intro && (
            <p className="mt-6 text-lg leading-relaxed text-ink-soft">{intro}</p>
          )}
          <div className="mt-10">{children}</div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export function H2({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-3 mt-10 font-display text-xl font-bold text-ink">
      {children}
    </h2>
  );
}

export function P({ children }: { children: ReactNode }) {
  return <p className="mb-4 text-base leading-relaxed text-ink-soft">{children}</p>;
}

export function UL({ children }: { children: ReactNode }) {
  return <ul className="mb-4 space-y-2">{children}</ul>;
}

export function LI({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-2.5 text-base leading-relaxed text-ink-soft">
      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-coral" />
      <span>{children}</span>
    </li>
  );
}
