"use client";

import { useState } from "react";
import { date } from "@/lib/format";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { CustomRequest } from "@/lib/types";

const kinds: Record<string, string> = {
  "bulk-logo": "Bulk logo order",
  "tap-to-connect": "Tap-to-Connect",
  price: "Price question",
  custom: "Custom piece",
  other: "Other",
};

export default function RequestRow({ r }: { r: CustomRequest }) {
  const [status, setStatus] = useState(r.status);
  const [saving, setSaving] = useState(false);

  async function change(s: CustomRequest["status"]) {
    setStatus(s);
    setSaving(true);
    await supabaseBrowser().from("custom_requests").update({ status: s }).eq("id", r.id);
    setSaving(false);
  }

  const subject = encodeURIComponent(`Your AnderBerry ${kinds[r.kind]?.toLowerCase() ?? "request"}`);
  return (
    <li className="grid gap-3 py-5 lg:grid-cols-[1fr_14rem]">
      <div>
        <p className="font-semibold">
          {r.name}
          {r.organization && <span className="font-normal text-hematite"> · {r.organization}</span>}
        </p>
        <p className="text-sm text-hematite">
          {kinds[r.kind] ?? r.kind} · {date(r.created_at)}
          {r.quantity ? ` · ${r.quantity} pcs` : ""}
          {r.product_slug ? ` · about ${r.product_slug.replace(/-/g, " ")}` : ""}
          {r.design && typeof r.design.style === "string" ? ` (${r.design.style})` : ""}
        </p>
        {r.details && <p className="mt-2 whitespace-pre-line">{r.details}</p>}
        <p className="mt-2 flex flex-wrap gap-x-4">
          <a href={`mailto:${r.email}?subject=${subject}`} className="underline underline-offset-4">Reply to {r.email}</a>
          {r.phone && <a href={`tel:${r.phone}`} className="underline underline-offset-4">{r.phone}</a>}
        </p>
      </div>
      <div>
        <label htmlFor={`rs-${r.id}`} className="mb-1.5 block text-sm font-semibold">Status{saving ? " · saving" : ""}</label>
        <select id={`rs-${r.id}`} value={status} onChange={(e) => change(e.target.value as CustomRequest["status"])} className="field">
          <option value="new">New</option>
          <option value="quoted">Quoted</option>
          <option value="won">Won</option>
          <option value="closed">Closed</option>
        </select>
      </div>
    </li>
  );
}
