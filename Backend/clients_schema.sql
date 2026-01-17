-- 1. Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- 2. CLIENTS TABLE
-- This table stores all brand/company information.
create table public.clients (
  id uuid primary key default uuid_generate_v4(),
  moderator_id uuid references public."Users"(id) on delete cascade not null, -- Links to your existing Users table (Sequelize creates "Users")
  client_name text not null,
  industry text, -- Used by AI Agent
  brand_description text, -- Context for AI
  
  -- Platform Flags (controls UI visibility)
  instagram_enabled boolean default false,
  facebook_enabled boolean default false,
  twitter_enabled boolean default false,
  linkedin_enabled boolean default false,
  whatsapp_enabled boolean default false,
  pinterest_enabled boolean default false,
  tiktok_enabled boolean default false, -- Added per frontend requirements

  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. PLATFORM CONNECTIONS TABLE
-- Stores OAuth tokens securely, separate from client details.
create table public.platform_connections (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references public.clients(id) on delete cascade not null,
  platform text not null check (platform in ('instagram', 'facebook', 'twitter', 'linkedin', 'whatsapp', 'pinterest', 'tiktok')),
  
  access_token text, -- Consider encrypting this at the application level before storing
  refresh_token text,
  expires_at timestamp with time zone,
  is_connected boolean default false,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Ensure one connection type per client
  unique(client_id, platform)
);

-- 4. RLS POLICIES (Optional but recommended for Supabase)
alter table public.clients enable row level security;
alter table public.platform_connections enable row level security;

-- Example: Allow full access to the moderator who owns the client
-- (Assuming you user auth.uid() if strictly using Supabase Auth, 
--  but since you are using a custom Node backend, these might just be broad policies 
--  or managed via your Service Role key).
create policy "Moderators can manage their own clients"
  on public.clients
  for all
  using (true); -- Replace 'true' with proper auth check if using Supabase Auth directly

create policy "Moderators can manage their connections"
  on public.platform_connections
  for all
  using (true);
