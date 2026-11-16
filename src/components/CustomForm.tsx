"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { site } from "@/lib/site";
import { supabaseBrowser } from "@/lib/supabase/client";

const kinds = [
  { value: "bulk-logo", label: "Logo pieces for my organization" },
  { value: "tap-to-connect", label: "A Tap-to-Connect bracelet or pin" },
  { value: "price", label: "Price for a listed piece" },
  { value: "custom", label: "Something else made for me" },
];

export default function CustomForm() {
  const params = useSearchParams();
  const productSlug = params.get("product");
  const styleName = params.get("style");
  const [kind, setKind] = useState(productSlug ? "price" : "bulk-logo");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (f.get("company_website")) return; // honeypot
    setState("sending");
    const qty = Number(f.get("quantity"));
    const { error } = await supabaseBrowser()
      .from("custom_requests")
      .insert({
        name: String(f.get("name")).trim(),
        email: String(f.get("email")).trim(),
        phone: String(f.get("phone") || "").trim() || null,
        organization: String(f.get("organization") || "").trim() || null,
        kind,
        quantity: Number.isFinite(qty) && qty > 0 ? qty : null,
        details: String(f.get("details") || "").trim(),
        product_slug: productSlug,
        design: styleName ? { style: styleName } : null,
      });
    setState(error ? "error" : "sent");
  }

  if (state === "sent") {
    return (
      <div role="status" className="rounded-[2rem] bg-onyx p-8 text-bone sm:p-12">
        <h2 className="text-[clamp(2rem,3.6vw,3.25rem)]">Got it. Thank you.</h2>
        <p className="mt-4 max-w-lg text-ash">
          Amy and Aaron read every request and will reply by email. If you have a logo file, send it to{" "}
          <a className="link text-bone" href={`mailto:${site.email}`}>
            {site.email}
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6 rounded-[2rem] bg-bone-2 p-6 sm:p-10">
      <fieldset>
        <legend className="mb-3 font-semibold">What are you looking for?</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {kinds.map((k) => (
            <label key={k.value} className={`cursor-pointer rounded-2xl px-4 py-3.5 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-gold ${kind === k.value ? "bg-onyx text-bone" : "bg-bone hover:bg-white"}`}>
              <input type="radio" name="kind" value={k.value} checked={kind === k.value} onChange={() => setKind(k.value)} className="sr-only" />
              {k.label}
            </label>
          ))}
        </div>
      </fieldset>

      {productSlug && (
        <p className="rounded-xl bg-bone px-4 py-3">
          Asking about: <strong>{productSlug.replace(/-/g, " ")}</strong>
          {styleName ? `, ${styleName}` : ""}
        </p>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="cf-name" className="mb-2 block font-semibold">Your name</label>
          <input id="cf-name" name="name" required maxLength={120} autoComplete="name" className="field" />
        </div>
        <div>
          <label htmlFor="cf-email" className="mb-2 block font-semibold">Email</label>
          <input id="cf-email" name="email" type="email" required maxLength={200} autoComplete="email" className="field" />
        </div>
        <div>
          <label htmlFor="cf-phone" className="mb-2 block font-semibold">Phone <span className="font-normal text-hematite">(optional)</span></label>
          <input id="cf-phone" name="phone" type="tel" maxLength={40} autoComplete="tel" className="field" />
        </div>
        <div>
          <label htmlFor="cf-org" className="mb-2 block font-semibold">Organization <span className="font-normal text-hematite">(optional)</span></label>
          <input id="cf-org" name="organization" maxLength={160} autoComplete="organization" className="field" />
        </div>
        <div>
          <label htmlFor="cf-qty" className="mb-2 block font-semibold">How many?</label>
          <input id="cf-qty" name="quantity" type="number" min={1} max={100000} inputMode="numeric" defaultValue={kind === "bulk-logo" ? undefined : 1} className="field" />
        </div>
      </div>
      <div>
        <label htmlFor="cf-details" className="mb-2 block font-semibold">Tell us about it</label>
        <textarea
          id="cf-details"
          name="details"
          rows={5}
          maxLength={4000}
          className="field"
          placeholder="Stones, colors, wrist sizes, the link for your NFC chip, when you need it by…"
        />
      </div>
      <div aria-hidden className="hidden">
        <label>
          Leave empty <input name="company_website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      {state === "error" && (
        <p role="alert" className="rounded-lg bg-oxblood px-4 py-3 text-bone">
          That didn’t send. Please try again, or email {site.email}.
        </p>
      )}
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className="btn btn-gold" disabled={state === "sending"}>
          {state === "sending" ? "Sending…" : "Send request"}
        </button>
        <p className="text-sm text-hematite">Logo files: email them to {site.email} after you send this.</p>
      </div>
    </form>
  );
}
