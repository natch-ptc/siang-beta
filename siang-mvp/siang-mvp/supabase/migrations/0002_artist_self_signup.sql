-- Lets a newly authenticated user create their own artist profile.
-- (0001_init.sql only allowed updating a row you already own — there was no
-- way to create the row in the first place.)
create policy "user creates own artist profile" on artists for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

-- Tighten the existing update policy: it worked but didn't specify a role or
-- a WITH CHECK, so a user could theoretically reassign a row to someone else.
drop policy "artist manages own row" on artists;
create policy "artist manages own row" on artists for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
