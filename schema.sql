-- ═══════════════════════════════════════════════════════════════════
-- SF — Sistema de Sobrevivência Financeira
-- Supabase Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════════

-- 1. Users profile table (extends Supabase auth.users)
create table if not exists public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null default 'Utilizador',
  income      bigint not null default 0,  -- stored in AOA (kwanzas), no decimals
  created_at  timestamptz not null default now()
);

-- 2. Expenses table
create table if not exists public.expenses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  amount      bigint not null check (amount > 0),  -- in AOA
  category    text not null check (category in ('comida','transporte','casa','dados','outros')),
  note        text,
  date        date not null default current_date,
  created_at  timestamptz not null default now()
);

create index if not exists expenses_user_date on public.expenses(user_id, date desc);

-- 3. Savings table (one row per user)
create table if not exists public.savings (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null unique references public.users(id) on delete cascade,
  current_amount  bigint not null default 0 check (current_amount >= 0),
  goal_amount     bigint not null default 150000 check (goal_amount > 0),
  updated_at      timestamptz not null default now()
);

-- 4. Push subscriptions (for daily notifications)
create table if not exists public.push_subscriptions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  subscription jsonb not null,
  created_at  timestamptz not null default now(),
  unique(user_id)
);

-- ═══════════════════════════════════════════════════════════════════
-- Row Level Security (RLS) — users only see their own data
-- ═══════════════════════════════════════════════════════════════════

alter table public.users            enable row level security;
alter table public.expenses         enable row level security;
alter table public.savings          enable row level security;
alter table public.push_subscriptions enable row level security;

-- Users: can only read/write their own row
create policy "users_own_row" on public.users
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- Expenses: full CRUD on own expenses
create policy "expenses_own" on public.expenses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Savings: full CRUD on own savings
create policy "savings_own" on public.savings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Push subscriptions: own only
create policy "push_own" on public.push_subscriptions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════
-- Auto-create user profile on signup
-- ═══════════════════════════════════════════════════════════════════

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', 'Utilizador'));
  
  insert into public.savings (user_id)
  values (new.id);
  
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ═══════════════════════════════════════════════════════════════════
-- Useful views for analytics (optional)
-- ═══════════════════════════════════════════════════════════════════

create or replace view public.monthly_summary as
select
  user_id,
  date_trunc('month', date) as month,
  category,
  sum(amount) as total,
  count(*) as transaction_count
from public.expenses
group by user_id, date_trunc('month', date), category;
