import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import CustomForm from "@/components/CustomForm";

export const metadata: Metadata = {
  title: "Custom and bulk logo orders",
  description: "Order custom logo bracelets, keychains, lapel pins and Tap-to-Connect NFC pieces for your business, event or chapter from AnderBerry in Charlotte, NC.",
  alternates: { canonical: "/custom" },
};

export default function CustomPage() {
  return (
    <div className="wrap pb-32 pt-10 lg:pb-44 lg:pt-16">
      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <h1 className="text-[clamp(3rem,6.4vw,6rem)]">Custom &amp; bulk orders</h1>
          <p className="mt-6 max-w-md text-[1.15rem] leading-relaxed">
            Logo bracelets for your staff, gift sets for your event, a Tap-to-Connect pin that opens your booking page. Tell us what you
            have in mind and we’ll reply by email with a price.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem]">
              <Image src="/products/gift-set-legalshield.webp" alt="Amethyst logo bracelet with a matching keychain and pin" fill sizes="(min-width: 1024px) 20vw, 50vw" className="object-cover" />
            </div>
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem]">
              <Image src="/products/logo-charm-novelty.webp" alt="Matte onyx bracelet with a red and black logo charm, worn" fill sizes="(min-width: 1024px) 20vw, 50vw" className="object-cover" />
            </div>
          </div>
        </div>
        <div className="lg:col-span-7">
          <Suspense>
            <CustomForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
