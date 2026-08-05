import type { Metadata } from "next";
import { LegalShell, H2, P, UL, LI } from "@/components/legal";

export const metadata: Metadata = {
  title: "Terms of Service — Inboxed",
  description: "The terms for using Inboxed.",
};

export default function TermsPage() {
  return (
    <LegalShell
      title="Terms of Service"
      updated="August 5, 2026"
      intro="These terms are the agreement between you and Inboxed when you use our website, web tool, or browser extension. By using Inboxed, you agree to them."
    >
      <H2>The service</H2>
      <P>
        Inboxed analyzes email text and flags content that may trigger spam
        filters, with suggestions to improve it. It is a helpful guide, not a
        guarantee — deliverability depends on many factors outside our control
        (your domain reputation, the recipient’s provider, and more).
      </P>

      <H2>Your account</H2>
      <UL>
        <LI>You’re responsible for keeping your login secure.</LI>
        <LI>You must provide accurate information and be old enough to form a contract in your country.</LI>
      </UL>

      <H2>Plans &amp; billing</H2>
      <UL>
        <LI>Paid plans are billed in advance on a recurring basis (monthly or yearly) through our payment processor, Stripe.</LI>
        <LI>You can cancel anytime; your plan stays active until the end of the current billing period.</LI>
        <LI>Except where required by law, payments are non-refundable.</LI>
      </UL>

      <H2>Acceptable use</H2>
      <P>You agree not to:</P>
      <UL>
        <LI>Use Inboxed to send spam, phishing, or unlawful email, or to evade anti-abuse systems.</LI>
        <LI>Reverse engineer, resell, or copy the service or its rule set.</LI>
        <LI>Disrupt or attempt to gain unauthorized access to our systems.</LI>
      </UL>

      <H2>Intellectual property</H2>
      <P>
        Inboxed and its content, branding, and scoring engine are owned by us.
        You keep full ownership of the email content you check.
      </P>

      <H2>Disclaimer</H2>
      <P>
        The service is provided “as is,” without warranties of any kind. We don’t
        promise that any email you send will reach the inbox.
      </P>

      <H2>Limitation of liability</H2>
      <P>
        To the fullest extent permitted by law, Inboxed is not liable for
        indirect or consequential damages, and our total liability is limited to
        the amount you paid us in the 12 months before the claim.
      </P>

      <H2>Termination</H2>
      <P>
        You can stop using Inboxed anytime. We may suspend or end access if these
        terms are broken.
      </P>

      <H2>Changes</H2>
      <P>
        We may update these terms; we’ll change the date above when we do.
        Continued use means you accept the updated terms.
      </P>

      <H2>Contact</H2>
      <P>Questions about these terms? Email hello@inboxed.app.</P>
    </LegalShell>
  );
}
