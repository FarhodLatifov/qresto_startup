-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. RESTAURANTS
create table restaurants (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references auth.users not null,
  name text not null,
  slug text unique not null,
  logo_url text,
  primary_color text default '#D4AF37',
  telegram_chat_id text,
  created_at timestamptz default now()
);

alter table restaurants enable row level security;

create policy "Restaurants are viewable by everyone."
  on restaurants for select
  using (true);

create policy "Users can insert their own restaurants."
  on restaurants for insert
  with check (auth.uid() = owner_id OR owner_id IS NULL);

create policy "Users can update their own restaurants."
  on restaurants for update
  using (auth.uid() = owner_id OR owner_id IS NULL);

create policy "Users can delete their own restaurants."
  on restaurants for delete
  using (auth.uid() = owner_id);

-- 2. CATEGORIES
create table categories (
  id uuid primary key default uuid_generate_v4(),
  restaurant_id uuid references restaurants(id) on delete cascade not null,
  name text not null,
  sort_order int default 0,
  is_visible boolean default true,
  created_at timestamptz default now()
);

alter table categories enable row level security;

create policy "Categories are viewable by everyone."
  on categories for select
  using (true);

create policy "Owners can manage categories."
  on categories for all
  using (
    auth.uid() in (
      select owner_id from restaurants where id = restaurant_id
    )
  );

-- 3. DISHES
create table dishes (
  id uuid primary key default uuid_generate_v4(),
  restaurant_id uuid references restaurants(id) on delete cascade not null,
  category_id uuid references categories(id) on delete set null,
  name text not null,
  description text,
  price decimal not null,
  image_url text,
  is_available boolean default true,
  is_popular boolean default false,
  created_at timestamptz default now()
);

alter table dishes enable row level security;

create policy "Dishes are viewable by everyone."
  on dishes for select
  using (true);

create policy "Owners can manage dishes."
  on dishes for all
  using (
    auth.uid() in (
      select owner_id from restaurants where id = restaurant_id
    )
  );

-- 4. TABLES
create table tables (
  id uuid primary key default uuid_generate_v4(),
  restaurant_id uuid references restaurants(id) on delete cascade not null,
  table_number text not null,
  qr_code_url text,
  created_at timestamptz default now(),
  unique(restaurant_id, table_number)
);

alter table tables enable row level security;

create policy "Tables are viewable by everyone."
  on tables for select
  using (true);

create policy "Owners can manage tables."
  on tables for all
  using (
    auth.uid() in (
      select owner_id from restaurants where id = restaurant_id
    )
  );

-- 5. ORDERS
create table orders (
  id uuid primary key default uuid_generate_v4(),
  restaurant_id uuid references restaurants(id) on delete cascade not null,
  table_id uuid references tables(id) on delete set null,
  status text not null default 'new',
  total_amount decimal not null default 0,
  comment text,
  created_at timestamptz default now()
);

alter table orders enable row level security;

create policy "Orders are viewable by everyone."
  on orders for select
  using (true);

create policy "Owners can manage orders."
  on orders for all
  using (
    auth.uid() in (
      select owner_id from restaurants where id = restaurant_id
    )
  );

-- 6. ORDER ITEMS
create table order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id) on delete cascade not null,
  dish_id uuid references dishes(id) on delete cascade not null,
  quantity int not null default 1,
  price_at_time decimal not null,
  created_at timestamptz default now()
);

alter table order_items enable row level security;

create policy "Order items are viewable by everyone."
  on order_items for select
  using (true);

create policy "Owners can manage order items."
  on order_items for all
  using (
    auth.uid() in (
      select owner_id from restaurants r
      join orders o on r.id = o.restaurant_id
      where o.id = order_items.order_id
    )
  );

-- 7. RESERVATIONS
create table reservations (
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

create policy "Reservations are viewable by everyone."
  on reservations for select
  using (true);

create policy "Owners can manage reservations."
  on reservations for all
  using (
    auth.uid() in (
      select owner_id from restaurants where id = restaurant_id
    )
  );
