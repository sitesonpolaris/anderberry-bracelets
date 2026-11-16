import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { supabaseService } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const sig = req.headers.get("stripe-signature");
  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig ?? "", secret);
  } catch {
    return NextResponse.json({ error: "Bad signature" }, { status: 400 });
  }

  const db = supabaseService();

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const s = await stripe.checkout.sessions.retrieve((event.data.object as Stripe.Checkout.Session).id, {
      expand: ["line_items.data.price.product", "collected_information"],
    });
    if (s.payment_status !== "paid") return NextResponse.json({ ok: true });

    const email = s.customer_details?.email ?? "";
    const ship = s.collected_information?.shipping_details;
    const addr = ship?.address ?? s.customer_details?.address ?? null;
    const address = addr
      ? { name: ship?.name ?? s.customer_details?.name ?? null, line1: addr.line1, line2: addr.line2, city: addr.city, state: addr.state, postal_code: addr.postal_code, country: addr.country }
      : null;

    // Upsert the customer by email
    const { data: existing } = await db.from("customers").select("id").ilike("email", email).maybeSingle();
    let customerId = existing?.id as string | undefined;
    const customerFields = {
      email,
      name: s.customer_details?.name ?? null,
      phone: s.customer_details?.phone ?? null,
      stripe_customer_id: typeof s.customer === "string" ? s.customer : s.customer?.id ?? null,
      address,
    };
    if (customerId) await db.from("customers").update(customerFields).eq("id", customerId);
    else {
      const { data } = await db.from("customers").insert(customerFields).select("id").single();
      customerId = data?.id;
    }

    const items = (s.line_items?.data ?? []).map((li) => {
      const prod = li.price?.product as Stripe.Product | undefined;
      return {
        name: li.description,
        qty: li.quantity ?? 1,
        price_cents: li.price?.unit_amount ?? 0,
        slug: prod?.metadata?.slug,
        style: prod?.metadata?.style || undefined,
        size: prod?.metadata?.size || undefined,
      };
    });

    await db.from("orders").upsert(
      {
        stripe_session_id: s.id,
        stripe_payment_intent: typeof s.payment_intent === "string" ? s.payment_intent : s.payment_intent?.id ?? null,
        customer_id: customerId ?? null,
        email,
        status: "paid",
        subtotal_cents: s.amount_subtotal ?? 0,
        shipping_cents: s.total_details?.amount_shipping ?? 0,
        tax_cents: s.total_details?.amount_tax ?? 0,
        total_cents: s.amount_total ?? 0,
        currency: s.currency ?? "usd",
        shipping_address: address,
        items,
      },
      { onConflict: "stripe_session_id" },
    );
  }

  if (event.type === "charge.refunded") {
    const ch = event.data.object as Stripe.Charge;
    const pi = typeof ch.payment_intent === "string" ? ch.payment_intent : ch.payment_intent?.id;
    if (pi && ch.refunded) await db.from("orders").update({ status: "refunded" }).eq("stripe_payment_intent", pi);
  }

  return NextResponse.json({ ok: true });
}
