import Image from "next/image";
import Link from "next/link";
import { Empty, PageHead, Panel } from "@/components/admin/ui";
import type { CollectionRow } from "@/lib/site";
import { supabaseServer } from "@/lib/supabase/server";

export const metadata = { title: "Collections" };

export default async function Collections() {
  const sb = await supabaseServer();
  const [{ data }, { data: members }] = await Promise.all([
    sb.from("collections").select("*").order("sort").order("name"),
    sb.from("product_collections").select("collection_key"),
  ]);
  const cols = (data ?? []) as CollectionRow[];
  const counts = new Map<string, number>();
  (members ?? []).forEach((m) => counts.set(m.collection_key, (counts.get(m.collection_key) ?? 0) + 1));

  return (
    <>
      <PageHead title="Collections" sub="The shop’s categories. The first one also appears in the main menu and as the big tile on the home page.">
        <Link href="/admin/collections/new" className="btn btn-gold !min-h-11">Add collection</Link>
      </PageHead>
      <Panel>
        {cols.length ? (
          <ul className="divide-y divide-[#eee7da]">
            {cols.map((c, i) => (
              <li key={c.key}>
                <Link href={`/admin/collections/${c.key}`} className="flex items-center gap-4 rounded-lg px-2 py-3 hover:bg-[#f7f4ee]">
                  <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-bone-2">
                    {c.image && <Image src={c.image} alt="" fill sizes="56px" className="object-cover" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">
                      {c.name}
                      {i === 0 && c.active && <span className="ml-2 text-sm font-normal text-hematite">· in main menu</span>}
                      {!c.active && <span className="ml-2 text-sm font-normal text-oxblood">· hidden</span>}
                    </span>
                    <span className="block truncate text-sm text-hematite">/shop?c={c.key}</span>
                  </span>
                  <span className="tabular shrink-0 text-hematite">{counts.get(c.key) ?? 0} products</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <Empty>No collections yet.</Empty>
        )}
      </Panel>
    </>
  );
}
