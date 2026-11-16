"use client";

import { useEffect, useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { Upload } from "@/lib/types";

export const MAX_UPLOADS = 3;
const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPT = "image/png,image/jpeg,image/webp,image/gif,image/heic,image/heif,image/svg+xml";

type Item = Upload & { preview?: string; state: "uploading" | "done" | "error" };

/** Lets a shopper attach up to three images (logo, photo, pet) to a custom piece. */
export default function CustomUploads({
  onChange,
  onBusy,
}: {
  onChange: (uploads: Upload[]) => void;
  onBusy: (busy: boolean) => void;
}) {
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  // One folder per product page visit; the storage policy only accepts pending/<uuid>/<file>
  const folder = useRef<string>("");

  useEffect(() => {
    folder.current = crypto.randomUUID();
  }, []);

  useEffect(() => {
    onChange(items.filter((i) => i.state === "done").map(({ path, name }) => ({ path, name })));
    onBusy(items.some((i) => i.state === "uploading"));
  }, [items, onChange, onBusy]);

  useEffect(() => () => items.forEach((i) => i.preview && URL.revokeObjectURL(i.preview)), []); // eslint-disable-line react-hooks/exhaustive-deps

  async function add(files: FileList | null) {
    setError(null);
    if (!files?.length) return;
    const room = MAX_UPLOADS - items.length;
    const picked = Array.from(files).slice(0, room);
    if (files.length > room) setError(`You can attach up to ${MAX_UPLOADS} images.`);

    for (const file of picked) {
      if (!ACCEPT.split(",").includes(file.type)) {
        setError("Images only: PNG, JPG, WEBP, GIF, HEIC or SVG.");
        continue;
      }
      if (file.size > MAX_BYTES) {
        setError(`${file.name} is over 10 MB.`);
        continue;
      }
      const safe = file.name.replace(/[^a-zA-Z0-9.]+/g, "-").replace(/^-+/, "").slice(-80) || "image";
      const path = `pending/${folder.current}/${Date.now()}-${safe}`;
      const canPreview = /^image\/(png|jpeg|webp|gif)$/.test(file.type);
      const item: Item = { path, name: file.name, preview: canPreview ? URL.createObjectURL(file) : undefined, state: "uploading" };
      setItems((x) => [...x, item]);
      const { error: err } = await supabaseBrowser()
        .storage.from("customer-uploads")
        .upload(path, file, { contentType: file.type, upsert: false });
      setItems((x) => x.map((i) => (i.path === path ? { ...i, state: err ? "error" : "done" } : i)));
      if (err) setError(`${file.name} didn’t upload. Try again.`);
    }
    if (input.current) input.current.value = "";
  }

  function remove(path: string) {
    setItems((x) => {
      const gone = x.find((i) => i.path === path);
      if (gone?.preview) URL.revokeObjectURL(gone.preview);
      return x.filter((i) => i.path !== path);
    });
    setError(null);
  }

  return (
    <div className="mt-7">
      <p id="uploads-label" className="mb-1 font-semibold">
        Your images <span className="font-normal text-hematite">(optional, up to {MAX_UPLOADS})</span>
      </p>
      <p id="uploads-help" className="mb-3 text-sm text-hematite">
        Your logo, photo, letters or pet. PNG, JPG, WEBP, HEIC or SVG, 10 MB each. You can also email files after ordering.
      </p>
      <ul aria-labelledby="uploads-label" className="flex flex-wrap gap-3">
        {items.map((i) => (
          <li key={i.path} className="relative">
            <div className={`relative grid h-24 w-24 place-items-center overflow-hidden rounded-xl bg-bone-2 ${i.state === "uploading" ? "opacity-60" : ""}`}>
              {i.preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={i.preview} alt={i.name} className="h-full w-full object-cover" />
              ) : (
                <span className="break-all px-2 text-center text-xs">{i.name}</span>
              )}
              {i.state === "uploading" && <span className="absolute inset-x-0 bottom-0 bg-onyx/80 py-1 text-center text-xs text-bone">Uploading…</span>}
              {i.state === "error" && <span className="absolute inset-x-0 bottom-0 bg-oxblood py-1 text-center text-xs text-bone">Failed</span>}
            </div>
            <button
              type="button"
              onClick={() => remove(i.path)}
              disabled={i.state === "uploading"}
              aria-label={`Remove ${i.name}`}
              className="absolute -right-2 -top-2 grid h-8 w-8 place-items-center rounded-full bg-onyx text-bone transition-transform active:scale-90 disabled:opacity-40"
            >
              ×
            </button>
          </li>
        ))}
        {items.length < MAX_UPLOADS && (
          <li>
            <label className="grid h-24 w-24 cursor-pointer place-items-center rounded-xl bg-bone-2 px-2 text-center text-sm font-medium transition-colors hover:bg-bone-3 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-gold">
              {items.length ? "Add another" : "Add images"}
              <input
                ref={input}
                type="file"
                accept={ACCEPT}
                multiple
                aria-describedby="uploads-help"
                className="sr-only"
                onChange={(e) => add(e.target.files)}
              />
            </label>
          </li>
        )}
      </ul>
      {error && (
        <p role="alert" className="mt-2 text-sm font-semibold text-oxblood">
          {error}
        </p>
      )}
    </div>
  );
}
