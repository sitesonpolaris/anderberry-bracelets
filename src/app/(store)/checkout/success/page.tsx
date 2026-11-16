import type { Metadata } from "next";
import Link from "next/link";
import ClearCart from "@/components/cart/ClearCart";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Thank you", robots: { index: false } };

export default function Success() {
  return (
    <div className="wrap pb-40 pt-16 lg:pt-24">
      <ClearCart />
      <h1 className="max-w-4xl text-[clamp(3rem,7vw,6.5rem)]">Thank you. Your order is in.</h1>
      <p className="mt-8 max-w-xl text-[1.2rem] leading-relaxed">
        A receipt is on its way to your inbox. Amy and Aaron string every piece to order, so expect a shipping email in a few days.
        Questions? Write to{" "}
        <a href={`mailto:${site.email}`} className="link">
          {site.email}
        </a>
        .
      </p>
      <div className="mt-10 flex flex-wrap gap-4">
        <Link href="/shop" className="btn btn-ink">Keep shopping</Link>
        <Link href="/story" className="btn btn-quiet">Read our story</Link>
      </div>
    </div>
  );
}
