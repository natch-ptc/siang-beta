-- The landing page's "Join the beta" form (/join-beta) inserts into
-- beta_testers through the Data API as anon. 0007 added the insert-only RLS
-- policy but no table grant, and projects that don't auto-expose new tables
-- then reject the insert with "permission denied". Grant INSERT only: there is
-- still no SELECT, so the list of emails stays unreadable from the API.

grant insert on table public.beta_testers to anon, authenticated;
