import Link from "next/link";
import { Empty, PageHead, Panel, Status } from "@/components/admin/ui";
import { date, moneyExact } from "@/lib/format";
import { supabaseServer } from "@/lib/supabase/server";
import type { Order } from "@/lib/types";

export const metadata = { title: "Orders" };

const filters = [
  { key: "all", label: "All" },
  { key: "open", label: "To make or ship" },
  { key: "shipped", label: "Shipped" },
  { key: "closed", label: "Cancelled & refunded" },
];

export default async function Orders({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const { status = "all", q = "" } = await searchParams;
  const sb = await supabaseServer();
  let query = sb.from("orders").select("*").order("created_at", { ascending: false }).limit(200);
  if (status === "open") query = query.in("status", ["paid", "in_production"]);
  if (status === "shipped") query = query.in("status", ["shipped", "delivered"]);
  if (status === "closed") query = query.in("status", ["cancelled", "refunded"]);
  if (q) query = query.ilike("email", `%${q.replace(/[%_]/g, "")}%`);
  const { data } = await query;
  const orders = (data ?? []) as Order[];

  return (
    <>
      <PageHead title="Orders" sub="Paid orders arrive here from Stripe checkout." />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {filters.map((f) => (
          <Link key={f.key} href={`/admin/orders?status=${f.key}`} aria-current={status === f.key ? "page" : undefined} className={`rounded-lg px-3 py-2 font-medium ${status === f.key ? "bg-onyx text-bone" : "bg-white hover:bg-[#fffdf8]"}`}>
            {f.label}
          </Link>
        ))}
        <form className="ml-auto w-full sm:w-72">
          <input type="hidden" name="status" value={status} />
          <label htmlFor="oq" className="sr-only">Search by email</label>
          <input id="oq" name="q" defaultValue={q} placeholder="Search by email" className="field !min-h-10 !py-2" />
        </form>
      </div>
      <Panel>
        {orders.length ? (
          <div className="-mx-2 overflow-x-auto">
            <table className="w-full min-w-[44rem] text-left">
              <thead className="text-sm text-hematite">
                <tr><th className="px-2 py-2 font-medium">Order</th><th className="px-2 font-medium">Date</th><th className="px-2 font-medium">Customer</th><th className="px-2 font-medium">Items</th><th className="px-2 font-medium">Status</th><th className="px-2 text-right font-medium">Total</th></tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-t border-[#eee7da] align-top">
                    <td className="px-2 py-3"><Link href={`/admin/orders/${o.id}`} className="font-medium underline-offset-4 hover:underline">#{o.number}</Link></td>
                    <td className="px-2 py-3 text-hematite">{date(o.created_at)}</td>
                    <td className="px-2 py-3">{o.shipping_address?.name ?? "—"}<span className="block text-sm text-hematite">{o.email}</span></td>
                    <td className="px-2 py-3">{o.items.reduce((a, i) => a + i.qty, 0)}</td>
                    <td className="px-2 py-3"><Status value={o.status} /></td>
                    <td className="tabular px-2 py-3 text-right">{moneyExact(o.total_cents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty>No orders match.</Empty>
        )}
      </Panel>
    </>
  );
}
