import { NextResponse } from "next/server";
import { seedProducts } from "@/lib/seed";
import { site, wristSizes } from "@/lib/site";
import { getStripe } from "@/lib/stripe";
import { hasSupabase } from "@/lib/supabase/env";
import { supabasePublic } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";

type Item = { productId: string; qty: number; style?: string; size?: string };

export async function POST(req: Request) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Checkout isn’t switched on yet. Please email us to order." }, { status: 503 });
  }

  let items: Item[];
  try {
    const body = await req.json();
    items = Array.isArray(body.items) ? body.items : [];
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  items = items
    .filter((i) => typeof i.productId === "string" && Number.isInteger(i.qty) && i.qty > 0 && i.qty <= 99)
    .slice(0, 50);
  if (!items.length) return NextResponse.json({ error: "Your bag is empty." }, { status: 400 });

  // Prices always come from the database, never from the browser.
  const ids = [...new Set(items.map((i) => i.productId))];
  let products: Product[];
  if (hasSupabase) {
    const { data, error } = await supabasePublic().from("products").select("*").in("id", ids).eq("active", true);
    if (error) return NextResponse.json({ error: "Couldn’t load products. Try again." }, { status: 500 });
    products = (data ?? []) as Product[];
  } else {
    products = seedProducts.filter((p) => ids.includes(p.id));
  }
  const byId = new Map(products.map((p) => [p.id, p]));

  const lineItems = [];
  const summary: { slug: string; qty: number; style?: string; size?: string }[] = [];
  let subtotal = 0;
  for (const i of items) {
    const p = byId.get(i.productId);
    if (!p || p.price_cents == null) {
      return NextResponse.json({ error: "Something in your bag is no longer available. Please remove it and try again." }, { status: 409 });
    }
    const style = p.styles.find((s) => s.name === i.style)?.name;
    const size = wristSizes.find((s) => s.value === i.size);
    if (p.needs_size && !size) return NextResponse.json({ error: `Choose a wrist size for ${p.name}.` }, { status: 400 });
    const desc = [style, size && `Wrist ${size.label}`].filter(Boolean).join(" · ");
    subtotal += p.price_cents * i.qty;
    summary.push({ slug: p.slug, qty: i.qty, style, size: size?.value });
    lineItems.push({
      quantity: i.qty,
      price_data: {
        currency: "usd",
        unit_amount: p.price_cents,
        product_data: {
          name: p.name,
          ...(desc && { description: desc }),
          ...(p.images[0] && { images: [new URL(p.images[0], site.url).toString()] }),
          metadata: { product_id: p.id, slug: p.slug, style: style ?? "", size: size?.value ?? "" },
        },
      },
    });
  }

  const free = subtotal >= site.shipping.freeOverCents;
  const origin = req.headers.get("origin") || site.url;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: lineItems,
    shipping_address_collection: { allowed_countries: ["US"] },
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          display_name: free ? "Free shipping" : "Standard shipping",
          fixed_amount: { amount: free ? 0 : site.shipping.flatRateCents, currency: "usd" },
          delivery_estimate: { minimum: { unit: "business_day", value: 5 }, maximum: { unit: "business_day", value: 10 } },
        },
      },
    ],
    phone_number_collection: { enabled: true },
    customer_creation: "always",
    allow_promotion_codes: true,
    automatic_tax: { enabled: process.env.STRIPE_AUTOMATIC_TAX === "true" },
    metadata: { cart: JSON.stringify(summary).slice(0, 500) },
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/shop`,
  });

  return NextResponse.json({ url: session.url });
}
