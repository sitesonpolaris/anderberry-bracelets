create table public.collections (
  key text primary key check (key ~ '^[a-z0-9-]+$'),
  name text not null check (char_length(name) between 1 and 80),
  blurb text not null default '',
  image text,
  sort integer not null default 100,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger collections_touch before update on public.collections
  for each row execute function public.touch_updated_at();
alter table public.collections enable row level security;
create policy "public reads active collections" on public.collections for select
  to anon, authenticated using (active or public.is_admin());
create policy "admins insert collections" on public.collections for insert to authenticated with check (public.is_admin());
create policy "admins update collections" on public.collections for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins delete collections" on public.collections for delete to authenticated using (public.is_admin());

insert into public.collections (key, name, blurb, image, sort) values
  ('tap-to-connect', 'Tap-to-Connect', 'Stone bracelets with an NFC chip set in the centerpiece. One tap shares your link.', '/products/ttc-tiger-onyx-hex.webp', 10),
  ('gemstone', 'Gemstone', 'Onyx, tiger eye, hematite and agate, strung by hand for everyday wear.', '/products/tiger-eye-hex.webp', 20),
  ('custom', 'Custom logo', 'Your organization’s logo sealed into a charm on bracelets, keychains and pins.', '/products/logo-charm-agate.webp', 30),
  ('pins', 'Pins & cigar pokers', 'Logo lapel pins, NFC optional, and beaded cigar nub holders.', '/products/hat-pin-display.webp', 40)
on conflict (key) do nothing;

-- Many-to-many: a product can sit in several collections
create table public.product_collections (
  product_id uuid not null references public.products(id) on delete cascade,
  collection_key text not null references public.collections(key) on update cascade on delete cascade,
  primary key (product_id, collection_key)
);
create index product_collections_key_idx on public.product_collections (collection_key);
alter table public.product_collections enable row level security;
create policy "public reads memberships of active products" on public.product_collections for select
  to anon, authenticated using (
    exists (select 1 from public.products p where p.id = product_id and (p.active or public.is_admin()))
  );
create policy "admins insert memberships" on public.product_collections for insert to authenticated with check (public.is_admin());
create policy "admins delete memberships" on public.product_collections for delete to authenticated using (public.is_admin());

insert into public.product_collections (product_id, collection_key)
select id, collection from public.products
on conflict do nothing;

-- products.collection is now the product's main collection (breadcrumb, related items)
alter table public.products
  add constraint products_collection_fkey foreign key (collection)
  references public.collections(key) on update cascade on delete restrict;
comment on column public.products.collection is 'Main collection (breadcrumb, related items). Full membership lives in product_collections.';

-- The old fixed list is replaced by the foreign key
alter table public.products drop constraint if exists products_collection_check;
