-- exhibition_artworks (the join table between shows and the works hung in
-- them) only ever had a public SELECT policy — there was no way for an
-- artist to actually link a work to their own exhibition. Studio's "New
-- exhibition" work checklist was silently failing on every insert.
create policy "artist manages own exhibition_artworks" on exhibition_artworks for all
  to authenticated
  using (
    exhibition_id in (select id from exhibitions where artist_id in (select id from artists where user_id = (select auth.uid())))
  )
  with check (
    exhibition_id in (select id from exhibitions where artist_id in (select id from artists where user_id = (select auth.uid())))
    and artwork_id in (select id from artworks where artist_id in (select id from artists where user_id = (select auth.uid())))
  );
