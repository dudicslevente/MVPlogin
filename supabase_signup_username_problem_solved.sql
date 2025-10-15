-- Function to automatically create a profile for new users
-- This works with the existing schema that requires NOT NULL username
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Create a profile with a unique temporary username based on the user's ID
  -- This avoids the uniqueness constraint violation while working with NOT NULL constraint
  begin
    insert into public.profiles (id, username, display_name, welcome_notification_shown)
    values (new.id, 'user_' || new.id, 'User', false); -- Temporary unique values
  exception when unique_violation then
    -- If profile already exists, do nothing
    null;
  end;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();