import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Terms of sale", alternates: { canonical: "/terms" } };

export default function Page() {
  return (
    <LegalPage title="Terms of sale" updated="November 2026">
      <p>By ordering from {site.legalName} you agree to these terms.</p>
      <h2>Handmade goods</h2>
      <p>
        Natural stones vary in color, banding and size, so your piece will differ slightly from the photos. That’s what makes it
        yours.
      </p>
      <h2>Prices and payment</h2>
      <p>Prices are in US dollars. Payment is taken by Stripe when you place your order.</p>
      <h2>Custom and logo work</h2>
      <p>
        You confirm you have the right to use any logo or image you send us. We may decline artwork we can’t reproduce well or that
        we aren’t comfortable making.
      </p>
      <h2>Tap-to-Connect</h2>
      <p>
        The NFC chip opens one link at a time. Reading it needs a phone with NFC turned on. Tell us if you need your link changed.
      </p>
      <h2>Contact</h2>
      <p>
        <a href={`mailto:${site.email}`}>{site.email}</a>
      </p>
    </LegalPage>
  );
}
