import "server-only";
import type { Collection } from "./site";
import type { Product } from "./types";
import { seedProducts } from "./seed";
import { hasSupabase } from "./supabase/env";
import { supabasePublic } from "./supabase/server";

function normalize(row: Record<string, unknown>): Product {
  const r = row as unknown as Product;
  return { ...r, images: r.images ?? [], styles: (r.styles as Product["styles"]) ?? [], stones: r.stones ?? [] };
}

export async function getProducts(collection?: Collection): Promise<Product[]> {
  if (!hasSupabase) return seedProducts.filter((p) => !collection || p.collection === collection);
  let q = supabasePublic().from("products").select("*").eq("active", true).order("sort").order("name");
  if (collection) q = q.eq("collection", collection);
  const { data, error } = await q;
  if (error || !data) {
    console.error("getProducts", error);
    return seedProducts.filter((p) => !collection || p.collection === collection);
  }
  return data.map(normalize);
}

export async function getProduct(slug: string): Promise<Product | null> {
  if (!hasSupabase) return seedProducts.find((p) => p.slug === slug) ?? null;
  const { data, error } = await supabasePublic().from("products").select("*").eq("slug", slug).eq("active", true).maybeSingle();
  if (error) console.error("getProduct", error);
  return data ? normalize(data) : null;
}
