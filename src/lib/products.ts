import "server-only";
import { fallbackCollections, type CollectionRow } from "./site";
import type { Product } from "./types";
import { seedProducts } from "./seed";
import { hasSupabase } from "./supabase/env";
import { supabasePublic } from "./supabase/server";

type Row = Record<string, unknown> & { product_collections?: { collection_key: string }[] };

export function normalize(row: Row): Product {
  const r = row as unknown as Product;
  const memberships = (row.product_collections ?? []).map((m) => m.collection_key);
  const collections = memberships.length ? memberships : r.collection ? [r.collection] : [];
  return {
    ...r,
    images: r.images ?? [],
    styles: (r.styles as Product["styles"]) ?? [],
    stones: r.stones ?? [],
    options: (r.options as Product["options"]) ?? [],
    collections: collections.includes(r.collection) ? collections : [r.collection, ...collections],
  };
}

const inCollection = (key?: string) => (p: Product) => !key || p.collections.includes(key);

export async function getProducts(collection?: string): Promise<Product[]> {
  if (!hasSupabase) return seedProducts.filter(inCollection(collection));
  const { data, error } = await supabasePublic()
    .from("products")
    .select("*, product_collections(collection_key)")
    .eq("active", true)
    .order("sort")
    .order("name");
  if (error || !data) {
    console.error("getProducts", error);
    return seedProducts.filter(inCollection(collection));
  }
  return (data as Row[]).map(normalize).filter(inCollection(collection));
}

export async function getProduct(slug: string): Promise<Product | null> {
  if (!hasSupabase) return seedProducts.find((p) => p.slug === slug) ?? null;
  const { data, error } = await supabasePublic()
    .from("products")
    .select("*, product_collections(collection_key)")
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();
  if (error) console.error("getProduct", error);
  return data ? normalize(data as Row) : null;
}

/** Active collections in shop order. Falls back to the built-in list if Supabase is unreachable. */
export async function getCollections(): Promise<CollectionRow[]> {
  if (!hasSupabase) return fallbackCollections;
  const { data, error } = await supabasePublic().from("collections").select("*").eq("active", true).order("sort").order("name");
  if (error || !data) {
    console.error("getCollections", error);
    return fallbackCollections;
  }
  return data as CollectionRow[];
}
