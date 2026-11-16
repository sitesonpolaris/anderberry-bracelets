"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { Customer } from "@/lib/types";

export default function CustomerEditor({ customer }: { customer: Customer }) {
  const router = useRouter();
  const [name, setName] = useState(customer.name ?? "");
  const [phone, setPhone] = useState(customer.phone ?? "");
  const [tags, setTags] = useState(customer.tags.join(", "));
  const [notes, setNotes] = useState(customer.notes ?? "");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    const { error } = await supabaseBrowser()
      .from("customers")
      .update({
        name: name.trim() || null,
        phone: phone.trim() || null,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        notes: notes.trim() || null,
      })
      .eq("id", customer.id);
    setBusy(false);
    setMsg(error ? "Couldn’t save. Try again." : "Saved.");
    if (!error) router.refresh();
  }

  return (
    <div className="grid gap-4">
      <div>
        <label htmlFor="cn" className="mb-1.5 block font-semibold">Name</label>
        <input id="cn" value={name} onChange={(e) => setName(e.target.value)} className="field" />
      </div>
      <div>
        <label htmlFor="cp" className="mb-1.5 block font-semibold">Phone</label>
        <input id="cp" value={phone} onChange={(e) => setPhone(e.target.value)} className="field" />
      </div>
      <div>
        <label htmlFor="ct" className="mb-1.5 block font-semibold">Tags</label>
        <input id="ct" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="wholesale, chapter, repeat" className="field" />
      </div>
      <div>
        <label htmlFor="cno" className="mb-1.5 block font-semibold">Notes</label>
        <textarea id="cno" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Wrist size, favorite stones, birthday…" className="field" />
      </div>
      <div className="flex items-center gap-3">
        <button type="button" onClick={save} disabled={busy} className="btn btn-ink !min-h-11">{busy ? "Saving…" : "Save"}</button>
        {msg && <span role="status" className="text-hematite">{msg}</span>}
      </div>
    </div>
  );
}
