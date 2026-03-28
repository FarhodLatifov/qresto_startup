create table license_keys (
  id uuid primary key default uuid_generate_v4(),
  key_string text unique not null,
  created_by uuid references auth.users(id),
  status text not null default 'active', 
  duration_days int not null default 14,
  activated_at timestamptz,
  expires_at timestamptz,
  restaurant_id uuid references restaurants(id) on delete cascade,
  created_at timestamptz default now()
);

alter table license_keys enable row level security;

-- Viewable by everyone (needed before login to verify key exists)
create policy "Keys are viewable by everyone" on license_keys for select using (true);

-- Insertable by authenticated users (SaaS Owner generating a key)
create policy "Authenticated users can insert keys" on license_keys for insert with check (auth.role() = 'authenticated');

-- Updateable by authenticated users (to set activated_at and restaurant_id after signup)
create policy "Authenticated users can update keys" on license_keys for update using (auth.role() = 'authenticated');
