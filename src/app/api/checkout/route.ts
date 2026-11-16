import { NextResponse } from "next/server";
import { priceFor } from "@/lib/pricing";
import { seedProducts } from "@/lib/seed";
import { site, wristSizes } from "@/lib/site";
import { getStripe } from "@/lib/stripe";
import { hasSupabase } from "@/lib/supabase/env";
import { supabasePublic } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";

type Item = { productId: string; qty: number; style?: string; size?: string; options?: Record<string, string>; personalization?: string };

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
    const styleObj = (p?.styles ?? []).find((s) => s.name === i.style);
    const unit = p ? priceFor(p, styleObj?.key) : null;
    if (!p || unit == null) {
      return NextResponse.json({ error: "Something in your bag is no longer available. Please remove it and try again." }, { status: 409 });
    }
    if (p.styles.length && !styleObj) return NextResponse.json({ error: `Choose a style for ${p.name}.` }, { status: 400 });
    const style = styleObj?.name;
    const size = wristSizes.find((s) => s.value === i.size);
    if (p.needs_size && !size) return NextResponse.json({ error: `Choose a wrist size for ${p.name}.` }, { status: 400 });
    const chosen: string[] = [];
    for (const o of p.options ?? []) {
      const v = i.options?.[o.label];
      if (!v || !o.values.includes(v)) return NextResponse.json({ error: `Choose a ${o.label.toLowerCase()} option for ${p.name}.` }, { status: 400 });
      chosen.push(`${o.label}: ${v}`);
    }
    const note = typeof i.personalization === "string" ? i.personalization.trim().slice(0, 400) : "";
    const desc = [style, ...chosen, size && `Wrist ${size.label}`].filter(Boolean).join(" · ");
    subtotal += unit * i.qty;
    summary.push({ slug: p.slug, qty: i.qty, style, size: size?.value });
    lineItems.push({
      quantity: i.qty,
      price_data: {
        currency: "usd",
        unit_amount: unit,
        product_data: {
          name: p.name,
          ...(desc && { description: desc }),
          ...(p.images[0] && { images: [new URL(p.images[0], site.url).toString()] }),
          metadata: { product_id: p.id, slug: p.slug, style: style ?? "", size: size?.value ?? "", options: chosen.join(" · ").slice(0, 490), personalization: note.slice(0, 490) },
        },
      },
    });
  }

  const free = subtotal >= site.shipping.freeOverCents;
  const origin = req.headers.get("origin") || site.url;

  let session;
  try {
    session = await stripe.checkout.sessions.create({
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
  } catch (err) {
    console.error("stripe checkout", err);
    return NextResponse.json({ error: "We couldn’t open checkout. Please try again in a minute, or email us to order." }, { status: 502 });
  }

  return NextResponse.json({ url: session.url });
}
