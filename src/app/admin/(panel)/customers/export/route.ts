import { getAdmin, supabaseServer } from "@/lib/supabase/server";

const esc = (v: unknown) => {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export async function GET() {
  if (!(await getAdmin())) return new Response("Not allowed", { status: 403 });
  const sb = await supabaseServer();
  const { data } = await sb.from("customers").select("name,email,phone,address,tags,created_at").order("created_at");
  const head = ["name", "email", "phone", "city", "state", "postal_code", "tags", "first_seen"];
  const lines = (data ?? []).map((c) =>
    [c.name, c.email, c.phone, c.address?.city, c.address?.state, c.address?.postal_code, (c.tags ?? []).join(" "), c.created_at].map(esc).join(","),
  );
  return new Response([head.join(","), ...lines].join("\n"), {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="anderberry-customers.csv"' },
  });
}
