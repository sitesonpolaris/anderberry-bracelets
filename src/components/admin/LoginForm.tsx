"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"password" | "link">("password");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email")).trim();
    setBusy(true);
    setMsg(null);
    const sb = supabaseBrowser();
    if (mode === "password") {
      const { error } = await sb.auth.signInWithPassword({ email, password: String(f.get("password")) });
      if (error) {
        setMsg({ ok: false, text: "That email and password didn’t match." });
        setBusy(false);
        return;
      }
      router.replace("/admin");
      router.refresh();
    } else {
      const { error } = await sb.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: false, emailRedirectTo: `${window.location.origin}/admin/auth/callback` },
      });
      setMsg(error ? { ok: false, text: "We couldn’t send a link to that email." } : { ok: true, text: "Check your email for a sign-in link." });
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 grid gap-4">
      <div>
        <label htmlFor="email" className="mb-1.5 block font-semibold">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" className="field" />
      </div>
      {mode === "password" && (
        <div>
          <label htmlFor="password" className="mb-1.5 block font-semibold">Password</label>
          <input id="password" name="password" type="password" required autoComplete="current-password" className="field" />
        </div>
      )}
      {msg && (
        <p role="status" className={`rounded-lg px-3 py-2 ${msg.ok ? "bg-bone-2" : "bg-oxblood text-bone"}`}>{msg.text}</p>
      )}
      <button type="submit" className="btn btn-ink" disabled={busy}>
        {busy ? "One moment…" : mode === "password" ? "Sign in" : "Email me a sign-in link"}
      </button>
      <button type="button" className="text-sm underline underline-offset-4" onClick={() => setMode(mode === "password" ? "link" : "password")}>
        {mode === "password" ? "Use an email link instead" : "Use a password instead"}
      </button>
    </form>
  );
}
