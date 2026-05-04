begin;
create extension if not exists "pgcrypto";
drop table if exists public.products cascade;

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  price numeric(12,3) not null,
  discount_enabled boolean not null default false,
  discount_permanent boolean not null default false,
  discount_price numeric(12,3),
  discount_end_date date,
  description text,
  image_url text not null,
  instagram_enabled boolean not null default false,
  instagram_video_url text,
  created_at timestamptz not null default now()
);

create index if not exists products_created_at_idx on public.products (created_at desc);

alter table public.products
  add constraint discount_fields_check
  check (
    (discount_enabled = false and discount_price is null and discount_end_date is null and discount_permanent = false)
    or
    (
      discount_enabled = true
      and discount_price is not null
      and (
        (discount_permanent = true and discount_end_date is null)
        or
        (discount_permanent = false and discount_end_date is not null)
      )
    )
  );

alter table public.products
  add constraint instagram_fields_check
  check (
    (instagram_enabled = false and instagram_video_url is null)
    or
    (instagram_enabled = true and instagram_video_url is not null)
  );

alter table public.products enable row level security;

create policy "Authenticated read products" on public.products
for select to authenticated using (true);
create policy "Authenticated insert products" on public.products
for insert to authenticated with check (true);
create policy "Authenticated update products" on public.products
for update to authenticated using (true) with check (true);
create policy "Authenticated delete products" on public.products
for delete to authenticated using (true);

commit;
