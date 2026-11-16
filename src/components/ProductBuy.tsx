"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { money } from "@/lib/format";
import { priceFor } from "@/lib/pricing";
import { wristSizes } from "@/lib/site";
import type { Product, Upload } from "@/lib/types";
import { useCart } from "./cart/CartProvider";
import CustomUploads from "./CustomUploads";
import NoPhoto from "./NoPhoto";
import ProductDescription from "./ProductDescription";

export default function ProductBuy({ product }: { product: Product }) {
  const [style, setStyle] = useState<string | undefined>(product.styles[0]?.key);
  useEffect(() => {
    const wanted = new URLSearchParams(window.location.search).get("style");
    if (wanted && product.styles.some((s) => s.key === wanted)) setStyle(wanted);
  }, [product.styles]);
  const [size, setSize] = useState<string>("");
  const [choices, setChoices] = useState<Record<string, string>>({});
  const [note, setNote] = useState("");
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [uploading, setUploading] = useState(false);
  const onUploads = useCallback((u: Upload[]) => setUploads(u), []);
  const onUploadBusy = useCallback((b: boolean) => setUploading(b), []);
  const takesUploads = product.options.length > 0;
  const [qty, setQty] = useState(1);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const { add } = useCart();

  const styleObj = product.styles.find((s) => s.key === style);
  const gallery = useMemo(() => {
    const first = styleObj?.image;
    return first ? [first, ...product.images.filter((i) => i !== first)] : product.images;
  }, [styleObj, product.images]);
  const [active, setActive] = useState(0);
  const main = gallery[Math.min(active, gallery.length - 1)];
  const price = priceFor(product, style);
  const priced = price != null;
  const optionId = (label: string) => `opt-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  function addToBag() {
    const missing: Record<string, boolean> = {};
    if (product.needs_size && !size) missing.size = true;
    product.options.forEach((o) => {
      if (!choices[o.label]) missing[o.label] = true;
    });
    setErrors(missing);
    const first = Object.keys(missing)[0];
    if (first) {
      document.getElementById(first === "size" ? "wrist-size" : optionId(first))?.focus();
      return;
    }
    add(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        image: gallery[0] ?? "",
        priceCents: price!,
        style: styleObj?.name,
        size: product.needs_size ? size : undefined,
        options: product.options.length ? choices : undefined,
        personalization: note.trim() || undefined,
        uploads: takesUploads && uploads.length ? uploads : undefined,
      },
      qty,
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
      {/* Gallery */}
      <div className="min-w-0 lg:col-span-7">
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] bg-bone-2 lg:aspect-auto lg:h-[min(calc(100dvh-11rem),46rem)]">
          {main ? (
            <Image key={main} src={main} alt={`${product.name}${styleObj ? `, ${styleObj.name}` : ""}`} fill priority sizes="(min-width: 1024px) 58vw, 100vw" className="object-cover" />
          ) : (
            <NoPhoto name={product.name} />
          )}
        </div>
        {styleObj && !styleObj.image && main && (
          <p className="mt-3 text-[0.95rem] text-hematite" aria-live="polite">
            Shown in {product.styles.find((s) => s.image === gallery[active] || s.image === main)?.name ?? "another stone"}. A {styleObj.name.toLowerCase()} photo is coming soon.
          </p>
        )}
        {gallery.length > 1 && (
          <div className="scrollbar-none mt-4 flex max-w-full gap-3 overflow-x-auto pb-1">
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
      <div className="min-w-0 lg:col-span-5">
        <div className="lg:sticky lg:top-24">
          <h1
            className={`[overflow-wrap:anywhere] ${
              product.name.length > 60 ? "text-[clamp(1.9rem,2.7vw,2.6rem)]" : product.name.length > 32 ? "text-[clamp(2.1rem,3.3vw,3.2rem)]" : "text-[clamp(2.25rem,4.4vw,4rem)]"
            }`}
          >
            {product.name}
          </h1>
          <p className={`tabular mt-4 text-[1.6rem] ${priced ? "" : "text-hematite"}`} aria-live="polite">
            {money(price)}
          </p>
          {product.tagline && <p className="mt-3 text-[1.1rem] leading-relaxed text-hematite">{product.tagline}</p>}

          {product.styles.length > 0 && (
            <fieldset className="mt-8">
              <legend className="mb-3 font-semibold">
                {product.stones.length > 0 && product.styles.some((s) => s.price_cents != null) ? "Stone" : "Style"}: <span className="font-normal">{styleObj?.name}</span>
              </legend>
              <div className="flex flex-wrap gap-2">
                {product.styles.map((s) => (
                  <label
                    key={s.key}
                    className={`cursor-pointer rounded-full px-4 py-2.5 text-[0.95rem] transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-gold ${s.key === style ? "bg-onyx text-bone" : "bg-bone-2 hover:bg-bone-3"}`}
                  >
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
                    {s.price_cents != null && s.price_cents !== product.price_cents && (
                      <span className={`tabular ml-1.5 ${s.key === style ? "text-ash" : "text-hematite"}`}>{money(s.price_cents)}</span>
                    )}
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          {product.options.map((o) => (
            <div key={o.label} className="mt-7">
              <label htmlFor={optionId(o.label)} className="mb-3 block font-semibold">
                {o.label}
              </label>
              <select
                id={optionId(o.label)}
                value={choices[o.label] ?? ""}
                onChange={(e) => {
                  setChoices((c) => ({ ...c, [o.label]: e.target.value }));
                  setErrors((er) => ({ ...er, [o.label]: false }));
                }}
                aria-invalid={Boolean(errors[o.label])}
                className="field max-w-xs"
              >
                <option value="">Choose one</option>
                {o.values.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
              {errors[o.label] && <p className="mt-2 text-sm font-semibold text-oxblood">Choose a {o.label.toLowerCase()} option.</p>}
            </div>
          ))}

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
                  setErrors((er) => ({ ...er, size: false }));
                }}
                aria-invalid={Boolean(errors.size)}
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
              <p id="size-help" className={`mt-2 text-sm ${errors.size ? "font-semibold text-oxblood" : "text-hematite"}`}>
                {errors.size ? "Choose a wrist size so we can string it to fit." : "Measure snugly around your wrist bone. We add the ease."}
              </p>
            </div>
          )}

          {takesUploads && priced && <CustomUploads onChange={onUploads} onBusy={onUploadBusy} />}

          {product.personalization_prompt && priced && (
            <div className="mt-7">
              <label htmlFor="personalization" className="mb-2 block font-semibold">
                Personalization <span className="font-normal text-hematite">(optional)</span>
              </label>
              <p id="personalization-help" className="mb-3 text-sm text-hematite">
                {product.personalization_prompt}
              </p>
              <textarea
                id="personalization"
                rows={3}
                maxLength={400}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                aria-describedby="personalization-help"
                className="field"
              />
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
              <button type="button" onClick={addToBag} disabled={uploading} className="btn btn-gold flex-1 sm:flex-none sm:px-10">
                {uploading ? "Uploading images…" : "Add to bag"}
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

          <ProductDescription text={product.description} />

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
