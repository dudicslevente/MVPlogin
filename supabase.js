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
  
  // Store the username in localStorage immediately for immediate availability
  if (username) {
    localStorage.setItem('scheduleManager_username', username);
    localStorage.setItem('scheduleManager_displayName', username);
    // Debug: Log the stored values
    console.log('Stored username in localStorage:', username);
  }
  
  // Attempt to update profile with the username
  if (user && username) {
    // Use a more aggressive approach to ensure profile is updated
    // Try multiple times with different strategies
    const updateProfile = async (attempt) => {
      if (attempt > 10) { // Increased attempts
        console.error('Failed to update profile after 10 attempts');
        throw new Error('Database error saving new user');
      }
      
      try {
        // Wait a bit for auth to fully complete and trigger to run
        await new Promise(resolve => setTimeout(resolve, 1500 * attempt)); // Increased delay
        
        console.log(`Attempt ${attempt} to update profile for user:`, user.id);
        
        // First, check if profile exists
        const { data: profileCheck, error: profileCheckError } = await window.supabaseClient
          .from('profiles')
          .select('id, username')
          .eq('id', user.id)
          .maybeSingle();
          
        if (profileCheckError) {
          console.error('Error checking profile existence:', profileCheckError);
          throw profileCheckError;
        }
        
        let resultData, resultError;
        
        if (profileCheck) {
          // Profile exists, update it
          console.log('Profile exists, updating...');
          const { data: updateData, error: updateError } = await window.supabaseClient
            .from('profiles')
            .update({ username, display_name: username })
            .eq('id', user.id)
            .select();
            
          resultData = updateData;
          resultError = updateError;
        } else {
          // Profile doesn't exist, create it
          console.log('Profile does not exist, creating...');
          const { data: insertData, error: insertError } = await window.supabaseClient
            .from('profiles')
            .insert({ id: user.id, username, display_name: username })
            .select();
            
          resultData = insertData;
          resultError = insertError;
        }
        
        // Check if operation was successful
        if (!resultError && resultData && resultData.length > 0) {
          console.log('Profile operation successful:', resultData[0]);
          return resultData[0];
        } else {
          console.error('Profile operation failed:', resultError);
          throw resultError || new Error('Profile operation failed');
        }
      } catch (err) {
        console.error(`Error updating profile (attempt ${attempt}):`, err);
        
        // If it's the last attempt, rethrow the error
        if (attempt >= 10) {
          throw new Error('Database error saving new user: ' + (err.message || err));
        }
        
        // Try again
        await new Promise(resolve => setTimeout(() => updateProfile(attempt + 1), 2500));
      }
    };
    
    // Start the update process and wait for it to complete
    await updateProfile(1);
  }
  return data;
}

// Function to load profile data after signup or login
async function loadProfileDataAfterSignup() {
  try {
    const session = await getSession();
    if (!session) return null;
    
    const userId = session.user.id;
    
    // Try to load profile data with retries
    let attempts = 0;
    const maxAttempts = 15; // Increase attempts for login scenarios
    let data, error;
    
    do {
      ({ data, error } = await window.supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle());
      
      if (error) {
        console.error(`Error loading profile (attempt ${attempts + 1}):`, error);
        if (attempts < maxAttempts - 1) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } else if (!data) {
        // Profile doesn't exist yet, wait and retry
        if (attempts < maxAttempts - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } else if (data.username && (data.username.startsWith('user_') || data.username.startsWith('temp_'))) {
        // Profile has temporary username, wait and retry
        // This might happen if the async update from signup hasn't completed yet
        if (attempts < maxAttempts - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } else if ((!data.username || data.username === '') && (!data.display_name || data.display_name === '')) {
        // Profile exists but is empty, wait and retry
        if (attempts < maxAttempts - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } else {
        // Success, break out of loop
        break;
      }
      
      attempts++;
    } while (attempts < maxAttempts);
    
    if (error) {
      console.error('Failed to load profile:', error);
      return null;
    }
    
    // Store profile data in localStorage for immediate availability
    // But preserve user-provided values over temporary database values
    if (data) {
      const existingUsername = localStorage.getItem('scheduleManager_username');
      const existingDisplayName = localStorage.getItem('scheduleManager_displayName');
      
      if (data.username && data.username !== '' && !data.username.startsWith('user_') && !data.username.startsWith('temp_')) {
        localStorage.setItem('scheduleManager_username', data.username);
      } else if (existingUsername && existingUsername !== '' && !existingUsername.startsWith('user_') && !existingUsername.startsWith('temp_')) {
        // Keep existing username if database has a temporary one
        localStorage.setItem('scheduleManager_username', existingUsername);
      }
      
      if (data.display_name && data.display_name !== '' && data.display_name !== 'User') {
        localStorage.setItem('scheduleManager_displayName', data.display_name);
      } else if (existingDisplayName && existingDisplayName !== '' && existingDisplayName !== 'User') {
        // Keep existing display name if database has a temporary one
        localStorage.setItem('scheduleManager_displayName', existingDisplayName);
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
      // Check if we have valid data, otherwise keep existing localStorage values
      const existingUsername = localStorage.getItem('scheduleManager_username');
      const existingDisplayName = localStorage.getItem('scheduleManager_displayName');
      
      if (data.username && data.username !== '' && !data.username.startsWith('user_') && !data.username.startsWith('temp_')) {
        localStorage.setItem('scheduleManager_username', data.username);
      } else if (existingUsername && existingUsername !== '' && !existingUsername.startsWith('user_') && !existingUsername.startsWith('temp_')) {
        // Keep the existing username if database has a temporary one
        // This preserves the user's original input
        localStorage.setItem('scheduleManager_username', existingUsername);
      }
      
      if (data.display_name && data.display_name !== '' && data.display_name !== 'User') {
        localStorage.setItem('scheduleManager_displayName', data.display_name);
      } else if (existingDisplayName && existingDisplayName !== '' && existingDisplayName !== 'User') {
        // Keep the existing display name if database has a temporary one
        localStorage.setItem('scheduleManager_displayName', existingDisplayName);
      }
    }
  } catch (err) {
    console.error('Error in loadProfileDataIntoLocalStorage:', err);
  }
}

async function signInWithEmail(email, password) {
  const { data, error } = await window.supabaseClient.auth.signInWithPassword({ email, password });
  if (error) throw error;
  // Load profile data after login to ensure it's available
  setTimeout(async () => {
    await loadProfileDataIntoLocalStorage();
  }, 1000);
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
