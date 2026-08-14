import { Puzzle } from "lucide-react";
import { EXTENSION_URL } from "@/lib/config";

/* The install CTA. One component, two states:
 *  - live  (NEXT_PUBLIC_EXTENSION_URL set): links to the Web Store listing.
 *  - soft  (not set yet): a muted "coming soon" pill so the funnel never
 *    shows a dead button before the extension is approved.
 * Reads a build-time constant, so flipping it on = set the env var + redeploy. */

type Variant = "primary" | "secondary";

const VARIANT: Record<Variant, string> = {
  primary:
    "bg-coral text-paper shadow-lift hover:-translate-y-0.5 hover:bg-coral-deep",
  secondary: "border border-line bg-paper text-ink hover:bg-cream-deep",
};

export function AddToChrome({
  variant = "primary",
  label = "Add to Chrome — free",
  block = false,
  className = "",
}: {
  variant?: Variant;
  label?: string;
  block?: boolean;
  className?: string;
}) {
  const shape = `${
    block ? "flex w-full" : "inline-flex"
  } items-center justify-center gap-2 rounded-full px-6 py-3 text-base font-semibold transition-transform`;

  if (!EXTENSION_URL) {
    return (
      <span
        className={`${shape} cursor-default border border-dashed border-line bg-cream text-muted ${className}`}
      >
        <Puzzle className="h-4 w-4" /> On the Chrome Web Store soon
      </span>
    );
  }

  return (
    <a
      href={EXTENSION_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`${shape} ${VARIANT[variant]} ${className}`}
    >
      <Puzzle className="h-4 w-4" /> {label}
    </a>
  );
}
