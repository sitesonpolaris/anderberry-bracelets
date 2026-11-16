import Link from "next/link";
import { Empty, PageHead, Panel } from "@/components/admin/ui";
import { date, moneyExact } from "@/lib/format";
import { supabaseServer } from "@/lib/supabase/server";
import type { Customer } from "@/lib/types";

export const metadata = { title: "Customers" };

export default async function Customers({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const sb = await supabaseServer();
  let query = sb.from("customers").select("*, orders(total_cents,status,created_at)").order("created_at", { ascending: false }).limit(300);
  const term = q.replace(/[%_,()]/g, "").trim();
  if (term) query = query.or(`email.ilike.%${term}%,name.ilike.%${term}%,phone.ilike.%${term}%`);
  const { data } = await query;
  const rows = (data ?? []) as (Customer & { orders: { total_cents: number; status: string; created_at: string }[] })[];

  return (
    <>
      <PageHead title="Customers" sub="Everyone who has checked out. Added automatically from Stripe.">
        <a href={`/admin/customers/export`} className="btn btn-quiet !min-h-11">Download CSV</a>
      </PageHead>
      <form className="mb-4 max-w-sm">
        <label htmlFor="cq" className="sr-only">Search customers</label>
        <input id="cq" name="q" defaultValue={q} placeholder="Search name, email or phone" className="field !min-h-10 !py-2" />
      </form>
      <Panel>
        {rows.length ? (
          <div className="-mx-2 overflow-x-auto">
            <table className="w-full min-w-[42rem] text-left">
              <thead className="text-sm text-hematite">
                <tr><th className="px-2 py-2 font-medium">Customer</th><th className="px-2 font-medium">Location</th><th className="px-2 font-medium">Orders</th><th className="px-2 font-medium">Spent</th><th className="px-2 font-medium">Last order</th></tr>
              </thead>
              <tbody>
                {rows.map((c) => {
                  const kept = c.orders.filter((o) => !["cancelled", "refunded"].includes(o.status));
                  const last = c.orders.map((o) => o.created_at).sort().at(-1);
                  return (
                    <tr key={c.id} className="border-t border-[#eee7da]">
                      <td className="px-2 py-3"><Link href={`/admin/customers/${c.id}`} className="font-medium hover:underline">{c.name ?? c.email}</Link><span className="block text-sm text-hematite">{c.email}</span></td>
                      <td className="px-2">{c.address?.city ? `${c.address.city}, ${c.address.state ?? ""}` : "—"}</td>
                      <td className="tabular px-2">{c.orders.length}</td>
                      <td className="tabular px-2">{moneyExact(kept.reduce((a, o) => a + o.total_cents, 0))}</td>
                      <td className="px-2 text-hematite">{last ? date(last) : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty>{q ? "No customers match." : "No customers yet. They’re added when someone checks out."}</Empty>
        )}
      </Panel>
    </>
  );
}
