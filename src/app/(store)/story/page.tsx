import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import VideoFacade from "@/components/VideoFacade";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Our story",
  description: "Aaron Anderson started AnderBerry Bracelets at seven to help his family find a home. Ten years on, he and his mom Amy still string every piece in Charlotte.",
  alternates: { canonical: "/story" },
};

export default function StoryPage() {
  const pbs = site.press[0];
  return (
    <>
      <section className="wrap grid gap-12 pb-24 pt-10 lg:grid-cols-12 lg:pb-32 lg:pt-16">
        <div className="lg:col-span-6">
          <h1 className="text-[clamp(3rem,7vw,6.5rem)]">Built from nothing, by hand</h1>
          <p className="mt-8 max-w-xl text-[1.2rem] leading-relaxed">
            In 2012 Amy Anderson left Atlanta for Charlotte with her son Aaron and his sister, leaving domestic violence behind. The next
            years brought homelessness, shelters, foster care and bullying. At church, Aaron learned to make bracelets from mini rubber
            bands. He was seven.
          </p>
        </div>
        <div className="lg:col-span-6">
          <VideoFacade id={pbs.youtubeId!} title={`${pbs.outlet}: AnderBerry Bracelets`} />
          <p className="mt-3 text-[0.95rem] text-hematite">PBS Charlotte, Carolina Impact, season 11, episode 1119.</p>
        </div>
      </section>

      <section aria-labelledby="idea-h" className="bg-oxblood text-bone">
        <div className="wrap grid gap-12 py-28 lg:grid-cols-12 lg:py-40">
          <h2 id="idea-h" className="text-[clamp(2.5rem,5.2vw,5rem)] lg:col-span-5">The idea that paid the rent</h2>
          <div className="space-y-8 lg:col-span-6 lg:col-start-7">
            <blockquote>
              <p className="font-display text-[clamp(1.5rem,2.3vw,2.1rem)] leading-snug">“{site.quotes.start}”</p>
              <footer className="mt-4 text-[#e5c9c3]">Aaron Anderson</footer>
            </blockquote>
            <p className="text-[1.15rem] leading-relaxed text-[#efdcd8]">
              Aaron sold at breweries, sports bars, parks, sidewalks and festivals around Charlotte, handing every customer a business
              card. The bracelets brought in enough for Amy to make AnderBerry her full-time work and support the family.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="now-h" className="wrap grid items-center gap-12 py-28 lg:grid-cols-12 lg:py-40">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] lg:col-span-5">
          <Image src="/products/onyx-tiger-in-hand.webp" alt="An onyx bracelet and a tiger eye bracelet held in an open hand" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
        </div>
        <div className="lg:col-span-6 lg:col-start-7">
          <h2 id="now-h" className="text-[clamp(2.5rem,5.2vw,5rem)]">Mother and son, still at the table</h2>
          <p className="mt-6 text-[1.15rem] leading-relaxed">
            Today Amy and Aaron string gemstone bracelets, Tap-to-Connect NFC jewelry and logo pieces for businesses and organizations,
            and share what they’ve learned about building something from nothing.
          </p>
          <blockquote className="mt-10">
            <p className="font-display text-[clamp(1.4rem,2vw,1.85rem)] leading-snug">“{site.quotes.goal}”</p>
            <footer className="mt-4 text-hematite">Aaron Anderson</footer>
          </blockquote>
          <Link href="/shop" className="btn btn-ink mt-10">Shop bracelets</Link>
        </div>
      </section>

      <section aria-labelledby="press-h2" className="bg-bone-2">
        <div className="wrap py-24 lg:py-32">
          <h2 id="press-h2" className="text-[clamp(2.25rem,4vw,3.75rem)]">In the news</h2>
          <ul className="mt-10 grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            {site.press.map((p) => (
              <li key={p.url}>
                <a href={p.url} target="_blank" rel="noopener noreferrer" className="group block">
                  <span className="font-semibold">{p.outlet}</span>
                  <span className="block text-hematite group-hover:text-onyx group-hover:underline">{p.title}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
