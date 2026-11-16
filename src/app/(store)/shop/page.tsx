import type { Metadata } from "next";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getCollections, getProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Shop bracelets, Tap-to-Connect and logo pieces",
  description: "Shop hand-strung gemstone bracelets, Tap-to-Connect NFC jewelry, custom logo bracelets and pins from AnderBerry in Charlotte, NC.",
  alternates: { canonical: "/shop" },
};

export default async function Shop({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  const { c } = await searchParams;
  const collections = await getCollections();
  const active = collections.find((x) => x.key === c);
  const products = await getProducts(active?.key);
  const current = active?.key;
  const heading = active ? active.name : "Every piece";
  const blurb = active?.blurb || "Each bracelet is strung by hand in Charlotte and sized to your wrist.";

  const tabs: { key: string | undefined; name: string }[] = [{ key: undefined, name: "All" }, ...collections];

  return (
    <div className="wrap pb-32 pt-10 lg:pb-44 lg:pt-16">
      <h1 className="text-[clamp(3rem,7vw,6.5rem)]">{heading}</h1>
      <p className="mt-5 max-w-xl text-[1.15rem]">{blurb}</p>

      <nav aria-label="Collections" className="scrollbar-none -mx-1 mt-10 flex gap-2 overflow-x-auto px-1 pb-1">
        {tabs.map((t) => {
          const on = t.key === current;
          return (
            <Link
              key={t.name}
              href={t.key ? `/shop?c=${t.key}` : "/shop"}
              aria-current={on ? "page" : undefined}
              className={`shrink-0 rounded-full px-5 py-3 text-[0.98rem] font-medium transition-colors ${on ? "bg-onyx text-bone" : "bg-bone-2 hover:bg-bone-3"}`}
            >
              {t.name}
            </Link>
          );
        })}
      </nav>

      {products.length ? (
        <div className="mt-12 grid gap-x-5 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} priority={i < 4} i={i} />
          ))}
        </div>
      ) : (
        <p className="mt-16 text-lg">
          Nothing here yet. <Link href="/custom" className="link">Ask about a custom piece</Link>.
        </p>
      )}

      <section aria-labelledby="custom-cta" className="mt-28 grid gap-6 rounded-[2rem] bg-onyx p-8 text-bone sm:p-12 lg:grid-cols-12 lg:items-center">
        <h2 id="custom-cta" className="text-[clamp(2rem,3.6vw,3.25rem)] lg:col-span-7">Don’t see your stones or your logo?</h2>
        <div className="lg:col-span-5">
          <p className="text-ash">Every AnderBerry piece is made to order, so most things can be changed: stone, size, charm, chip.</p>
          <Link href="/custom" className="btn btn-gold mt-6">
            Request a custom piece
          </Link>
        </div>
      </section>
    </div>
  );
}
