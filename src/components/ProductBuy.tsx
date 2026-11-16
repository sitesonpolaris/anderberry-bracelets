"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { money } from "@/lib/format";
import { wristSizes } from "@/lib/site";
import type { Product } from "@/lib/types";
import { useCart } from "./cart/CartProvider";

export default function ProductBuy({ product }: { product: Product }) {
  const params = useSearchParams();
  const initialStyle = product.styles.find((s) => s.key === params.get("style"))?.key ?? product.styles[0]?.key;
  const [style, setStyle] = useState<string | undefined>(initialStyle);
  const [size, setSize] = useState<string>("");
  const [qty, setQty] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const { add } = useCart();

  const styleObj = product.styles.find((s) => s.key === style);
  const gallery = useMemo(() => {
    const first = styleObj?.image;
    return first ? [first, ...product.images.filter((i) => i !== first)] : product.images;
  }, [styleObj, product.images]);
  const [active, setActive] = useState(0);
  const main = gallery[Math.min(active, gallery.length - 1)];
  const priced = product.price_cents != null;

  function addToBag() {
    if (product.needs_size && !size) {
      setSizeError(true);
      document.getElementById("wrist-size")?.focus();
      return;
    }
    add(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        image: gallery[0] ?? "",
        priceCents: product.price_cents!,
        style: styleObj?.name,
        size: product.needs_size ? size : undefined,
      },
      qty,
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
      {/* Gallery */}
      <div className="lg:col-span-7">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-bone-2">
          {main && <Image key={main} src={main} alt={`${product.name}${styleObj ? `, ${styleObj.name}` : ""}`} fill priority sizes="(min-width: 1024px) 58vw, 100vw" className="object-cover" />}
        </div>
        {gallery.length > 1 && (
          <div className="scrollbar-none mt-4 flex gap-3 overflow-x-auto">
            {gallery.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show photo ${i + 1} of ${gallery.length}`}
                aria-pressed={i === active}
                className={`relative h-24 w-20 shrink-0 overflow-hidden rounded-xl transition-opacity ${i === active ? "opacity-100 outline-2 outline-offset-2 outline-onyx" : "opacity-60 hover:opacity-100"}`}
              >
                <Image src={src} alt="" fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Buy box */}
      <div className="lg:col-span-5">
        <div className="lg:sticky lg:top-24">
          <h1 className="text-[clamp(2.5rem,4.4vw,4rem)]">{product.name}</h1>
          <p className={`tabular mt-4 text-[1.6rem] ${priced ? "" : "text-hematite"}`}>{money(product.price_cents)}</p>
          <p className="mt-5 text-[1.1rem] leading-relaxed">{product.description}</p>

          {product.styles.length > 0 && (
            <fieldset className="mt-8">
              <legend className="mb-3 font-semibold">
                Style: <span className="font-normal">{styleObj?.name}</span>
              </legend>
              <div className="flex flex-wrap gap-2">
                {product.styles.map((s) => (
                  <label key={s.key} className={`cursor-pointer rounded-full px-4 py-2.5 text-[0.95rem] transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-gold ${s.key === style ? "bg-onyx text-bone" : "bg-bone-2 hover:bg-[#ddd5c6]"}`}>
                    <input
                      type="radio"
                      name="style"
                      value={s.key}
                      checked={s.key === style}
                      onChange={() => {
                        setStyle(s.key);
                        setActive(0);
                      }}
                      className="sr-only"
                    />
                    {s.name}
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          {product.needs_size && (
            <div className="mt-7">
              <label htmlFor="wrist-size" className="mb-3 block font-semibold">
                Wrist size
              </label>
              <select
                id="wrist-size"
                value={size}
                onChange={(e) => {
                  setSize(e.target.value);
                  setSizeError(false);
                }}
                aria-invalid={sizeError}
                aria-describedby="size-help"
                className="field max-w-xs"
              >
                <option value="">Choose a size</option>
                {wristSizes.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              <p id="size-help" className={`mt-2 text-sm ${sizeError ? "font-semibold text-oxblood" : "text-hematite"}`}>
                {sizeError ? "Choose a wrist size so we can string it to fit." : "Measure snugly around your wrist bone. We add the ease."}
              </p>
            </div>
          )}

          {priced ? (
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <div className="flex items-center rounded-full bg-bone-2">
                <button type="button" aria-label="One fewer" onClick={() => setQty((q) => Math.max(1, q - 1))} className="h-[3.25rem] w-12 rounded-full text-xl active:scale-90">
                  −
                </button>
                <span className="tabular w-6 text-center" aria-live="polite" aria-label={`Quantity ${qty}`}>
                  {qty}
                </span>
                <button type="button" aria-label="One more" onClick={() => setQty((q) => Math.min(99, q + 1))} className="h-[3.25rem] w-12 rounded-full text-xl active:scale-90">
                  +
                </button>
              </div>
              <button type="button" onClick={addToBag} className="btn btn-gold flex-1 sm:flex-none sm:px-10">
                Add to bag
              </button>
            </div>
          ) : (
            <div className="mt-8">
              <Link href={`/custom?product=${product.slug}${style ? `&style=${encodeURIComponent(styleObj?.name ?? "")}` : ""}`} className="btn btn-ink">
                Ask for price
              </Link>
              <p className="mt-3 text-sm text-hematite">Made to order. Tell us your size and quantity and we’ll reply with a price.</p>
            </div>
          )}

          <dl className="mt-10 grid gap-5 rounded-[1.5rem] bg-bone-2 p-6">
            {product.stones.length > 0 && (
              <div>
                <dt className="font-semibold">Stones</dt>
                <dd>{product.stones.join(", ")}</dd>
              </div>
            )}
            {product.is_nfc && (
              <div>
                <dt className="font-semibold">Tap-to-Connect</dt>
                <dd>NFC chip opens one link of your choice. Works with any modern iPhone or Android, no app needed.</dd>
              </div>
            )}
            <div>
              <dt className="font-semibold">Made in Charlotte</dt>
              <dd>Strung by hand by Amy and Aaron, then shipped across the US.</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
