"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { money, moneyExact } from "@/lib/format";
import { site, wristSizes } from "@/lib/site";
import { useCart } from "./CartProvider";

export default function CartDrawer() {
  const { lines, open, setOpen, setQty, remove, subtotal, count } = useCart();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      lastFocus.current = document.activeElement as HTMLElement;
      document.body.style.overflow = "hidden";
      setTimeout(() => panel.current?.querySelector<HTMLElement>("button, a")?.focus(), 50);
    } else {
      document.body.style.overflow = "";
      lastFocus.current?.focus?.();
    }
    const onKey = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") setOpen(false);
      if (e.key === "Tab" && panel.current) {
        const f = panel.current.querySelectorAll<HTMLElement>("button, a, input, select");
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  const freeLeft = site.shipping.freeOverCents - subtotal;

  async function checkout() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: lines.map((l) => ({ productId: l.productId, qty: l.qty, style: l.style, size: l.size, options: l.options, personalization: l.personalization, uploads: l.uploads?.map((u) => u.path) })) }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Checkout is unavailable right now.");
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout is unavailable right now.");
      setBusy(false);
    }
  }

  const sizeLabel = (v?: string) => wristSizes.find((s) => s.value === v)?.label;

  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div
        className={`absolute inset-0 bg-onyx/50 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
        onClick={() => setOpen(false)}
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label="Your bag"
        className={`absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-bone shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 pb-4 pt-6">
          <h2 className="text-3xl">Your bag {count > 0 && <span className="text-hematite">({count})</span>}</h2>
          <button type="button" onClick={() => setOpen(false)} className="btn btn-quiet !min-h-11 !px-4" tabIndex={open ? 0 : -1}>
            Close
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-start gap-4 px-6 pt-6">
            <p className="text-lg">Nothing strung yet.</p>
            <Link href="/shop" onClick={() => setOpen(false)} className="btn btn-ink" tabIndex={open ? 0 : -1}>
              Shop bracelets
            </Link>
          </div>
        ) : (
          <>
            <p className="mx-6 rounded-xl bg-bone-2 px-4 py-3 text-[0.95rem]">
              {freeLeft > 0 ? (
                <>
                  You’re <strong className="tabular">{moneyExact(freeLeft)}</strong> away from free shipping.
                </>
              ) : (
                <>Free shipping is on us.</>
              )}
            </p>
            <ul className="flex-1 overflow-y-auto px-6 py-4">
              {lines.map((l) => (
                <li key={l.id} className="flex gap-4 py-4">
                  <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-bone-2">
                    <Image src={l.image} alt="" fill sizes="80px" className="object-cover" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <Link href={`/shop/${l.slug}`} onClick={() => setOpen(false)} className="font-medium leading-snug hover:underline" tabIndex={open ? 0 : -1}>
                        {l.name}
                      </Link>
                      <span className="tabular font-medium">{money(l.priceCents * l.qty)}</span>
                    </div>
                    <p className="text-sm text-hematite">
                      {[l.style, ...Object.entries(l.options ?? {}).map(([k, v]) => `${k}: ${v}`), sizeLabel(l.size) && `Wrist ${sizeLabel(l.size)}`].filter(Boolean).join(" · ")}
                    </p>
                    {l.personalization && <p className="line-clamp-2 text-sm text-hematite">“{l.personalization}”</p>}
                    {l.uploads?.length ? <p className="text-sm text-hematite">{l.uploads.length} image{l.uploads.length > 1 ? "s" : ""} attached</p> : null}
                    <div className="mt-auto flex items-center gap-3 pt-2">
                      <div className="flex items-center rounded-full bg-bone-2">
                        <button type="button" aria-label={`One fewer ${l.name}`} onClick={() => setQty(l.id, l.qty - 1)} className="h-11 w-11 rounded-full text-lg active:scale-90" tabIndex={open ? 0 : -1}>
                          −
                        </button>
                        <span className="tabular w-6 text-center" aria-live="polite">
                          {l.qty}
                        </span>
                        <button type="button" aria-label={`One more ${l.name}`} onClick={() => setQty(l.id, l.qty + 1)} className="h-11 w-11 rounded-full text-lg active:scale-90" tabIndex={open ? 0 : -1}>
                          +
                        </button>
                      </div>
                      <button type="button" onClick={() => remove(l.id)} className="text-sm text-hematite underline underline-offset-4" tabIndex={open ? 0 : -1}>
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="bg-bone-2 px-6 pb-8 pt-5">
              <div className="flex items-baseline justify-between text-lg">
                <span>Subtotal</span>
                <span className="tabular font-semibold">{moneyExact(subtotal)}</span>
              </div>
              <p className="mt-1 text-sm text-hematite">Shipping and tax are added at checkout. Apple Pay and Google Pay accepted.</p>
              {error && (
                <p role="alert" className="mt-3 rounded-lg bg-oxblood px-3 py-2 text-sm text-bone">
                  {error}
                </p>
              )}
              <button type="button" onClick={checkout} disabled={busy} className="btn btn-gold mt-4 w-full" tabIndex={open ? 0 : -1}>
                {busy ? "Opening secure checkout…" : "Check out"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
