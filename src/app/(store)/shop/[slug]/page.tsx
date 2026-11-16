import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductBuy from "@/components/ProductBuy";
import ProductCard from "@/components/ProductCard";
import { getCollections, getProduct, getProducts } from "@/lib/products";
import { priceRange } from "@/lib/pricing";
import { site } from "@/lib/site";

export const revalidate = 300;

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) return {};
  return {
    title: p.name,
    description: `${p.tagline} ${p.description}`.slice(0, 158),
    alternates: { canonical: `/shop/${p.slug}` },
    openGraph: { images: p.images[0] ? [{ url: p.images[0] }] : undefined },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();
  const collections = await getCollections();
  // Breadcrumb and related items follow the main collection, else the first active one it belongs to
  const collection =
    collections.find((c) => c.key === product.collection) ?? collections.find((c) => product.collections.includes(c.key));
  const related = collection ? (await getProducts(collection.key)).filter((p) => p.slug !== product.slug).slice(0, 4) : [];

  const range = priceRange(product);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((i) => new URL(i, site.url).toString()),
    brand: { "@type": "Brand", name: site.name },
    ...(range.min != null && {
      offers:
        range.min === range.max
          ? { "@type": "Offer", price: (range.min / 100).toFixed(2), priceCurrency: "USD", availability: "https://schema.org/InStock", url: `${site.url}/shop/${product.slug}` }
          : { "@type": "AggregateOffer", lowPrice: (range.min / 100).toFixed(2), highPrice: (range.max! / 100).toFixed(2), priceCurrency: "USD", offerCount: product.styles.length },
    }),
  };

  return (
    <div className="wrap pb-32 pt-6 lg:pb-44 lg:pt-10">
      <nav aria-label="Breadcrumb" className="mb-6 text-[0.95rem] text-hematite">
        <Link href="/shop" className="hover:text-onyx hover:underline">Shop</Link>
        {collection && (
          <>
            {" / "}
            <Link href={`/shop?c=${collection.key}`} className="hover:text-onyx hover:underline">{collection.name}</Link>
          </>
        )}
      </nav>
      <ProductBuy product={product} />

      {related.length > 0 && (
        <section aria-labelledby="related-h" className="mt-32">
          <h2 id="related-h" className="text-[clamp(2.25rem,4vw,3.75rem)]">More {collection?.name.toLowerCase()}</h2>
          <div className="mt-10 grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} i={i} />
            ))}
          </div>
        </section>
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </div>
  );
}
