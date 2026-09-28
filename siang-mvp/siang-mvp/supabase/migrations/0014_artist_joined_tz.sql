-- The time zone the artist was in when they created their card (their
-- browser's IANA zone, e.g. "Asia/Bangkok"). The card shows joined_at in this
-- zone, so everyone sees the local time at the place it was made. Artists
-- created before this (and the seeded examples) have none and are shown in
-- Thai time.

alter table artists add column joined_tz text check (char_length(joined_tz) <= 64);
