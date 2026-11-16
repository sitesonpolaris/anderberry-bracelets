import type { Product } from "./types";

/** Price for a product, taking the chosen style's price when it has one. */
export function priceFor(p: Pick<Product, "price_cents" | "styles">, styleKey?: string): number | null {
  const style = p.styles.find((s) => s.key === styleKey);
  if (style?.price_cents != null) return style.price_cents;
  return p.price_cents;
}

/** Lowest and highest price across styles, for "From $75" labels. */
export function priceRange(p: Pick<Product, "price_cents" | "styles">): { min: number | null; max: number | null } {
  const prices = [p.price_cents, ...p.styles.map((s) => s.price_cents)].filter((x): x is number => x != null);
  if (!prices.length) return { min: null, max: null };
  return { min: Math.min(...prices), max: Math.max(...prices) };
}
