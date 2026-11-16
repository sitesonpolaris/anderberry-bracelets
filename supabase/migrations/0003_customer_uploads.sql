insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('customer-uploads', 'customer-uploads', false, 10485760,
  array['image/png','image/jpeg','image/webp','image/gif','image/heic','image/heif','image/svg+xml'])
on conflict (id) do nothing;

-- Shoppers (signed in or not) may only add files under pending/<uuid>/; they can never read, list, change or delete them.
create policy "shoppers upload customization images" on storage.objects for insert to anon, authenticated
  with check (
    bucket_id = 'customer-uploads'
    and (storage.foldername(name))[1] = 'pending'
    and (storage.foldername(name))[2] ~ '^[0-9a-f-]{36}$'
    and array_length(storage.foldername(name), 1) = 2
  );
create policy "admins read customer uploads" on storage.objects for select to authenticated
  using (bucket_id = 'customer-uploads' and public.is_admin());
create policy "admins delete customer uploads" on storage.objects for delete to authenticated
  using (bucket_id = 'customer-uploads' and public.is_admin());
