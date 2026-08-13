import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { Reveal } from "@/components/reveal";
import { ShieldCheck, MonitorSmartphone, EyeOff, Ban, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Data & Security — BeSeen",
  description:
    "How BeSeen handles your data. Your emails are analyzed on your device and never sold. Plain-English, no fine print.",
};

const PILLARS = [
  {
    Icon: MonitorSmartphone,
    title: "Analyzed on your device",
    body: "The scoring engine runs locally in your browser. The text of your emails is checked where you type it — it doesn’t need to travel to us.",
  },
  {
    Icon: Ban,
    title: "Never sold, ever",
    body: "We don’t sell your data or your email content to anyone. That’s not our business model — subscriptions are.",
  },
  {
    Icon: EyeOff,
    title: "No AI reading your mail",
    body: "BeSeen uses deterministic rules — the same kind spam filters use — not a large language model. Nothing gets sent off to be “trained on.”",
  },
];

export default function DataSecurityPage() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <section className="bg-grain border-b border-line">
          <div className="mx-auto max-w-3xl px-5 py-16 text-center sm:px-8 sm:py-24">
            <a
              href="/"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-coral transition-colors hover:text-coral-deep"
            >
              <ArrowLeft className="h-4 w-4" /> Back home
            </a>
            <div className="mt-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-coral-soft text-coral">
              <ShieldCheck className="h-7 w-7" strokeWidth={2.2} />
            </div>
            <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
              Your emails stay yours.
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-ink-soft">
              We built BeSeen so you never have to trade privacy for a better
              inbox rate. Here’s exactly how your data is handled — in plain
              English.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="grid gap-6 md:grid-cols-3">
            {PILLARS.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.1}>
                <div className="h-full rounded-[var(--radius-xl)] border border-line bg-paper p-7 shadow-soft">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-coral-soft text-coral">
                    <p.Icon className="h-6 w-6" strokeWidth={2.2} />
                  </div>
                  <h2 className="mt-5 font-display text-lg font-bold text-ink">
                    {p.title}
                  </h2>
                  <p className="mt-2 text-base leading-relaxed text-ink-soft">
                    {p.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <div className="mx-auto mt-16 max-w-2xl">
              <h2 className="font-display text-2xl font-bold text-ink">
                Gmail &amp; Google Limited Use
              </h2>
              <p className="mt-3 text-base leading-relaxed text-ink-soft">
                When you connect the BeSeen extension to Gmail, we only touch the
                email you’re actively composing, and only to score it. Our use of
                data received from Google APIs follows the{" "}
                <a
                  href="https://developers.google.com/terms/api-services-user-data-policy"
                  className="font-medium text-coral underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Google API Services User Data Policy
                </a>
                , including its Limited Use requirements: no selling, no ads, no
                human reading your mail, no transfers except as you direct or the
                law requires.
              </p>

              <h2 className="mt-12 font-display text-2xl font-bold text-ink">
                What we do collect
              </h2>
              <p className="mt-3 text-base leading-relaxed text-ink-soft">
                To run your account we store your email address and (via Stripe)
                your subscription status. We also look at anonymous, aggregated
                usage — like how many checks ran — which never contains the text
                of your emails. The full detail lives in our{" "}
                <a href="/privacy" className="font-medium text-coral underline">
                  Privacy Policy
                </a>
                .
              </p>

              <div className="mt-12 rounded-[var(--radius-xl)] border border-line bg-cream-deep/40 p-6">
                <p className="text-base leading-relaxed text-ink-soft">
                  Have a security question, or want to report something? Email{" "}
                  <span className="font-semibold text-ink">hello@beseen.app</span>{" "}
                  — a real person will answer.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </main>
      <Footer />
    </>
  );
}
