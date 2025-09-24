# Schedule Manager – Authenticated MVP

This project adds authentication and a simple backend to the existing drag-and-drop employee scheduling UI using Supabase (a hosted Postgres + Auth + REST backend).

## What’s included
- Username + password Sign up and Login (no real email required)
- Auth guard so only logged-in users can access the app
- Profile page to view username and edit display name + avatar URL
- Per-user data isolation using Supabase Row Level Security (RLS)
- Cloud sync: your employees, schedules, and departments are stored in Supabase per user

## How it works
- We derive a pseudo email from the username for Supabase Auth: `<username>@example.local`.
- After login, the app loads your server-side state (if any) into localStorage and then starts the app.
- App state changes automatically sync to Supabase.

## Files added/changed
- supabase.js – Client and helpers (auth, sync)
- supabase_setup.sql – SQL to create tables and policies
- login.html, signup.html – Auth pages
- profile.html – Profile management (display name, avatar, logout)
- index.html – Now gated by auth; includes navbar Profile/Logout
- app.js – Minimal changes to allow cloud sync hooks and deferred init

## Prerequisites
- A Supabase project: https://supabase.com

## Setup
1. Create a new Supabase project.
2. Open SQL Editor in Supabase and run the contents of `supabase_setup.sql` to create tables and RLS policies.
3. In the Supabase Dashboard, go to Project Settings → API and copy:
   - Project URL
   - anon public API key
4. Open `supabase.js` and set:
   ```js
   window.SUPABASE_URL = 'https://<your-project-ref>.supabase.co';
   window.SUPABASE_ANON_KEY = '<your-anon-key>';
   ```

## Development
- Open `login.html` to sign up or log in (using a username and password).
- Once logged in, you’ll be redirected to `index.html` (the main app).
- Use the Profile link in the navbar to edit your profile or log out.

## Notes
- Username is stored in the `profiles` table and currently displayed read-only (changing it would not update the underlying Supabase auth email).
- App data is stored in the `app_state` table as JSON (employees, schedules, departments). This keeps the integration minimal while preserving the existing front-end functionality. It can be evolved into normalized tables later.
- If you need to “reset” your cloud state, you can delete your row in `app_state` (via Supabase) and the app will re-sync from your local defaults on next login.

## Security
- Row Level Security (RLS) ensures each user can only access their own `profiles` and `app_state` rows.
- Be sure to use the `anon` key on the client and never expose the `service_role` key.

## Troubleshooting
- If you get redirected to `login.html` constantly, verify your Supabase URL and anon key in `supabase.js`.
- Check the browser console for errors (network/auth).
- Ensure `supabase_setup.sql` was executed and policies exist.
