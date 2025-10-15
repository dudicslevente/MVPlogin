-- Supabase schema for Schedule Manager app
-- Run this in your Supabase project SQL editor

-- Enable uuid-ossp if needed (on Postgres 15 it's available by default)
-- create extension if not exists "uuid-ossp";

-- Profiles table linked to auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text,
  avatar_url text,
  welcome_notification_shown boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- App state per user (all front-end data in one jsonb)
create table if not exists public.app_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

-- Update triggers to keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end; $$ language plpgsql;

create or replace trigger profiles_set_updated
before update on public.profiles
for each row execute function public.set_updated_at();

create or replace trigger app_state_set_updated
before update on public.app_state
for each row execute function public.set_updated_at();

-- RLS
alter table public.profiles enable row level security;
alter table public.app_state enable row level security;

-- Policies for profiles
create policy if not exists "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy if not exists "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy if not exists "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Policies for app_state
create policy if not exists "Users can view their own app_state"
  on public.app_state for select
  using (auth.uid() = user_id);

create policy if not exists "Users can upsert their own app_state"
  on public.app_state for insert
  with check (auth.uid() = user_id);

create policy if not exists "Users can update their own app_state"
  on public.app_state for update
  using (auth.uid() = user_id);

-- Storage: public avatars bucket (upload profile pictures)
insert into storage.buckets (id, name, public)
values ('avatars','avatars', true)
on conflict (id) do nothing;

-- Enable RLS on storage.objects if not already (usually enabled by default)
-- create policy statements below are idempotent using "if not exists"

-- Public can read avatar images
create policy if not exists "Public read access to avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- Authenticated users can upload/update/delete their own files (owner set automatically)
create policy if not exists "Users can upload their own avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid() = owner);

create policy if not exists "Users can update their own avatar"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid() = owner)
  with check (bucket_id = 'avatars' and auth.uid() = owner);

create policy if not exists "Users can delete their own avatar"
  on storage.objects for delete
  using (bucket_id = 'avatars' and auth.uid() = owner);