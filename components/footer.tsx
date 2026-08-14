import { Mail, ArrowRight } from "lucide-react";
import { Reveal } from "./reveal";

export function Footer() {
  return (
    <footer className="bg-ink text-cream">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              Write it. Score it. Land in the inbox.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-lg text-cream/70">
              Stop letting good emails die in spam. Check your first one in the
              next 60 seconds.
            </p>
            <a
              href="#try"
              className="group mt-8 inline-flex items-center gap-2 rounded-full bg-coral px-6 py-3 text-base font-semibold text-paper shadow-lift transition-transform hover:-translate-y-0.5 hover:bg-coral-deep"
            >
              Check my email - free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>
        </Reveal>

        <div className="mt-16 flex flex-col gap-6 border-t border-cream/10 pt-8">
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-cream/70">
            <a href="/#how" className="transition-colors hover:text-cream">How it works</a>
            <a href="/stats" className="transition-colors hover:text-cream">The data</a>
            <a href="/#pricing" className="transition-colors hover:text-cream">Pricing</a>
            <a href="/data-security" className="transition-colors hover:text-cream">Data &amp; Security</a>
            <a href="/privacy" className="transition-colors hover:text-cream">Privacy</a>
            <a href="/terms" className="transition-colors hover:text-cream">Terms</a>
          </nav>
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-coral text-paper">
                <Mail className="h-[18px] w-[18px]" strokeWidth={2.4} />
              </span>
              <span className="font-display text-lg font-bold">HitSend</span>
            </div>
            <p className="text-sm text-cream/50">
              © {new Date().getFullYear()} HitSend. Land in the inbox, not the
              folder no one opens.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
