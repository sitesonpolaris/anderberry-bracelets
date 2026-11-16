"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { revalidateStore } from "@/app/admin/actions";
import { collections, type Collection } from "@/lib/site";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { Product, ProductStyle } from "@/lib/types";
import { Panel } from "./ui";

const slugify = (s: string) =>
  s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

const blank: Omit<Product, "id"> = {
  slug: "",
  name: "",
  collection: "gemstone",
  tagline: "",
  description: "",
  price_cents: null,
  images: [],
  styles: [],
  stones: [],
  is_nfc: false,
  needs_size: true,
  inventory: null,
  active: false,
  featured: false,
  sort: 100,
  owner_to_confirm: null,
};

export default function ProductEditor({ product }: { product: Product | null }) {
  const router = useRouter();
  const [p, setP] = useState<Omit<Product, "id">>(product ?? blank);
  const [price, setPrice] = useState(product?.price_cents != null ? (product.price_cents / 100).toFixed(2) : "");
  const [stones, setStones] = useState((product?.stones ?? []).join(", "));
  const [slugTouched, setSlugTouched] = useState(Boolean(product));
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const set = <K extends keyof Product>(k: K, v: Product[K]) => setP((x) => ({ ...x, [k]: v }));

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    const sb = supabaseBrowser();
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/") || file.size > 8 * 1024 * 1024) continue;
      const path = `${p.slug || "product"}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]+/g, "-")}`;
      const { error } = await sb.storage.from("product-images").upload(path, file, { cacheControl: "31536000", upsert: false });
      if (!error) urls.push(sb.storage.from("product-images").getPublicUrl(path).data.publicUrl);
    }
    setP((x) => ({ ...x, images: [...x.images, ...urls] }));
    setUploading(false);
    if (urls.length < files.length) setMsg({ ok: false, text: "Some images didn’t upload (images only, 8 MB max)." });
  }

  function move(i: number, d: -1 | 1) {
    setP((x) => {
      const imgs = [...x.images];
      const j = i + d;
      if (j < 0 || j >= imgs.length) return x;
      [imgs[i], imgs[j]] = [imgs[j], imgs[i]];
      return { ...x, images: imgs };
    });
  }

  function setStyle(i: number, patch: Partial<ProductStyle>) {
    setP((x) => ({ ...x, styles: x.styles.map((s, k) => (k === i ? { ...s, ...patch } : s)) }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const cents = price.trim() === "" ? null : Math.round(Number(price.replace(/[$,]/g, "")) * 100);
    if (cents !== null && (!Number.isFinite(cents) || cents < 0)) {
      setMsg({ ok: false, text: "Price must be a number, or empty for “Ask for price”." });
      return;
    }
    const slug = slugify(p.slug || p.name);
    if (!p.name.trim() || !slug) {
      setMsg({ ok: false, text: "Add a name first." });
      return;
    }
    const row = {
      ...p,
      slug,
      price_cents: cents,
      stones: stones.split(",").map((s) => s.trim()).filter(Boolean),
      styles: p.styles
        .filter((s) => s.name.trim())
        .map((s) => ({ ...s, key: s.key || slugify(s.name), image: s.image || undefined })),
    };
    setBusy(true);
    const sb = supabaseBrowser();
    const res = product
      ? await sb.from("products").update(row).eq("id", product.id).select("id").single()
      : await sb.from("products").insert(row).select("id").single();
    setBusy(false);
    if (res.error) {
      setMsg({ ok: false, text: res.error.code === "23505" ? "Another product already uses that web address." : "Couldn’t save. Try again." });
      return;
    }
    await revalidateStore(slug).catch(() => {});
    setMsg({ ok: true, text: "Saved. The shop updates within a minute." });
    if (!product) router.replace(`/admin/products/${res.data.id}`);
    else router.refresh();
  }

  return (
    <form onSubmit={save} className="grid gap-6 xl:grid-cols-3">
      <div className="grid content-start gap-6 xl:col-span-2">
        <Panel title="Details">
          <div className="grid gap-5">
            <div>
              <label htmlFor="pn" className="mb-1.5 block font-semibold">Name</label>
              <input
                id="pn"
                required
                value={p.name}
                onChange={(e) => {
                  set("name", e.target.value);
                  if (!slugTouched) set("slug", slugify(e.target.value));
                }}
                className="field"
              />
            </div>
            <div>
              <label htmlFor="ps" className="mb-1.5 block font-semibold">Web address</label>
              <div className="flex items-center gap-2">
                <span className="text-hematite">/shop/</span>
                <input id="ps" value={p.slug} onChange={(e) => { setSlugTouched(true); set("slug", slugify(e.target.value)); }} className="field" />
              </div>
            </div>
            <div>
              <label htmlFor="pt" className="mb-1.5 block font-semibold">One-line summary</label>
              <input id="pt" value={p.tagline} onChange={(e) => set("tagline", e.target.value)} maxLength={140} className="field" />
            </div>
            <div>
              <label htmlFor="pd" className="mb-1.5 block font-semibold">Description</label>
              <textarea id="pd" rows={6} value={p.description} onChange={(e) => set("description", e.target.value)} className="field" />
            </div>
            <div>
              <label htmlFor="pst" className="mb-1.5 block font-semibold">Stones</label>
              <input id="pst" value={stones} onChange={(e) => setStones(e.target.value)} placeholder="Tiger eye, Onyx" className="field" />
              <p className="mt-1 text-sm text-hematite">Separate with commas.</p>
            </div>
          </div>
        </Panel>

        <Panel title="Photos">
          <p className="mb-4 text-hematite">The first photo is the one shoppers see first. Square or portrait photos work best.</p>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {p.images.map((src, i) => (
              <li key={src} className="rounded-xl bg-[#f7f4ee] p-2">
                <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-bone-2">
                  <Image src={src} alt="" fill sizes="160px" className="object-cover" />
                </div>
                <div className="mt-2 flex justify-between text-sm">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="rounded px-2 py-1 hover:bg-white disabled:opacity-30" aria-label="Move earlier">←</button>
                  <button type="button" onClick={() => set("images", p.images.filter((x) => x !== src))} className="rounded px-2 py-1 text-oxblood hover:bg-white">Remove</button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === p.images.length - 1} className="rounded px-2 py-1 hover:bg-white disabled:opacity-30" aria-label="Move later">→</button>
                </div>
              </li>
            ))}
            <li>
              <label className="grid aspect-[4/5] cursor-pointer place-items-center rounded-xl bg-[#f7f4ee] p-4 text-center font-medium hover:bg-bone-2 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-gold">
                {uploading ? "Uploading…" : "Add photos"}
                <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => upload(e.target.files)} />
              </label>
            </li>
          </ul>
        </Panel>

        <Panel title="Styles shoppers can pick">
          <p className="mb-4 text-hematite">Optional. Each style can show its own photo.</p>
          <div className="grid gap-3">
            {p.styles.map((s, i) => (
              <div key={i} className="grid gap-2 rounded-xl bg-[#f7f4ee] p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-center">
                <label className="sr-only" htmlFor={`sn${i}`}>Style name</label>
                <input id={`sn${i}`} value={s.name} onChange={(e) => setStyle(i, { name: e.target.value })} placeholder="Style name" className="field" />
                <label className="sr-only" htmlFor={`si${i}`}>Photo for this style</label>
                <select id={`si${i}`} value={s.image ?? ""} onChange={(e) => setStyle(i, { image: e.target.value || undefined })} className="field">
                  <option value="">No photo</option>
                  {p.images.map((img, k) => <option key={img} value={img}>Photo {k + 1}</option>)}
                </select>
                <button type="button" onClick={() => set("styles", p.styles.filter((_, k) => k !== i))} className="rounded-lg px-3 py-2 text-oxblood hover:bg-white">Remove</button>
              </div>
            ))}
            <button type="button" onClick={() => set("styles", [...p.styles, { key: "", name: "" }])} className="btn btn-quiet !min-h-11 justify-self-start">Add a style</button>
          </div>
        </Panel>
      </div>

      <div className="grid content-start gap-6">
        <Panel title="Price & shop">
          <div className="grid gap-5">
            <div>
              <label htmlFor="pp" className="mb-1.5 block font-semibold">Price (USD)</label>
              <input id="pp" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Leave empty for “Ask for price”" className="field tabular" />
            </div>
            <div>
              <label htmlFor="pc" className="mb-1.5 block font-semibold">Collection</label>
              <select id="pc" value={p.collection} onChange={(e) => set("collection", e.target.value as Collection)} className="field">
                {collections.map((c) => <option key={c.key} value={c.key}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="po" className="mb-1.5 block font-semibold">Order in shop</label>
              <input id="po" type="number" value={p.sort} onChange={(e) => set("sort", Number(e.target.value) || 100)} className="field" />
              <p className="mt-1 text-sm text-hematite">Lower numbers show first.</p>
            </div>
            {[
              ["active", "Show in the shop"],
              ["featured", "Feature on the home page"],
              ["needs_size", "Ask for a wrist size"],
              ["is_nfc", "Has a Tap-to-Connect NFC chip"],
            ].map(([k, label]) => (
              <label key={k} className="flex cursor-pointer items-center gap-3">
                <input type="checkbox" checked={Boolean(p[k as keyof typeof p])} onChange={(e) => set(k as keyof Product, e.target.checked as never)} className="h-5 w-5 accent-[#0e0d0c]" />
                {label}
              </label>
            ))}
          </div>
        </Panel>
        {p.owner_to_confirm && (
          <Panel title="To confirm">
            <p className="text-hematite">{p.owner_to_confirm}</p>
            <button type="button" onClick={() => set("owner_to_confirm", null)} className="mt-3 text-sm underline underline-offset-4">Mark as confirmed</button>
          </Panel>
        )}
        <div className="grid gap-3 xl:sticky xl:top-6">
          <button type="submit" disabled={busy || uploading} className="btn btn-gold">{busy ? "Saving…" : product ? "Save changes" : "Create product"}</button>
          {msg && <p role="status" className={`rounded-lg px-3 py-2 ${msg.ok ? "bg-white" : "bg-oxblood text-bone"}`}>{msg.text}</p>}
        </div>
      </div>
    </form>
  );
}
