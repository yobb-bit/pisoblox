-- ============================================
-- RobloxPH Market — Supabase Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- Listings table
create table if not exists public.listings (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc', now()) not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text not null,
  price numeric(10, 2) not null check (price > 0),
  category text not null check (category in ('item', 'account', 'robux')),
  image_url text,
  facebook_link text not null,
  seller_username text not null,
  is_sold boolean default false not null
);

-- Enable Row Level Security
alter table public.listings enable row level security;

create policy "Public can view listings"
  on public.listings for select using (true);

create policy "Authenticated users can create listings"
  on public.listings for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Owners can update their listings"
  on public.listings for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Owners can delete their listings"
  on public.listings for delete
  to authenticated
  using (auth.uid() = user_id);

-- ============================================
-- Profiles table (listing limits + admin flag)
-- ============================================

create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text not null,
  listing_limit integer default 10 not null,
  is_admin boolean default false not null,
  created_at timestamp with time zone default timezone('utc', now()) not null
);

alter table public.profiles enable row level security;

-- Anyone can read profiles (needed for public seller pages)
create policy "Public can view profiles"
  on public.profiles for select using (true);

-- Users can only update their own profile
create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- Only the system (service role) inserts profiles via trigger
create policy "Users can insert own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

-- Admin can update any profile (for granting listing slots)
create policy "Admins can update any profile"
  on public.profiles for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

-- ============================================
-- Auto-create profile on user signup (trigger)
-- ============================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- Storage bucket for listing images
-- ============================================

insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict (id) do nothing;

create policy "Anyone can view listing images"
  on storage.objects for select
  using (bucket_id = 'listing-images');

create policy "Authenticated users can upload listing images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'listing-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Owners can delete their listing images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'listing-images' and (storage.foldername(name))[1] = auth.uid()::text);

