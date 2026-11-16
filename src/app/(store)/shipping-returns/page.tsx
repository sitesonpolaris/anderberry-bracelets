import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { moneyExact } from "@/lib/format";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Shipping & returns", alternates: { canonical: "/shipping-returns" } };

export default function Page() {
  return (
    <LegalPage title="Shipping & returns" updated="November 2026">
      <h2>Made to order</h2>
      <p>Every piece is strung by hand in Charlotte, NC after you order. {site.shipping.processing}.</p>
      <h2>Shipping</h2>
      <p>
        We ship within the United States. Standard shipping is {moneyExact(site.shipping.flatRateCents)}, and free on orders of{" "}
        {moneyExact(site.shipping.freeOverCents)} or more. You’ll get a tracking number by email when your order leaves us.
      </p>
      <h2>Sizing</h2>
      <p>If a bracelet doesn’t fit, email us within 14 days of delivery and we’ll restring it to your size.</p>
      <h2>Returns</h2>
      <p>
        Unworn gemstone bracelets can be returned within 14 days of delivery for a refund of the item price. Custom logo pieces and
        Tap-to-Connect pieces programmed with your link are made just for you and can’t be returned, but we’ll make it right if
        anything arrives damaged.
      </p>
      <p>
        Start a return or ask a question at <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>
    </LegalPage>
  );
}
