import Link from "next/link";
import { notFound } from "next/navigation";
import CustomerEditor from "@/components/admin/CustomerEditor";
import { Empty, PageHead, Panel, Status } from "@/components/admin/ui";
import { date, moneyExact } from "@/lib/format";
import { supabaseServer } from "@/lib/supabase/server";
import type { Customer, Order } from "@/lib/types";

export const metadata = { title: "Customer" };

export default async function CustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await supabaseServer();
  const [{ data: c }, { data: orders }] = await Promise.all([
    sb.from("customers").select("*").eq("id", id).maybeSingle(),
    sb.from("orders").select("*").eq("customer_id", id).order("created_at", { ascending: false }),
  ]);
  if (!c) notFound();
  const customer = c as Customer;
  const list = (orders ?? []) as Order[];
  const spent = list.filter((o) => !["cancelled", "refunded"].includes(o.status)).reduce((a, o) => a + o.total_cents, 0);
  const a = customer.address;

  return (
    <>
      <p className="mb-3"><Link href="/admin/customers" className="text-hematite underline-offset-4 hover:underline">All customers</Link></p>
      <PageHead title={customer.name ?? customer.email} sub={`Customer since ${date(customer.created_at)} · ${list.length} order${list.length === 1 ? "" : "s"} · ${moneyExact(spent)} spent`} />
      <div className="grid gap-6 xl:grid-cols-3">
        <Panel title="Orders" className="xl:col-span-2">
          {list.length ? (
            <ul className="divide-y divide-[#eee7da]">
              {list.map((o) => (
                <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div>
                    <Link href={`/admin/orders/${o.id}`} className="font-medium hover:underline">#{o.number}</Link>
                    <span className="ml-2 text-hematite">{date(o.created_at)}</span>
                    <p className="text-sm text-hematite">{o.items.map((i) => `${i.qty} × ${i.name}`).join(", ")}</p>
                  </div>
                  <div className="flex items-center gap-3"><Status value={o.status} /><span className="tabular">{moneyExact(o.total_cents)}</span></div>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>No orders yet.</Empty>
          )}
        </Panel>
        <div className="grid content-start gap-6">
          <Panel title="Contact">
            <p><a href={`mailto:${customer.email}`} className="underline underline-offset-4">{customer.email}</a></p>
            {customer.phone && <p className="mt-1"><a href={`tel:${customer.phone}`} className="underline underline-offset-4">{customer.phone}</a></p>}
            {a?.line1 && (
              <address className="mt-3 not-italic leading-relaxed text-hematite">
                {a.line1}{a.line2 ? <><br />{a.line2}</> : null}<br />{a.city}, {a.state} {a.postal_code}
              </address>
            )}
          </Panel>
          <Panel title="Notes & tags">
            <CustomerEditor customer={customer} />
          </Panel>
        </div>
      </div>
    </>
  );
}
