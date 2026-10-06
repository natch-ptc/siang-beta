-- Siang v3 (PRD v3.0): the fields the new pages show.
-- Everything here is additive and nullable, so existing rows and the code
-- deployed before this migration keep working.

-- ---------- works: PRD 7.2 ----------
-- Year, medium and size sit under the title on a work's page; height and
-- width also draw the work against a human figure (PRD 6.12).
alter table artworks add column year       int     check (year between 1000 and 2100);
alter table artworks add column medium     text    check (char_length(medium) <= 120);
alter table artworks add column height_cm  numeric check (height_cm > 0);
alter table artworks add column width_cm   numeric check (width_cm > 0);
alter table artworks add column depth_cm   numeric check (depth_cm > 0);

-- ---------- exhibitions: PRD 6.5, "information to actually go" ----------
-- A row with a venue is an exhibition; a row without one is a collection (a
-- series the artist pulled together, PRD "set"). Dates give "now showing",
-- days left and the closing-soonest-first order of the Exhibition tab.
alter table exhibitions add column starts_on date;
alter table exhibitions add column ends_on   date;
alter table exhibitions add column city      text check (char_length(city) <= 80);
alter table exhibitions add column hours     text check (char_length(hours) <= 160);
alter table exhibitions add column entry     text check (char_length(entry) <= 80); -- "Free", "200 THB"
alter table exhibitions add constraint exhibitions_dates_order check (ends_on is null or starts_on is null or ends_on >= starts_on);

-- ---------- reports: the Report button on every page (PRD 12.2) ----------
-- Insert-only from the browser, like beta_testers: nobody can read the list
-- through the API; the team reads it in the Supabase dashboard.
create table reports (
  id          uuid primary key default gen_random_uuid(),
  page        text not null check (char_length(page) between 1 and 300),
  reason      text not null check (char_length(reason) between 1 and 1000),
  status      text not null default 'new' check (status in ('new', 'reviewed', 'removed')),
  created_at  timestamptz not null default now()
);

alter table reports enable row level security;

create policy "anyone can report a page" on reports for insert
  to anon, authenticated
  with check (status = 'new');

grant insert on table public.reports to anon, authenticated;
