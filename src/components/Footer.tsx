import Link from "next/link";
import { site, type CollectionRow } from "@/lib/site";
import { Badge } from "./Logo";
import { CurrentYear } from "./CurrentYear";

export default function Footer({ collections }: { collections: CollectionRow[] }) {
  return (
    <footer className="bg-onyx text-bone">
      <div className="wrap grid gap-14 pb-10 pt-24 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Badge className="h-40 w-40 text-bone sm:h-48 sm:w-48" />
          <p className="mt-8 max-w-sm text-lg text-ash">
            Hand-strung in {site.city}, {site.region} by Amy and Aaron Anderson since {site.founded}.
          </p>
          <a href={`mailto:${site.email}`} className="mt-3 inline-block text-lg underline underline-offset-4 hover:text-gold">
            {site.email}
          </a>
        </div>
        <nav aria-label="Shop" className="lg:col-span-3">
          <h2 className="font-sans text-base font-semibold tracking-normal">Shop</h2>
          <ul className="mt-4 space-y-3 text-ash">
            {collections.map((c) => (
              <li key={c.key}>
                <Link href={`/shop?c=${c.key}`} className="hover:text-bone">
                  {c.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/custom" className="hover:text-bone">
                Bulk & custom orders
              </Link>
            </li>
          </ul>
        </nav>
        <nav aria-label="About" className="lg:col-span-2">
          <h2 className="font-sans text-base font-semibold tracking-normal">AnderBerry</h2>
          <ul className="mt-4 space-y-3 text-ash">
            <li><Link href="/story" className="hover:text-bone">Our story</Link></li>
            <li><Link href="/shipping-returns" className="hover:text-bone">Shipping & returns</Link></li>
            <li><Link href="/privacy" className="hover:text-bone">Privacy</Link></li>
            <li><Link href="/terms" className="hover:text-bone">Terms</Link></li>
          </ul>
        </nav>
        <nav aria-label="Follow" className="lg:col-span-2">
          <h2 className="font-sans text-base font-semibold tracking-normal">Follow</h2>
          <ul className="mt-4 space-y-3 text-ash">
            <li><a href={site.social.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-bone">Instagram</a></li>
            <li><a href={site.social.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-bone">Facebook</a></li>
            <li><a href={site.social.tiktok} target="_blank" rel="noopener noreferrer" className="hover:text-bone">TikTok</a></li>
            <li><a href={site.social.etsy} target="_blank" rel="noopener noreferrer" className="hover:text-bone">Etsy</a></li>
          </ul>
        </nav>
      </div>
      <div className="wrap flex flex-col gap-2 pb-10 pt-6 text-sm text-ash sm:flex-row sm:justify-between">
        <span>
          © <CurrentYear /> {site.legalName}. All rights reserved.
        </span>
        <span>
          Designed by{" "}
          <a
            href="https://www.sitesonpolaris.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white/70 transition"
          >
            Sites on Polaris
          </a>
        </span>
      </div>
    </footer>
  );
}
