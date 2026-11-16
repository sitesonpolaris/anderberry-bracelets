import Link from "next/link";
import { Empty, PageHead, Panel, Status } from "@/components/admin/ui";
import { date, moneyExact } from "@/lib/format";
import { supabaseServer } from "@/lib/supabase/server";
import type { Order } from "@/lib/types";

export const metadata = { title: "Overview" };

export default async function Overview() {
  const sb = await supabaseServer();
  const since = new Date(Date.now() - 30 * 864e5).toISOString();
  const [recent, month, requests, unpriced, customers] = await Promise.all([
    sb.from("orders").select("*").order("created_at", { ascending: false }).limit(8),
    sb.from("orders").select("total_cents,status").gte("created_at", since),
    sb.from("custom_requests").select("id", { count: "exact", head: true }).eq("status", "new"),
    sb.from("products").select("id,name,slug").is("price_cents", null).eq("active", true),
    sb.from("customers").select("id", { count: "exact", head: true }),
  ]);
  const paid = (month.data ?? []).filter((o) => !["cancelled", "refunded"].includes(o.status));
  const revenue = paid.reduce((a, o) => a + o.total_cents, 0);
  const toMake = ((recent.data ?? []) as Order[]).filter((o) => o.status === "paid" || o.status === "in_production").length;

  const stats = [
    { label: "Sales, last 30 days", value: moneyExact(revenue), href: "/admin/orders" },
    { label: "Orders, last 30 days", value: String(paid.length), href: "/admin/orders" },
    { label: "Orders to make or ship", value: String(toMake), href: "/admin/orders?status=open" },
    { label: "New custom requests", value: String(requests.count ?? 0), href: "/admin/requests" },
    { label: "Customers", value: String(customers.count ?? 0), href: "/admin/customers" },
  ];

  return (
    <>
      <PageHead title="Overview" sub="What needs you today." />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="rounded-2xl bg-white p-5 transition-colors hover:bg-[#fffdf8]">
            <p className="text-hematite">{s.label}</p>
            <p className="tabular mt-2 text-[2rem] font-semibold leading-none">{s.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Panel title="Recent orders" className="xl:col-span-2">
          {recent.data?.length ? (
            <div className="-mx-2 overflow-x-auto">
              <table className="w-full min-w-[34rem] text-left">
                <thead className="text-sm text-hematite">
                  <tr><th className="px-2 py-2 font-medium">Order</th><th className="px-2 font-medium">Customer</th><th className="px-2 font-medium">Status</th><th className="px-2 text-right font-medium">Total</th></tr>
                </thead>
                <tbody>
                  {(recent.data as Order[]).map((o) => (
                    <tr key={o.id} className="border-t border-[#eee7da]">
                      <td className="px-2 py-3"><Link href={`/admin/orders/${o.id}`} className="font-medium underline-offset-4 hover:underline">#{o.number}</Link><span className="block text-sm text-hematite">{date(o.created_at)}</span></td>
                      <td className="px-2">{o.shipping_address?.name ?? o.email}</td>
                      <td className="px-2"><Status value={o.status} /></td>
                      <td className="tabular px-2 text-right">{moneyExact(o.total_cents)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty>No orders yet. They’ll appear here as soon as someone checks out.</Empty>
          )}
        </Panel>
        <Panel title="Prices to set">
          {unpriced.data?.length ? (
            <>
              <p className="mb-3 text-hematite">These show “Ask for price” in the shop until they have a price.</p>
              <ul className="space-y-1">
                {unpriced.data.map((p) => (
                  <li key={p.id}><Link href={`/admin/products/${p.id}`} className="block rounded-lg px-2 py-2 hover:bg-[#f7f4ee]">{p.name}</Link></li>
                ))}
              </ul>
            </>
          ) : (
            <Empty>Every active product has a price.</Empty>
          )}
        </Panel>
      </div>
    </>
  );
}
