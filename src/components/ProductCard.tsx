import Image from "next/image";
import Link from "next/link";
import { money } from "@/lib/format";
import { priceRange } from "@/lib/pricing";
import NoPhoto from "./NoPhoto";
import type { Product } from "@/lib/types";

export default function ProductCard({ product, priority = false, i = 0 }: { product: Product; priority?: boolean; i?: number }) {
  const [a, b] = product.images;
  const { min, max } = priceRange(product);
  const label = min == null ? money(null) : min !== max ? `From ${money(min)}` : money(min);
  return (
    <Link href={`/shop/${product.slug}`} className="group block" data-reveal style={{ ["--i" as string]: i % 4 }}>
      <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-bone-2">
        {!a && <NoPhoto name={product.name} />}
        {a && (
          <Image src={a} alt={product.name} fill priority={priority} sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="img-lift object-cover" />
        )}
        {b && (
          <Image src={b} alt="" fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100 motion-reduce:hidden" />
        )}
        {product.is_nfc && (
          <span className="absolute left-3 top-3 rounded-full bg-onyx px-3 py-1 text-sm font-medium text-bone">Tap-to-Connect</span>
        )}
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-4">
        <h3 className="font-sans text-[1.05rem] font-semibold leading-snug tracking-normal">{product.name}</h3>
        <span className={`tabular shrink-0 ${min == null ? "text-hematite" : "font-medium"}`}>{label}</span>
      </div>
      <p className="mt-1 text-[0.95rem] text-hematite">{product.tagline}</p>
    </Link>
  );
}
