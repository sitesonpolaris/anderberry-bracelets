import Link from "next/link";
import { notFound } from "next/navigation";
import CollectionEditor from "@/components/admin/CollectionEditor";
import { PageHead } from "@/components/admin/ui";
import type { CollectionRow } from "@/lib/site";
import { supabaseServer } from "@/lib/supabase/server";

export const metadata = { title: "Edit collection" };

export default async function EditCollection({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const sb = await supabaseServer();
  let collection: CollectionRow | null = null;
  let mainFor = 0;
  let members = 0;
  if (key !== "new") {
    const [{ data }, main, mem] = await Promise.all([
      sb.from("collections").select("*").eq("key", key).maybeSingle(),
      sb.from("products").select("id", { count: "exact", head: true }).eq("collection", key),
      sb.from("product_collections").select("product_id", { count: "exact", head: true }).eq("collection_key", key),
    ]);
    if (!data) notFound();
    collection = data as CollectionRow;
    mainFor = main.count ?? 0;
    members = mem.count ?? 0;
  }
  return (
    <>
      <p className="mb-3"><Link href="/admin/collections" className="text-hematite underline-offset-4 hover:underline">All collections</Link></p>
      <PageHead title={collection ? collection.name : "New collection"} sub={collection ? `${members} product${members === 1 ? "" : "s"} in this collection` : undefined}>
        {collection && <Link href={`/shop?c=${collection.key}`} target="_blank" className="btn btn-quiet !min-h-11">View in shop</Link>}
      </PageHead>
      <CollectionEditor collection={collection} mainFor={mainFor} />
    </>
  );
}
