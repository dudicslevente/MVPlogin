// Supabase client and helpers for Schedule Manager
// Fill in SUPABASE_URL and SUPABASE_ANON_KEY below (see README.md)

// Load supabase-js from CDN in pages before this script:
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

window.SUPABASE_URL = window.SUPABASE_URL || 'https://gtczjaqrnrgbbrtborio.supabase.co';
window.SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0Y3pqYXFybnJnYmJydGJvcmlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MjExMzcsImV4cCI6MjA3NDI5NzEzN30.7pgAFyG7qRan5vq59pELVUQqMmaxiGp1W_GOwV4QtSA';

window.supabaseClient = window.supabaseClient || supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

// Auth helpers (email/password). Username is stored in the profiles table only.
async function signUpWithEmail(email, password, username) {
  const { data, error } = await window.supabaseClient.auth.signUp({ email, password });
  if (error) throw error;
  const user = data.user;
  // Attempt to update profile with the username after a delay
  // This handles timing issues with the database trigger
  if (user && username) {
    // Use a timeout to handle potential timing issues with the trigger
    setTimeout(async () => {
      try {
        // Wait a bit more for the trigger to complete
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Update the profile with the username
        const { error: updateError } = await window.supabaseClient
          .from('profiles')
          .update({ username, display_name: username })
          .eq('id', user.id);
        
        if (updateError) {
          console.error('Profile update error:', updateError);
          
          // If update fails, try insert (fallback for cases where profile doesn't exist)
          const { error: insertError } = await window.supabaseClient
            .from('profiles')
            .insert({ id: user.id, username, display_name: username })
            .select();
          
          if (insertError) {
            console.error('Profile insert error:', insertError);
          }
        }
      } catch (err) {
        console.error('Error updating profile:', err);
      }
    }, 1500); // Delay to allow trigger to complete
  }
  return data;
}

