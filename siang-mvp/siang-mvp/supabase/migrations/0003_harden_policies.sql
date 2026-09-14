-- Explicitly scope every write policy to `authenticated` rather than relying
-- only on the ownership subquery in USING. Belt-and-suspenders per Supabase's
-- RLS security checklist: TO authenticated + an ownership predicate.

drop policy "artist manages own contacts" on artist_contacts;
create policy "artist manages own contacts" on artist_contacts for all
  to authenticated
  using (artist_id in (select id from artists where user_id = (select auth.uid())))
  with check (artist_id in (select id from artists where user_id = (select auth.uid())));

drop policy "artist manages own artworks" on artworks;
create policy "artist manages own artworks" on artworks for all
  to authenticated
  using (artist_id in (select id from artists where user_id = (select auth.uid())))
  with check (artist_id in (select id from artists where user_id = (select auth.uid())));

drop policy "artist manages own artwork_blocks" on artwork_blocks;
create policy "artist manages own artwork_blocks" on artwork_blocks for all
  to authenticated
  using (artwork_id in (
    select aw.id from artworks aw join artists a on a.id = aw.artist_id where a.user_id = (select auth.uid())
  ))
  with check (artwork_id in (
    select aw.id from artworks aw join artists a on a.id = aw.artist_id where a.user_id = (select auth.uid())
  ));

drop policy "artist manages own exhibitions" on exhibitions;
create policy "artist manages own exhibitions" on exhibitions for all
  to authenticated
  using (artist_id in (select id from artists where user_id = (select auth.uid())))
  with check (artist_id in (select id from artists where user_id = (select auth.uid())));

drop policy "artist reads own plays" on plays;
create policy "artist reads own plays" on plays for select
  to authenticated
  using (artwork_id in (
    select aw.id from artworks aw join artists a on a.id = aw.artist_id where a.user_id = (select auth.uid())
  ));
