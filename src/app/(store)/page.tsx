import Image from "next/image";
import Link from "next/link";
import BraceletHero from "@/components/bracelet/BraceletHero";
import ProductCard from "@/components/ProductCard";
import OrgJsonLd from "@/components/OrgJsonLd";
import VideoFacade from "@/components/VideoFacade";
import { Badge } from "@/components/Logo";
import { getCollections, getProducts } from "@/lib/products";
import { site } from "@/lib/site";

export const revalidate = 300;

const words = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];

const milestones = [
  { when: "2012", what: "Amy, Aaron and his sister move from Atlanta to Charlotte to start over." },
  { when: "2014", what: "Aaron, age seven, learns to make rubber-band bracelets at church and starts selling them to help get the family a home." },
  { when: "2017", what: "AnderBerry opens its Etsy shop." },
  { when: "Age 12", what: "Charlotte Is Creative backs Aaron with a HUG micro-grant." },
  { when: "Ten years in", what: "PBS Carolina Impact tells how the bracelets carried the family through." },
  { when: "Now", what: "Tap-to-Connect NFC jewelry and custom logo pieces for organizations." },
];

export default async function Home() {
  const [products, collections] = await Promise.all([getProducts(), getCollections()]);
  const [lead, ...rest] = collections;
  const customKey = collections.find((c) => c.key === "custom")?.key;
  const featured = products.filter((p) => p.featured).slice(0, 4);
  const pbs = site.press[0];

  return (
    <>
      <OrgJsonLd />
      {/* Hero: the strand you can turn and restring */}
      <section className="wrap grid items-center gap-10 pb-24 pt-6 lg:grid-cols-12 lg:gap-12 lg:pb-32 lg:pt-10">
        <div className="min-w-0 lg:col-span-5">
          <h1 className="text-[clamp(3rem,6vw,6.25rem)]"><span className="whitespace-nowrap">Hand-strung</span> since 2014</h1>
          <p className="mt-8 max-w-[34rem] text-[1.2rem] leading-relaxed">
            Gemstone bracelets, Tap-to-Connect NFC jewelry and custom logo pieces, made in Charlotte, NC by Amy Anderson and her son
            Aaron, who started AnderBerry at seven.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
            <Link href="/shop" className="btn btn-ink">
              Shop bracelets
            </Link>
            <Link href="/custom" className="link text-[1.05rem] font-medium">
              Order custom pieces
            </Link>
          </div>
        </div>
        <div className="min-w-0 lg:col-span-7">
          <BraceletHero />
        </div>
      </section>

      {/* Collections (managed in /admin/collections) */}
      {lead && (
        <section aria-labelledby="collections-h" className="wrap pb-32 lg:pb-44">
          <h2 id="collections-h" className="max-w-3xl text-[clamp(2.5rem,5.2vw,5rem)]" data-reveal>
            {collections.length === 1 ? "One way to wear it" : collections.length <= 10 ? `${words[collections.length]} ways to wear it` : "Every way to wear it"}
          </h2>
          <div className="mt-14 grid gap-5 lg:grid-cols-12">
            <Link
              href={`/shop?c=${lead.key}`}
              className={`group relative block overflow-hidden rounded-[2rem] bg-onyx text-bone ${rest.length ? "lg:col-span-7" : "lg:col-span-12"}`}
              style={rest.length ? { gridRow: `span ${rest.length} / span ${rest.length}` } : undefined}
              data-reveal
            >
              <div className="relative aspect-[4/3] lg:aspect-auto lg:h-full lg:min-h-[40rem]">
                {lead.image ? (
                  <Image src={lead.image} alt={`${lead.name} collection`} fill sizes="(min-width: 1024px) 58vw, 100vw" className="img-lift object-cover" />
                ) : (
                  <div className="absolute inset-0 grid place-items-center pb-24"><Badge className="h-40 w-40 opacity-80" title="" /></div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-onyx/80 p-6 sm:p-8">
                  <h3 className="text-[clamp(2rem,3.4vw,3.25rem)]">{lead.name}</h3>
                  {lead.blurb && <p className="mt-2 max-w-md text-ash">{lead.blurb}</p>}
                </div>
              </div>
            </Link>
            {rest.map((c, i) => (
              <Link
                key={c.key}
                href={`/shop?c=${c.key}`}
                className="group grid grid-cols-[7.5rem_1fr] items-center gap-5 rounded-[2rem] bg-bone-2 p-3 pr-6 transition-colors hover:bg-bone-3 sm:grid-cols-[10rem_1fr] lg:col-span-5"
                data-reveal
                style={{ ["--i" as string]: Math.min(i + 1, 4) }}
              >
                <div className="relative aspect-square overflow-hidden rounded-[1.5rem] bg-onyx">
                  {c.image ? (
                    <Image src={c.image} alt="" fill sizes="160px" className="img-lift object-cover" />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center text-bone"><Badge className="h-16 w-16 opacity-80" title="" /></div>
                  )}
                </div>
                <div>
                  <h3 className="text-[2rem]">{c.name}</h3>
                  {c.blurb && <p className="mt-1 text-[0.98rem]">{c.blurb}</p>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured */}
      <section aria-labelledby="featured-h" className="wrap pb-32 lg:pb-44">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 id="featured-h" className="text-[clamp(2.5rem,5.2vw,5rem)]" data-reveal>
            Most asked for
          </h2>
          <Link href="/shop" className="link text-[1.05rem] font-medium" data-reveal>
            See every piece
          </Link>
        </div>
        <div className="mt-12 grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p, i) => (
            <ProductCard key={p.id} product={p} i={i} />
          ))}
        </div>
      </section>

      {/* Tap-to-Connect */}
      <section aria-labelledby="ttc-h" className="bg-onyx text-bone">
        <div className="wrap grid items-center gap-12 py-28 lg:grid-cols-12 lg:py-40">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] lg:col-span-6" data-reveal>
            <Image src="/products/ttc-onyx-worn.webp" alt="A woman wearing an onyx Tap-to-Connect bracelet with a copper NFC coil set in its square centerpiece" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <h2 className="text-[clamp(2.5rem,5.2vw,5rem)]" data-reveal>
              One tap shares your link
            </h2>
            <p className="mt-6 text-[1.15rem] leading-relaxed text-ash" data-reveal style={{ ["--i" as string]: 1 }}>
              A small NFC chip sits under the stone face of the centerpiece. Hold any modern phone against it and your link opens. No
              app, no battery, no charging.
            </p>
            <ol className="mt-10 space-y-6" data-reveal style={{ ["--i" as string]: 2 }}>
              {[
                ["Pick your stones", "Tiger eye, onyx, jasper or your logo on the charm."],
                ["Send us your link", "Your website, socials, a music video or a Google review page. One link at a time."],
                ["Tap and share", "Anyone you meet holds their phone to your wrist and you’re connected."],
              ].map(([t, d]) => (
                <li key={t} className="grid grid-cols-[2.25rem_1fr] gap-4">
                  <span aria-hidden className="mt-1.5 h-5 w-5 rounded-full bg-gold" />
                  <div>
                    <h3 className="font-sans text-[1.15rem] font-semibold tracking-normal">{t}</h3>
                    <p className="text-ash">{d}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Link href="/shop/tap-to-connect-bracelet" className="btn btn-gold mt-12" data-reveal style={{ ["--i" as string]: 3 }}>
              Shop Tap-to-Connect
            </Link>
          </div>
        </div>
      </section>

      {/* Story, told as a strand */}
      <section aria-labelledby="story-h" className="bg-oxblood text-bone">
        <div className="wrap py-28 lg:py-40">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <h2 id="story-h" className="text-[clamp(2.5rem,5.2vw,5rem)]" data-reveal>
                Started at seven, to find a home
              </h2>
              <blockquote className="mt-10 max-w-xl" data-reveal style={{ ["--i" as string]: 1 }}>
                <p className="font-display text-[clamp(1.5rem,2.3vw,2.1rem)] leading-snug">“{site.quotes.start}”</p>
                <footer className="mt-4 text-rose-2">Aaron Anderson, co-founder</footer>
              </blockquote>
              <Link href="/story" className="btn btn-bone mt-10" data-reveal style={{ ["--i" as string]: 2 }}>
                Read the whole story
              </Link>
            </div>
            <div className="relative lg:col-span-5 lg:col-start-8">
            <span aria-hidden className="absolute bottom-3 left-[0.6875rem] top-3 w-[3px] rounded-full bg-oxblood-line" />
            <ol className="relative" aria-label="AnderBerry milestones">
              {milestones.map((m, i) => (
                <li key={m.what} className="relative grid grid-cols-[2.5rem_1fr] gap-4 pb-8 last:pb-0" data-reveal style={{ ["--i" as string]: i }}>
                  <span aria-hidden className={`relative mt-1 h-6 w-6 rounded-full ${i === milestones.length - 1 ? "bg-gold" : "bg-bone"}`} />
                  <div>
                    <h3 className="font-sans text-[1.05rem] font-semibold tracking-normal">{m.when}</h3>
                    <p className="text-rose">{m.what}</p>
                  </div>
                </li>
              ))}
            </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Organizations */}
      <section aria-labelledby="org-h" className="wrap py-32 lg:py-44">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 id="org-h" className="text-[clamp(2.5rem,5.2vw,5rem)]" data-reveal>
              Your logo on every wrist
            </h2>
            <p className="mt-6 max-w-lg text-[1.15rem] leading-relaxed" data-reveal style={{ ["--i" as string]: 1 }}>
              Businesses, bars, event series, chapters and families order AnderBerry logo pieces: bracelets, keychains and lapel pins,
              boxed as gift sets, with an NFC chip if you want one. Send your logo and how many you need, and we’ll reply with a quote.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4" data-reveal style={{ ["--i" as string]: 2 }}>
              <Link href="/custom" className="btn btn-ink">
                Get a bulk quote
              </Link>
              <Link href={customKey ? `/shop?c=${customKey}` : "/shop"} className="link font-medium">
                See logo pieces
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:col-span-7">
            <div className="relative col-span-2 aspect-[16/10] overflow-hidden rounded-[2rem] sm:col-span-1 sm:row-span-2 sm:aspect-auto" data-reveal>
              <Image src="/products/gift-set-rnb.webp" alt="Logo gift set: an onyx and red jasper bracelet, a square keychain and a round pin, boxed" fill sizes="(min-width: 1024px) 30vw, 100vw" className="object-cover" />
            </div>
            <div className="relative aspect-square overflow-hidden rounded-[2rem]" data-reveal style={{ ["--i" as string]: 1 }}>
              <Image src="/products/logo-charm-agate.webp" alt="Matte agate bracelet with hematite spacers and a domed logo charm" fill sizes="(min-width: 1024px) 28vw, 50vw" className="object-cover" />
            </div>
            <div className="relative aspect-square overflow-hidden rounded-[2rem]" data-reveal style={{ ["--i" as string]: 2 }}>
              <Image src="/products/lapel-pin-coat.webp" alt="A round logo lapel pin on a camel coat" fill sizes="(min-width: 1024px) 28vw, 50vw" className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Press */}
      <section aria-labelledby="press-h" className="bg-bone-2">
        <div className="wrap grid items-center gap-12 py-28 lg:grid-cols-12 lg:py-36">
          <div className="lg:col-span-7" data-reveal>
            <VideoFacade id={pbs.youtubeId!} title={`${pbs.outlet}: AnderBerry Bracelets`} />
          </div>
          <div className="lg:col-span-4 lg:col-start-9">
            <h2 id="press-h" className="text-[clamp(2.25rem,4vw,3.75rem)]" data-reveal>
              As seen on PBS
            </h2>
            <ul className="mt-8 space-y-4">
              {site.press.map((p, i) => (
                <li key={p.url} data-reveal style={{ ["--i" as string]: i }}>
                  <a href={p.url} target="_blank" rel="noopener noreferrer" className="group block">
                    <span className="font-semibold">{p.outlet}</span>
                    <span className="block text-hematite group-hover:text-onyx group-hover:underline">{p.title}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Close */}
      <section aria-labelledby="close-h" className="wrap grid items-center gap-12 py-32 lg:grid-cols-12 lg:py-40">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] lg:order-2 lg:col-span-4 lg:col-start-9" data-reveal>
          <Image src="/products/logo-charm-pk.webp" alt="A tiger eye bracelet with a gold monogram charm, worn" fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover" />
        </div>
        <div className="lg:order-1 lg:col-span-7">
        <h2 id="close-h" className="sr-only">Start your strand</h2>
        <blockquote className="max-w-4xl" data-reveal>
          <p className="font-display text-[clamp(1.6rem,2.6vw,2.25rem)] leading-snug">“{site.quotes.no}”</p>
          <footer className="mt-5 text-hematite">Aaron Anderson</footer>
        </blockquote>
        <div className="mt-12 flex flex-wrap gap-4" data-reveal style={{ ["--i" as string]: 1 }}>
          <Link href="/shop" className="btn btn-ink">
            Shop bracelets
          </Link>
          <Link href="/custom" className="btn btn-quiet">
            Order custom pieces
          </Link>
        </div>
        </div>
      </section>
    </>
  );
}
