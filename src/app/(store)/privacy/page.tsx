import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy policy", alternates: { canonical: "/privacy" } };

export default function Page() {
  return (
    <LegalPage title="Privacy policy" updated="November 2026">
      <p>
        {site.legalName} (“AnderBerry”, “we”) runs this website. This policy explains what we collect when you shop or contact us,
        and what we do with it.
      </p>
      <h2>What we collect</h2>
      <p>
        When you check out, our payment processor Stripe collects your name, email, phone, shipping address and payment details. We
        receive your name, email, phone, address and what you ordered so we can make and ship it. We never see or store your full card
        number.
      </p>
      <p>When you send a custom request, we store what you type into the form.</p>
      <h2>How we use it</h2>
      <p>To make and ship your order, reply to your request, and send you receipts and shipping updates. We don’t sell your information.</p>
      <h2>Who we share it with</h2>
      <p>
        Stripe (payments), Supabase (our order database), Netlify (website hosting) and the shipping carrier that delivers your
        package. Videos on this site load from YouTube only after you press play.
      </p>
      <h2>Your choices</h2>
      <p>
        Your cart is saved in your browser so it’s there when you come back. To see, correct or delete the information we hold about
        you, email <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>
    </LegalPage>
  );
}
