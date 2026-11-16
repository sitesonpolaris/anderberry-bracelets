"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { Order } from "@/lib/types";

const statuses: Order["status"][] = ["paid", "in_production", "shipped", "delivered", "cancelled", "refunded"];

export default function OrderEditor({ order }: { order: Order }) {
  const router = useRouter();
  const [status, setStatus] = useState(order.status);
  const [tracking, setTracking] = useState(order.tracking_number ?? "");
  const [notes, setNotes] = useState(order.notes ?? "");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    const { error } = await supabaseBrowser().from("orders").update({ status, tracking_number: tracking || null, notes: notes || null }).eq("id", order.id);
    setBusy(false);
    setMsg(error ? "Couldn’t save. Try again." : "Saved.");
    if (!error) router.refresh();
  }

  return (
    <div className="grid gap-4">
      <div>
        <label htmlFor="os" className="mb-1.5 block font-semibold">Status</label>
        <select id="os" value={status} onChange={(e) => setStatus(e.target.value as Order["status"])} className="field">
          {statuses.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="ot" className="mb-1.5 block font-semibold">Tracking number</label>
        <input id="ot" value={tracking} onChange={(e) => setTracking(e.target.value)} className="field" />
      </div>
      <div>
        <label htmlFor="on" className="mb-1.5 block font-semibold">Notes</label>
        <textarea id="on" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className="field" />
      </div>
      <div className="flex items-center gap-3">
        <button type="button" onClick={save} disabled={busy} className="btn btn-ink !min-h-11">{busy ? "Saving…" : "Save"}</button>
        {msg && <span role="status" className="text-hematite">{msg}</span>}
      </div>
      <p className="text-sm text-hematite">Refunds are made in the Stripe dashboard; the order updates here on its own.</p>
    </div>
  );
}
