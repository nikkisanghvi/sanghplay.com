-- ShePlays bootstrap schema — run manually in Supabase SQL editor once before relying on SSR auth.
create extension if not exists "uuid-ossp";

create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  role text not null check (role in ('student', 'coach')),
  display_name text,
  onboarding_complete boolean default false,
  avatar_url text,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Self read profiles" on profiles for select using (auth.uid() = id);
create policy "Self insert profile" on profiles for insert with check (auth.uid() = id);
create policy "Self update profile" on profiles for update using (auth.uid() = id);

create or replace function handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, display_name, onboarding_complete)
  values (
    new.id,
    case
      when lower(coalesce(new.raw_user_meta_data->>'role', 'student')) = 'coach' then 'coach'
      else 'student'
    end,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(coalesce(new.email, 'sheplays@app'), '@', 1)),
    coalesce((new.raw_user_meta_data->>'onboarding_complete')::boolean, false)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user_profile();
