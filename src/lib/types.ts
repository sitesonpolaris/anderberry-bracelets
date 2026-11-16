import type { Collection } from "./site";

export type ProductStyle = { key: string; name: string; image?: string };

export type Product = {
  id: string;
  slug: string;
  name: string;
  collection: Collection;
  tagline: string;
  description: string;
  price_cents: number | null;
  images: string[];
  styles: ProductStyle[];
  stones: string[];
  is_nfc: boolean;
  needs_size: boolean;
  inventory: number | null;
  active: boolean;
  featured: boolean;
  sort: number;
  owner_to_confirm: string | null;
};

export type CartLine = {
  id: string; // product id + options
  productId: string;
  slug: string;
  name: string;
  image: string;
  priceCents: number;
  style?: string;
  size?: string;
  qty: number;
};

export type Customer = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  stripe_customer_id: string | null;
  address: Record<string, string | null> | null;
  tags: string[];
  notes: string | null;
  created_at: string;
};

export type Order = {
  id: string;
  number: number;
  customer_id: string | null;
  email: string;
  status: "paid" | "in_production" | "shipped" | "delivered" | "cancelled" | "refunded";
  subtotal_cents: number;
  shipping_cents: number;
  tax_cents: number;
  total_cents: number;
  shipping_address: { name?: string; line1?: string; line2?: string; city?: string; state?: string; postal_code?: string; country?: string } | null;
  items: { name: string; qty: number; price_cents: number; style?: string; size?: string; slug?: string }[];
  tracking_number: string | null;
  notes: string | null;
  created_at: string;
};

export type CustomRequest = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  organization: string | null;
  kind: string;
  quantity: number | null;
  details: string;
  design: Record<string, unknown> | null;
  product_slug: string | null;
  status: "new" | "quoted" | "won" | "closed";
  created_at: string;
};
