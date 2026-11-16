-- AnderBerry Bracelets: core schema
create extension if not exists pgcrypto;

-- Admins ---------------------------------------------------------------
create table public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

create policy "admins read self" on public.admins for select to authenticated
  using (user_id = auth.uid());

-- updated_at helper ----------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

-- Products -------------------------------------------------------------
create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null,
  collection text not null check (collection in ('tap-to-connect','gemstone','custom','pins')),
  tagline text not null default '',
  description text not null default '',
  price_cents integer check (price_cents is null or price_cents >= 0),
  images text[] not null default '{}',
  styles jsonb not null default '[]'::jsonb,   -- [{key,name,image}]
  stones text[] not null default '{}',
  is_nfc boolean not null default false,
  needs_size boolean not null default true,
  inventory integer,                            -- null = made to order
  active boolean not null default true,
  featured boolean not null default false,
  sort integer not null default 100,
  owner_to_confirm text,                        -- note of unconfirmed facts
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();
alter table public.products enable row level security;
create policy "public reads active products" on public.products for select
  to anon, authenticated using (active or public.is_admin());
create policy "admins insert products" on public.products for insert to authenticated with check (public.is_admin());
create policy "admins update products" on public.products for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins delete products" on public.products for delete to authenticated using (public.is_admin());

-- Customers ------------------------------------------------------------
create table public.customers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  name text,
  phone text,
  stripe_customer_id text unique,
  address jsonb,
  tags text[] not null default '{}',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index customers_email_key on public.customers (lower(email));
create trigger customers_touch before update on public.customers
  for each row execute function public.touch_updated_at();
alter table public.customers enable row level security;
create policy "admins manage customers" on public.customers for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Orders ---------------------------------------------------------------
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  number bigint generated always as identity (start with 1001) unique,
  customer_id uuid references public.customers(id) on delete set null,
  email text not null,
  stripe_session_id text unique,
  stripe_payment_intent text,
  status text not null default 'paid' check (status in ('paid','in_production','shipped','delivered','cancelled','refunded')),
  subtotal_cents integer not null default 0,
  shipping_cents integer not null default 0,
  tax_cents integer not null default 0,
  total_cents integer not null default 0,
  currency text not null default 'usd',
  shipping_address jsonb,
  items jsonb not null default '[]'::jsonb,
  tracking_number text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index orders_customer_idx on public.orders (customer_id);
create index orders_created_idx on public.orders (created_at desc);
create trigger orders_touch before update on public.orders
  for each row execute function public.touch_updated_at();
alter table public.orders enable row level security;
create policy "admins manage orders" on public.orders for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Custom requests (quotes, bulk logo orders, unpriced pieces) ----------
create table public.custom_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 200 and email like '%@%'),
  phone text check (phone is null or char_length(phone) <= 40),
  organization text check (organization is null or char_length(organization) <= 160),
  kind text not null default 'custom' check (kind in ('custom','bulk-logo','price','tap-to-connect','other')),
  quantity integer check (quantity is null or quantity between 1 and 100000),
  details text not null default '' check (char_length(details) <= 4000),
  design jsonb,
  product_slug text,
  status text not null default 'new' check (status in ('new','quoted','won','closed')),
  created_at timestamptz not null default now()
);
alter table public.custom_requests enable row level security;
create policy "anyone can submit a request" on public.custom_requests for insert
  to anon, authenticated with check (status = 'new');
create policy "admins read requests" on public.custom_requests for select to authenticated using (public.is_admin());
create policy "admins update requests" on public.custom_requests for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins delete requests" on public.custom_requests for delete to authenticated using (public.is_admin());

-- Storage: product images ---------------------------------------------
insert into storage.buckets (id, name, public) values ('product-images','product-images', true)
  on conflict (id) do nothing;
create policy "admins upload product images" on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());
create policy "admins update product images" on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and public.is_admin());
create policy "admins delete product images" on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and public.is_admin());
