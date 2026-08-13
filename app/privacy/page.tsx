import type { Metadata } from "next";
import { LegalShell, H2, P, UL, LI } from "@/components/legal";

export const metadata: Metadata = {
  title: "Privacy Policy — BeSeen",
  description:
    "How BeSeen handles your data. Your email content is analyzed locally and never sold. Google Limited Use disclosure included.",
};

export default function PrivacyPage() {
  return (
    <LegalShell
      title="Privacy Policy"
      updated="August 5, 2026"
      intro="BeSeen is built privacy-first. Your email content is analyzed on your own device and is never sold. This policy explains exactly what we collect, why, and the choices you have."
    >
      <H2>Who we are</H2>
      <P>
        BeSeen (“we”, “us”) provides a spam-risk checker for email, available as
        a web tool and a browser extension at beseen.app. For any privacy
        question, contact us at hello@beseen.app.
      </P>

      <H2>What we collect</H2>
      <UL>
        <LI>
          <strong>Account data</strong> — if you create an account: your email
          address and authentication details.
        </LI>
        <LI>
          <strong>Billing data</strong> — handled by our payment processor
          (Stripe). We never see or store your full card number.
        </LI>
        <LI>
          <strong>Product usage</strong> — anonymous, aggregated events (e.g.
          “a check was run”) to improve the product. No email content is
          included.
        </LI>
        <LI>
          <strong>Email content</strong> — the text of emails you check is
          scored <strong>locally, on your device</strong>. We do not transmit,
          store, or read the content of your emails.
        </LI>
      </UL>

      <H2>Google user data &amp; Limited Use</H2>
      <P>
        If you connect the BeSeen extension to Gmail, its use of information
        received from Google APIs adheres to the{" "}
        <a
          href="https://developers.google.com/terms/api-services-user-data-policy"
          className="font-medium text-coral underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Google API Services User Data Policy
        </a>
        , including the Limited Use requirements. Specifically:
      </P>
      <UL>
        <LI>We only access Gmail data needed to score the email you are composing.</LI>
        <LI>We do not transfer or sell Google user data to third parties.</LI>
        <LI>We do not use Google user data for advertising.</LI>
        <LI>No humans read your Google user data, except where you explicitly ask us to for support, or where required by law.</LI>
      </UL>

      <H2>How we use data</H2>
      <UL>
        <LI>To operate the checker and show you results.</LI>
        <LI>To provide, secure, and improve the service.</LI>
        <LI>To communicate with you about your account and updates you opt into.</LI>
      </UL>

      <H2>Sharing</H2>
      <P>
        We do not sell your personal data. We share it only with the service
        providers that run our product (e.g. hosting, Stripe for payments) under
        contracts that require them to protect it.
      </P>

      <H2>Retention</H2>
      <P>
        We keep account data while your account is active and delete it within a
        reasonable period after you close your account, unless we must keep it to
        meet a legal obligation.
      </P>

      <H2>Your rights</H2>
      <P>
        Depending on where you live (e.g. under GDPR or CCPA), you may have the
        right to access, correct, export, or delete your data, and to object to
        certain processing. To exercise any of these, email hello@beseen.app.
      </P>

      <H2>Security</H2>
      <P>
        We use industry-standard measures to protect your data. Because email
        content is processed locally, the most sensitive data usually never
        leaves your browser. No system is perfectly secure, but we work hard to
        keep yours safe.
      </P>

      <H2>Changes</H2>
      <P>
        We may update this policy. If we make material changes, we’ll update the
        date above and, where appropriate, notify you.
      </P>

      <H2>Contact</H2>
      <P>Questions? Email hello@beseen.app and we’ll help.</P>
    </LegalShell>
  );
}
