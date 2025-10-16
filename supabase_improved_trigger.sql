-- Improved function to automatically create a profile for new users
-- This version avoids temporary usernames by allowing NULL initially and updating later
-- But maintains the NOT NULL constraint by using a better approach

-- First, we need to modify the profiles table to allow temporary NULL values during creation
-- This would require a schema change which might not be ideal for existing deployments

-- Alternative approach: Keep the existing schema but improve the trigger logic
-- Function to automatically create a profile for new users with better handling
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Create a profile with a placeholder that indicates it needs to be updated
  -- Using a special prefix that our application can recognize and update
  begin
    insert into public.profiles (id, username, display_name, welcome_notification_shown)
    values (new.id, 'pending_' || substring(new.id::text, 1, 8), 'New User', false);
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

-- We also add a function that can be called from the application to properly set the username
-- This gives us better control over when the username is set
create or replace function public.update_user_profile(user_id uuid, user_username text, user_display_name text)
returns json as $$
declare
  result json;
begin
  -- Update the profile with the real username
  update public.profiles 
  set 
    username = user_username,
    display_name = user_display_name,
    updated_at = now()
  where id = user_id;
  
  -- Check if update was successful
  if found then
    result := json_build_object('success', true, 'message', 'Profile updated successfully');
  else
    -- If update failed, try insert
    begin
      insert into public.profiles (id, username, display_name, welcome_notification_shown)
      values (user_id, user_username, user_display_name, false);
      result := json_build_object('success', true, 'message', 'Profile created successfully');
    exception when unique_violation then
      -- If insert fails due to unique violation, try update again
      update public.profiles 
      set 
        username = user_username,
        display_name = user_display_name,
        updated_at = now()
      where id = user_id;
      result := json_build_object('success', true, 'message', 'Profile updated after insert conflict');
    end;
  end if;
  
  return result;
exception when others then
  return json_build_object('success', false, 'error', sqlerrm);
end;
$$ language plpgsql security definer;