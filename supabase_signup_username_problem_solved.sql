-- First, modify the table to allow NULL values for username temporarily
-- This should be run in the Supabase SQL editor
-- ALTER TABLE public.profiles ALTER COLUMN username DROP NOT NULL;

-- Function to automatically create a profile for new users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Create a profile with NULL values that can be updated later
  -- This avoids conflicts with the application's profile update logic
  insert into public.profiles (id, username, display_name)
  values (new.id, NULL, NULL); -- NULL values that can be updated later
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();