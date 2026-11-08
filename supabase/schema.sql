-- ==============================================================================
-- DompetKu - Supabase Database Schema & Realtime Setup
-- ==============================================================================

-- 1. Table: Couples (Pasangan)
create table if not exists public.couples (
  id uuid primary key default gen_random_uuid(),
  couple_code text unique not null,
  partner_a_name text default 'Kamu',
  partner_b_name text default 'Pacar',
  created_at timestamptz default now()
);

-- 2. Table: Wallets (Dompet)
create table if not exists public.wallets (
  id text primary key,
  couple_id text not null,
  owner_id text not null,
  name text not null,
  type text default 'bank', -- 'bank', 'ewallet', 'cash'
  balance numeric default 0,
  visibility text default 'private', -- 'private' (hanya owner) | 'shared' (berdua)
  color text default '#3b82f6',
  icon text default 'wallet',
  updated_at timestamptz default now()
);

-- 3. Table: Transactions (Transaksi)
create table if not exists public.transactions (
  id text primary key,
  couple_id text not null,
  wallet_id text not null,
  created_by text not null,
  type text not null, -- 'expense', 'income', 'transfer'
  amount numeric not null,
  category text default 'Lainnya',
  note text,
  visibility text default 'private', -- 'private' | 'shared'
  date timestamptz default now(),
  created_at timestamptz default now()
);

-- Enable Realtime for live updates on mobile
alter publication supabase_realtime add table public.wallets;
alter publication supabase_realtime add table public.transactions;

-- Indexes for lightning fast queries
create index if not exists idx_wallets_couple on public.wallets(couple_id);
create index if not exists idx_transactions_couple on public.transactions(couple_id);
create index if not exists idx_transactions_date on public.transactions(date desc);
