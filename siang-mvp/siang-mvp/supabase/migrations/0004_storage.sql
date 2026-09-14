-- Public storage bucket for artist-uploaded photos: card/avatar images and
-- per-work cover photos. Files are keyed by "{user_id}/{filename}" so RLS can
-- restrict writes to each artist's own folder while keeping reads public.
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "public read media" on storage.objects for select
  using (bucket_id = 'media');

create policy "users manage own media" on storage.objects for all
  to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'media' and (storage.foldername(name))[1] = (select auth.uid())::text);
