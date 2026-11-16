"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { revalidateStore } from "@/app/admin/actions";
import type { CollectionRow } from "@/lib/site";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Panel } from "./ui";

const slugify = (s: string) =>
  s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);

const blank: CollectionRow = { key: "", name: "", blurb: "", image: null, sort: 100, active: true };

export default function CollectionEditor({ collection, mainFor }: { collection: CollectionRow | null; mainFor: number }) {
  const router = useRouter();
  const [c, setC] = useState<CollectionRow>(collection ?? blank);
  const [keyTouched, setKeyTouched] = useState(Boolean(collection));
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const set = <K extends keyof CollectionRow>(k: K, v: CollectionRow[K]) => setC((x) => ({ ...x, [k]: v }));
  const renamed = collection && c.key !== collection.key;

  async function upload(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 8 * 1024 * 1024) {
      setMsg({ ok: false, text: "Images only, 8 MB max." });
      return;
    }
    setUploading(true);
    const sb = supabaseBrowser();
    const path = `collections/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]+/g, "-")}`;
    const { error } = await sb.storage.from("product-images").upload(path, file, { cacheControl: "31536000", upsert: false });
    setUploading(false);
    if (error) setMsg({ ok: false, text: "The image didn’t upload. Try again." });
    else set("image", sb.storage.from("product-images").getPublicUrl(path).data.publicUrl);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const key = slugify(c.key || c.name);
    if (!c.name.trim() || !key) {
      setMsg({ ok: false, text: "Add a name first." });
      return;
    }
    const row = { key, name: c.name.trim(), blurb: c.blurb.trim(), image: c.image || null, sort: Number(c.sort) || 100, active: c.active };
    setBusy(true);
    const sb = supabaseBrowser();
    // Renaming the key cascades to every product and membership in the database
    const res = collection
      ? await sb.from("collections").update(row).eq("key", collection.key).select("key").single()
      : await sb.from("collections").insert(row).select("key").single();
    setBusy(false);
    if (res.error) {
      setMsg({ ok: false, text: res.error.code === "23505" ? "Another collection already uses that web address." : "Couldn’t save. Try again." });
      return;
    }
    await revalidateStore().catch(() => {});
    setMsg({ ok: true, text: "Saved. The shop updates within a minute." });
    if (!collection || renamed) router.replace(`/admin/collections/${res.data.key}`);
    else router.refresh();
  }

  async function remove() {
    if (!collection) return;
    setBusy(true);
    const { error } = await supabaseBrowser().from("collections").delete().eq("key", collection.key);
    setBusy(false);
    if (error) {
      setConfirmDelete(false);
      setMsg({
        ok: false,
        text: error.code === "23503" ? "Some products use this as their main collection. Change their main collection first." : "Couldn’t delete. Try again.",
      });
      return;
    }
    await revalidateStore().catch(() => {});
    router.replace("/admin/collections");
    router.refresh();
  }

  return (
    <form onSubmit={save} className="grid gap-6 xl:grid-cols-3">
      <div className="grid content-start gap-6 xl:col-span-2">
        <Panel title="Details">
          <div className="grid gap-5">
            <div>
              <label htmlFor="cn" className="mb-1.5 block font-semibold">Name</label>
              <input
                id="cn"
                required
                maxLength={80}
                value={c.name}
                onChange={(e) => {
                  set("name", e.target.value);
                  if (!keyTouched) set("key", slugify(e.target.value));
                }}
                className="field"
              />
            </div>
            <div>
              <label htmlFor="ck" className="mb-1.5 block font-semibold">Web address</label>
              <div className="flex items-center gap-2">
                <span className="shrink-0 text-hematite">/shop?c=</span>
                <input id="ck" value={c.key} onChange={(e) => { setKeyTouched(true); set("key", slugify(e.target.value)); }} className="field" />
              </div>
              {renamed && (
                <p className="mt-2 rounded-lg bg-[#f3e6c8] px-3 py-2 text-sm text-[#5a3d0c]">
                  Changing the web address moves every product with it, but old links to /shop?c={collection.key} will show all products instead.
                </p>
              )}
            </div>
            <div>
              <label htmlFor="cb" className="mb-1.5 block font-semibold">Description</label>
              <textarea id="cb" rows={3} maxLength={240} value={c.blurb} onChange={(e) => set("blurb", e.target.value)} className="field" />
              <p className="mt-1 text-sm text-hematite">One sentence. Shown on the home page and at the top of the shop when this collection is picked.</p>
            </div>
          </div>
        </Panel>
        <Panel title="Image">
          <p className="mb-4 text-hematite">Shown on the home page. Square or landscape photos work best.</p>
          <div className="flex flex-wrap items-end gap-4">
            <div className="relative h-40 w-40 overflow-hidden rounded-xl bg-bone-2">
              {c.image ? <Image src={c.image} alt="" fill sizes="160px" className="object-cover" /> : <span className="grid h-full place-items-center text-sm text-hematite">No image</span>}
            </div>
            <div className="flex flex-wrap gap-2">
              <label className="btn btn-quiet !min-h-11 cursor-pointer has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-gold">
                {uploading ? "Uploading…" : c.image ? "Replace image" : "Upload image"}
                <input type="file" accept="image/*" className="sr-only" onChange={(e) => upload(e.target.files)} />
              </label>
              {c.image && <button type="button" onClick={() => set("image", null)} className="rounded-lg px-3 py-2 text-oxblood hover:bg-white">Remove</button>}
            </div>
          </div>
        </Panel>
      </div>

      <div className="grid content-start gap-6">
        <Panel title="In the shop">
          <div className="grid gap-5">
            <div>
              <label htmlFor="cs" className="mb-1.5 block font-semibold">Order</label>
              <input id="cs" type="number" value={c.sort} onChange={(e) => set("sort", Number(e.target.value))} className="field" />
              <p className="mt-1 text-sm text-hematite">Lower numbers show first. The first collection is the big tile on the home page and appears in the main menu.</p>
            </div>
            <label className="flex cursor-pointer items-center gap-3">
              <input type="checkbox" checked={c.active} onChange={(e) => set("active", e.target.checked)} className="h-5 w-5 accent-[#0e0d0c]" />
              Show in the shop
            </label>
          </div>
        </Panel>
        <div className="grid gap-3 xl:sticky xl:top-6">
          <button type="submit" disabled={busy || uploading} className="btn btn-gold">{busy ? "Saving…" : collection ? "Save changes" : "Create collection"}</button>
          {msg && <p role="status" className={`rounded-lg px-3 py-2 ${msg.ok ? "bg-white" : "bg-oxblood text-bone"}`}>{msg.text}</p>}
        </div>
        {collection && (
          <Panel title="Delete">
            {mainFor > 0 ? (
              <p className="text-hematite">
                {mainFor} product{mainFor === 1 ? " uses" : "s use"} this as {mainFor === 1 ? "its" : "their"} main collection. Change that on each product before deleting, or hide the collection instead.
              </p>
            ) : confirmDelete ? (
              <div className="grid gap-3">
                <p>Delete “{collection.name}”? Products stay in the shop; they just leave this collection.</p>
                <div className="flex gap-2">
                  <button type="button" onClick={remove} disabled={busy} className="btn !min-h-11 bg-oxblood text-bone">Delete</button>
                  <button type="button" onClick={() => setConfirmDelete(false)} className="btn btn-quiet !min-h-11">Keep it</button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => setConfirmDelete(true)} className="text-oxblood underline underline-offset-4">Delete this collection</button>
            )}
          </Panel>
        )}
      </div>
    </form>
  );
}
