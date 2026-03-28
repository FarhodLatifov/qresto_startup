-- 7. RESERVATIONS (if not exists)
create table if not exists reservations (
  id uuid primary key default uuid_generate_v4(),
  restaurant_id uuid references restaurants(id) on delete cascade not null,
  guest_name text not null,
  guest_phone text not null,
  date date not null,
  time time not null,
  party_size int not null,
  comment text,
  status text not null default 'pending',
  created_at timestamptz default now()
);

alter table reservations enable row level security;

drop policy if exists "Reservations are viewable by everyone." on reservations;
create policy "Reservations are viewable by everyone."
  on reservations for select
  using (true);

drop policy if exists "Owners can manage reservations." on reservations;
create policy "Owners can manage reservations."
  on reservations for all
  using (
    auth.uid() in (
      select owner_id from restaurants where id = restaurant_id
    )
  );
