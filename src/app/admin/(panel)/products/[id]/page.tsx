import Link from "next/link";
import { notFound } from "next/navigation";
import ProductEditor from "@/components/admin/ProductEditor";
import { PageHead } from "@/components/admin/ui";
import { supabaseServer } from "@/lib/supabase/server";
import { normalize } from "@/lib/products";
import type { CollectionRow } from "@/lib/site";
import type { Product } from "@/lib/types";

export const metadata = { title: "Edit product" };

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let product: Product | null = null;
  if (id !== "new") {
    const sb = await supabaseServer();
    const { data } = await sb.from("products").select("*, product_collections(collection_key)").eq("id", id).maybeSingle();
    if (!data) notFound();
    product = normalize(data);
  }
  const sbc = await supabaseServer();
  const { data: cols } = await sbc.from("collections").select("*").order("sort").order("name");
  return (
    <>
      <p className="mb-3"><Link href="/admin/products" className="text-hematite underline-offset-4 hover:underline">All products</Link></p>
      <PageHead title={product ? product.name : "New product"}>
        {product && <Link href={`/shop/${product.slug}`} target="_blank" className="btn btn-quiet !min-h-11">View in shop</Link>}
      </PageHead>
      <ProductEditor product={product} collections={(cols ?? []) as CollectionRow[]} />
    </>
  );
}
