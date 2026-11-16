import Link from "next/link";
import { notFound } from "next/navigation";
import OrderEditor from "@/components/admin/OrderEditor";
import { PageHead, Panel, Status } from "@/components/admin/ui";
import { date, moneyExact } from "@/lib/format";
import { wristSizes } from "@/lib/site";
import { supabaseServer } from "@/lib/supabase/server";
import type { Order } from "@/lib/types";

export const metadata = { title: "Order" };

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await supabaseServer();
  const { data } = await sb.from("orders").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const o = data as Order;
  const a = o.shipping_address;
  const sizeLabel = (v?: string) => wristSizes.find((s) => s.value === v)?.label;

  // Customer images live in a private bucket; sign short-lived links for the admin
  const paths = o.items.flatMap((i) => i.uploads ?? []);
  const signed = new Map<string, string>();
  if (paths.length) {
    const { data: links } = await sb.storage.from("customer-uploads").createSignedUrls(paths, 3600);
    links?.forEach((l) => l.path && l.signedUrl && signed.set(l.path, l.signedUrl));
  }

  return (
    <>
      <p className="mb-3"><Link href="/admin/orders" className="text-hematite underline-offset-4 hover:underline">All orders</Link></p>
      <PageHead title={`Order #${o.number}`} sub={`Placed ${date(o.created_at)}`}>
        <Status value={o.status} />
      </PageHead>
      <div className="grid gap-6 xl:grid-cols-3">
        <Panel title="Items to make" className="xl:col-span-2">
          <ul className="divide-y divide-[#eee7da]">
            {o.items.map((i, k) => (
              <li key={k} className="flex justify-between gap-4 py-3">
                <div>
                  <p className="font-medium">{i.qty} × {i.name}</p>
                  <p className="text-hematite">{[i.style, i.options, i.size && `Wrist ${sizeLabel(i.size) ?? i.size}`].filter(Boolean).join(" · ") || "No options"}</p>
                  {i.personalization && <p className="mt-1 rounded-lg bg-[#f7f4ee] px-3 py-2">“{i.personalization}”</p>}
                  {i.uploads?.length ? (
                    <ul className="mt-2 flex flex-wrap gap-2" aria-label="Customer images">
                      {i.uploads.map((path, k) => {
                        const url = signed.get(path);
                        const name = path.split("/").pop()?.replace(/^\d+-/, "") ?? "image";
                        return (
                          <li key={path}>
                            {url ? (
                              <a href={url} target="_blank" rel="noopener noreferrer" className="group block" title={`Open ${name}`}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={url} alt={`Customer image ${k + 1}: ${name}`} className="h-20 w-20 rounded-lg bg-[#f7f4ee] object-cover transition-opacity group-hover:opacity-80" />
                              </a>
                            ) : (
                              <span className="grid h-20 w-20 place-items-center rounded-lg bg-[#f7f4ee] px-1 text-center text-xs text-hematite">Missing</span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </div>
                <span className="tabular">{moneyExact(i.price_cents * i.qty)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 grid gap-1 border-t border-[#eee7da] pt-4 tabular">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>{moneyExact(o.subtotal_cents)}</dd></div>
            <div className="flex justify-between"><dt>Shipping</dt><dd>{moneyExact(o.shipping_cents)}</dd></div>
            <div className="flex justify-between"><dt>Tax</dt><dd>{moneyExact(o.tax_cents)}</dd></div>
            <div className="flex justify-between text-lg font-semibold"><dt>Total</dt><dd>{moneyExact(o.total_cents)}</dd></div>
          </dl>
        </Panel>
        <div className="grid content-start gap-6">
          <Panel title="Ship to">
            {a ? (
              <address className="not-italic leading-relaxed">
                {a.name}<br />{a.line1}{a.line2 ? <><br />{a.line2}</> : null}<br />{a.city}, {a.state} {a.postal_code}
              </address>
            ) : <p className="text-hematite">No address</p>}
            <p className="mt-3"><a href={`mailto:${o.email}`} className="underline underline-offset-4">{o.email}</a></p>
            {o.customer_id && <p className="mt-2"><Link href={`/admin/customers/${o.customer_id}`} className="underline underline-offset-4">Customer profile</Link></p>}
          </Panel>
          <Panel title="Fulfilment">
            <OrderEditor order={o} />
          </Panel>
        </div>
      </div>
    </>
  );
}
