alter table public.products add column if not exists options jsonb not null default '[]'::jsonb;
alter table public.products add column if not exists personalization_prompt text;
comment on column public.products.options is 'Extra required choices: [{"label":"Customization","values":["Logo","Photo"]}]';
comment on column public.products.styles is 'Stone/color variants: [{"key","name","image"?,"price_cents"?}] — price_cents overrides the product price';
