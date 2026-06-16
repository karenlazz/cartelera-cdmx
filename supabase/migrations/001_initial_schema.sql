create extension if not exists pgcrypto;

create table if not exists public.museums (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  address text,
  borough text,
  website_url text,
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text not null,
  source_type text not null check (source_type in ('official_site', 'rss', 'cultural_listing', 'media_blog', 'institutional', 'manual')),
  priority integer not null default 50,
  update_frequency text not null default '12h',
  active boolean not null default true,
  config jsonb not null default '{}'::jsonb,
  last_checked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (name, url)
);

create table if not exists public.exhibitions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  museum_id uuid references public.museums(id) on delete set null,
  description text,
  start_date date,
  end_date date,
  schedule text,
  price text,
  image_url text,
  source_url text,
  source_name text,
  status text not null default 'upcoming' check (status in ('upcoming', 'current', 'closing_soon', 'closed', 'new')),
  moderation_status text not null default 'detected' check (moderation_status in ('detected', 'approved', 'hidden', 'deleted')),
  tags text[] not null default '{}',
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_checked_at timestamptz
);

create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  preferences jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.update_logs (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references public.sources(id) on delete set null,
  status text not null check (status in ('success', 'partial', 'error', 'skipped')),
  message text,
  exhibitions_found integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists exhibitions_museum_id_idx on public.exhibitions(museum_id);
create index if not exists exhibitions_dates_idx on public.exhibitions(start_date, end_date);
create index if not exists exhibitions_moderation_idx on public.exhibitions(moderation_status);
create index if not exists sources_active_priority_idx on public.sources(active, priority);
create index if not exists update_logs_source_created_idx on public.update_logs(source_id, created_at desc);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.calculate_exhibition_status(created_at_value timestamptz, start_date_value date, end_date_value date)
returns text
language sql
stable
as $$
  select case
    when end_date_value is not null and end_date_value < current_date then 'closed'
    when created_at_value >= now() - interval '14 days' then 'new'
    when end_date_value is not null and end_date_value between current_date and current_date + interval '14 days' then 'closing_soon'
    when start_date_value is not null and start_date_value > current_date then 'upcoming'
    else 'current'
  end;
$$;

create or replace function public.set_exhibition_status()
returns trigger
language plpgsql
as $$
begin
  new.status = public.calculate_exhibition_status(new.created_at, new.start_date, new.end_date);
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists museums_touch_updated_at on public.museums;
create trigger museums_touch_updated_at
before update on public.museums
for each row execute function public.touch_updated_at();

drop trigger if exists sources_touch_updated_at on public.sources;
create trigger sources_touch_updated_at
before update on public.sources
for each row execute function public.touch_updated_at();

drop trigger if exists exhibitions_set_status on public.exhibitions;
create trigger exhibitions_set_status
before insert or update on public.exhibitions
for each row execute function public.set_exhibition_status();

drop trigger if exists subscribers_touch_updated_at on public.subscribers;
create trigger subscribers_touch_updated_at
before update on public.subscribers
for each row execute function public.touch_updated_at();

alter table public.museums enable row level security;
alter table public.sources enable row level security;
alter table public.exhibitions enable row level security;
alter table public.subscribers enable row level security;
alter table public.update_logs enable row level security;

create policy "Public can read museums" on public.museums for select using (true);
create policy "Public can read approved exhibitions" on public.exhibitions
  for select using (moderation_status = 'approved');
create policy "Public can read active sources" on public.sources
  for select using (active = true);
