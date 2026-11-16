import Image from "next/image";
import Link from "next/link";
import { Empty, PageHead, Panel } from "@/components/admin/ui";
import { money } from "@/lib/format";
import { collections } from "@/lib/site";
import { supabaseServer } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";

export const metadata = { title: "Products" };

export default async function Products() {
  const sb = await supabaseServer();
  const { data } = await sb.from("products").select("*").order("sort").order("name");
  const products = (data ?? []) as Product[];
  const cname = (k: string) => collections.find((c) => c.key === k)?.name ?? k;

  return (
    <>
      <PageHead title="Products" sub={`${products.length} in the catalogue`}>
        <Link href="/admin/products/new" className="btn btn-gold !min-h-11">Add product</Link>
      </PageHead>
      <Panel>
        {products.length ? (
          <div className="-mx-2 overflow-x-auto">
            <table className="w-full min-w-[42rem] text-left">
              <thead className="text-sm text-hematite">
                <tr><th className="px-2 py-2 font-medium">Product</th><th className="px-2 font-medium">Collection</th><th className="px-2 font-medium">Price</th><th className="px-2 font-medium">In shop</th><th className="px-2 font-medium">Owner to confirm</th></tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-t border-[#eee7da] align-middle">
                    <td className="px-2 py-3">
                      <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3 font-medium hover:underline">
                        <span className="relative h-12 w-10 shrink-0 overflow-hidden rounded-md bg-bone-2">
                          {p.images[0] && <Image src={p.images[0]} alt="" fill sizes="40px" className="object-cover" />}
                        </span>
                        {p.name}
                      </Link>
                    </td>
                    <td className="px-2">{cname(p.collection)}</td>
                    <td className={`tabular px-2 ${p.price_cents == null ? "text-oxblood" : ""}`}>{money(p.price_cents)}</td>
                    <td className="px-2">{p.active ? "Yes" : "Hidden"}</td>
                    <td className="max-w-xs px-2 text-sm text-hematite">{p.owner_to_confirm ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty>No products yet.</Empty>
        )}
      </Panel>
    </>
  );
}