// Function to load profile data after signup
async function loadProfileDataAfterSignup() {
  try {
    const session = await getSession();
    if (!session) return null;
    
    const userId = session.user.id;
    
    // Try to load profile data with retries
    let attempts = 0;
    const maxAttempts = 5;
    let data, error;
    
    do {
      ({ data, error } = await window.supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle());
      
      if (error) {
        console.error(`Error loading profile after signup (attempt ${attempts + 1}):`, error);
        if (attempts < maxAttempts - 1) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } else if (!data) {
        // Profile doesn't exist yet, wait and retry
        if (attempts < maxAttempts - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } else if (data.username && data.username.startsWith('user_')) {
        // Profile has temporary username, wait and retry
        if (attempts < maxAttempts - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } else {
        // Success, break out of loop
        break;
      }
      
      attempts++;
    } while (attempts < maxAttempts);
    
    if (error) {
      console.error('Failed to load profile after signup:', error);
      return null;
    }
    
    // Store profile data in localStorage for immediate availability
    if (data) {
      if (data.username && data.username !== '' && !data.username.startsWith('user_')) {
        localStorage.setItem('scheduleManager_username', data.username);
      }
      if (data.display_name && data.display_name !== '' && !data.display_name.startsWith('user_')) {
        localStorage.setItem('scheduleManager_displayName', data.display_name);
      }
    }
    
    return data || null;
  } catch (err) {
    console.error('Error in loadProfileDataAfterSignup:', err);
    return null;
  }
}

// Function to load profile data into localStorage
async function loadProfileDataIntoLocalStorage() {
  try {
    const session = await getSession();
    if (!session) return;
    
    const userId = session.user.id;
    const { data, error } = await window.supabaseClient
      .from('profiles')
      .select('username, display_name')
      .eq('id', userId)
      .maybeSingle();
      
    if (error) {
      console.error('Error loading profile data:', error);
      return;
    }
    
    // Store profile data in localStorage
    if (data) {
      if (data.username && data.username !== '' && !data.username.startsWith('user_')) {
        localStorage.setItem('scheduleManager_username', data.username);
      }
      if (data.display_name && data.display_name !== '' && !data.display_name.startsWith('user_')) {
        localStorage.setItem('scheduleManager_displayName', data.display_name);
      }
    }
  } catch (err) {
    console.error('Error in loadProfileDataIntoLocalStorage:', err);
  }
}

async function signInWithEmail(email, password) {
  const { data, error } = await window.supabaseClient.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

async function signOut() {
  const { error } = await window.supabaseClient.auth.signOut();
  if (error) throw error;
}

async function getSession() {
  const { data, error } = await window.supabaseClient.auth.getSession();
  if (error) throw error;
  return data.session;
}

// App-state sync: store entire front-end state per user in one row
// Table: app_state(user_id uuid primary key, data jsonb, updated_at timestamptz)
async function loadAppStateAndSync() {
  const session = await getSession();
  if (!session) return;
  const userId = session.user.id;

  // Fetch remote state
  const { data: rows, error } = await window.supabaseClient
    .from('app_state')
    .select('data')
    .eq('user_id', userId)
    .maybeSingle();
  if (error && error.code !== 'PGRST116') throw error; // ignore not found

  if (rows && rows.data) {
    // Load remote into localStorage
    const d = rows.data || {};
    if (d.scheduleManager_employees) localStorage.setItem('scheduleManager_employees', JSON.stringify(d.scheduleManager_employees));
    if (d.scheduleManager_schedules) localStorage.setItem('scheduleManager_schedules', JSON.stringify(d.scheduleManager_schedules));
    if (d.scheduleManager_departments) localStorage.setItem('scheduleManager_departments', JSON.stringify(d.scheduleManager_departments));
    if (d.scheduleManager_currency) localStorage.setItem('scheduleManager_currency', d.scheduleManager_currency);
  } else {
    // No remote yet: push current local into remote (or empty defaults)
    // Set default currency to Ft for new users
    if (!localStorage.getItem('scheduleManager_currency')) {
      localStorage.setItem('scheduleManager_currency', 'Ft');
    }
    await cloudSyncSave();
  }
  
  // Also load profile data and store in localStorage
  await loadProfileDataIntoLocalStorage();
}

async function cloudSyncSave() {
  try {
    const session = await getSession();
    if (!session) return; // not logged in
    const userId = session.user.id;
    const payload = {
      scheduleManager_employees: JSON.parse(localStorage.getItem('scheduleManager_employees') || '[]'),
      scheduleManager_schedules: JSON.parse(localStorage.getItem('scheduleManager_schedules') || '{}'),
      scheduleManager_departments: JSON.parse(localStorage.getItem('scheduleManager_departments') || '[]'),
      scheduleManager_theme: localStorage.getItem('scheduleManager_theme') || 'light',
      scheduleManager_currency: localStorage.getItem('scheduleManager_currency') || 'Ft',
    };
    const { error } = await window.supabaseClient.from('app_state').upsert({ user_id: userId, data: payload }).select();
    if (error) throw error;
  } catch (e) {
    console.error('cloudSyncSave error', e);
  }
}

// Upload avatar helper (Supabase Storage)
async function uploadProfileAvatar(file) {
  const session = await getSession();
  if (!session) throw new Error('Not logged in');
  const userId = session.user.id;
  const ext = (file.name && file.name.includes('.')) ? file.name.split('.').pop() : 'png';
  const path = `${userId}/avatar.${ext}`;
  const { error: uploadError } = await window.supabaseClient.storage
    .from('avatars')
    .upload(path, file, { upsert: true, contentType: file.type || 'image/png', cacheControl: '3600' });
  if (uploadError) throw uploadError;
  const { data: pub } = window.supabaseClient.storage.from('avatars').getPublicUrl(path);
  return pub.publicUrl;
}

// Expose to window for app.js hooks
window.cloudSyncSave = cloudSyncSave;
window.loadAppStateAndSync = loadAppStateAndSync;
window.signUpWithEmail = signUpWithEmail;
window.signInWithEmail = signInWithEmail;
window.signOut = signOut;
window.getSession = getSession;
window.uploadProfileAvatar = uploadProfileAvatar;
window.loadProfileDataAfterSignup = loadProfileDataAfterSignup;
window.loadProfileDataIntoLocalStorage = loadProfileDataIntoLocalStorage;

// Convenience: logout and redirect to login
window.logoutUser = async function() {
  try {
    await signOut();
  } catch (e) {
    console.error(e);
  } finally {
    try { localStorage.clear(); } catch (_) {}
    window.location.href = 'login.html';
  }
}
