// Supabase client and helpers for Schedule Manager
// Fill in SUPABASE_URL and SUPABASE_ANON_KEY below (see README.md)

// Load supabase-js from CDN in pages before this script:
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

window.SUPABASE_URL = window.SUPABASE_URL || 'https://gtczjaqrnrgbbrtborio.supabase.co';
window.SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0Y3pqYXFybnJnYmJydGJvcmlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MjExMzcsImV4cCI6MjA3NDI5NzEzN30.7pgAFyG7qRan5vq59pELVUQqMmaxiGp1W_GOwV4QtSA';

window.supabaseClient = window.supabaseClient || supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

// Auth helpers (email/password). Username is stored in the profiles table only.
async function signUpWithEmail(email, password, username) {
  // Clear all existing schedule manager data to ensure fresh start for new user
  const localStorageKeys = [
    'scheduleManager_employees',
    'scheduleManager_schedules',
    'scheduleManager_departments',
    'scheduleManager_holidays',
    'scheduleManager_mandatory_vacations',
    'scheduleManager_currency',
    'scheduleManager_theme',
    'scheduleManager_username',
    'scheduleManager_displayName'
  ];
  
  localStorageKeys.forEach(key => localStorage.removeItem(key));
  
  // Set default empty values for new user
  localStorage.setItem('scheduleManager_employees', JSON.stringify([]));
  localStorage.setItem('scheduleManager_schedules', JSON.stringify({}));
  localStorage.setItem('scheduleManager_departments', JSON.stringify([]));
  localStorage.setItem('scheduleManager_holidays', JSON.stringify({}));
  localStorage.setItem('scheduleManager_mandatory_vacations', JSON.stringify({}));
  localStorage.setItem('scheduleManager_currency', 'Ft');
  
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
  
  // Attempt to update profile with the username using the new robust approach
  if (user && username) {
    try {
      // Use the new database function for more reliable profile updating
      console.log(`Updating profile for user ${user.id} with username ${username}`);
      
      // Wait a bit for auth to fully complete
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Try to use our custom database function first
      try {
        const { data: rpcData, error: rpcError } = await window.supabaseClient
          .rpc('update_user_profile', {
            user_id: user.id,
            user_username: username,
            user_display_name: username
          });
        
        if (!rpcError && rpcData && rpcData.success) {
          console.log('Profile updated successfully using RPC:', rpcData.message);
        } else {
          throw new Error(`RPC failed: ${rpcError?.message || 'Unknown error'}`);
        }
      } catch (rpcError) {
        console.log('RPC approach failed, falling back to direct update:', rpcError.message);
        // Fallback to direct update approach
        await updateProfileDirectly(user.id, username);
      }
    } catch (profileError) {
      console.error('Critical error updating user profile:', profileError);
      // Even if profile update fails, we still want to complete signup
      // The user's username will be stored in localStorage and synced later
      // Add a special flag to indicate profile needs sync
      localStorage.setItem('scheduleManager_profile_needs_sync', 'true');
    }
  }
  return data;
}

// New function for direct profile updating with better error handling
async function updateProfileDirectly(userId, username) {
  const maxAttempts = 5;
  let attempt = 1;
  let success = false;
  
  while (attempt <= maxAttempts && !success) {
    try {
      console.log(`Direct update attempt ${attempt} for user ${userId}`);
      
      // Wait a bit between attempts
      if (attempt > 1) {
        await new Promise(resolve => setTimeout(resolve, 300 * attempt));
      }
      
      // Try to update the existing profile
      let { data: updateData, error: updateError } = await window.supabaseClient
        .from('profiles')
        .update({ 
          username: username, 
          display_name: username, 
          welcome_notification_shown: false 
        })
        .eq('id', userId)
        .select();
      
      // Check if update was successful
      if (!updateError && updateData && updateData.length > 0) {
        console.log('Profile updated successfully for user:', userId);
        success = true;
      } else {
        // If update failed, try insert
        console.log('Update failed, trying insert for user:', userId, updateError);
        const { data: insertData, error: insertError } = await window.supabaseClient
          .from('profiles')
          .insert({ 
            id: userId, 
            username: username, 
            display_name: username, 
            welcome_notification_shown: false 
          })
          .select();
        
        if (!insertError && insertData && insertData.length > 0) {
          console.log('Profile created successfully for user:', userId);
          success = true;
        } else {
          throw new Error(`Failed to update or create profile: ${insertError?.message || 'Unknown error'}`);
        }
      }
    } catch (err) {
      console.error(`Error in direct update (attempt ${attempt}):`, err);
      if (attempt === maxAttempts) {
        // Last attempt failed, throw the error
        throw new Error(`Failed to update profile after ${maxAttempts} attempts: ${err.message}`);
      }
      attempt++;
    }
  }
}

// Function to load profile data after signup or login
async function loadProfileDataAfterSignup() {
  try {
    const session = await getSession();
    if (!session) return null;
    
    const userId = session.user.id;
    
    // Check if profile needs sync from localStorage
    const needsSync = localStorage.getItem('scheduleManager_profile_needs_sync') === 'true';
    const storedUsername = localStorage.getItem('scheduleManager_username');
    
    if (needsSync && storedUsername) {
      try {
        // Try to update the profile with the stored username
        const { data: updateData, error: updateError } = await window.supabaseClient
          .from('profiles')
          .update({ 
            username: storedUsername, 
            display_name: storedUsername 
          })
          .eq('id', userId)
          .select();
        
        if (!updateError && updateData && updateData.length > 0) {
          console.log('Successfully synced profile for user:', userId);
          localStorage.removeItem('scheduleManager_profile_needs_sync');
        }
      } catch (syncError) {
        console.error('Error syncing profile:', syncError);
      }
    }
    
    // Try to load profile data with retries
    let attempts = 0;
    const maxAttempts = 10;
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
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } else if (!data) {
        // Profile doesn't exist yet, wait and retry
        if (attempts < maxAttempts - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } else if (data.username && (data.username.startsWith('user_') || data.username.startsWith('temp_'))) {
        // Profile has temporary username, wait and retry
        // This might happen if the async update from signup hasn't completed yet
        if (attempts < maxAttempts - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } else if ((!data.username || data.username === '') && (!data.display_name || data.display_name === '')) {
        // Profile exists but is empty, wait and retry
        if (attempts < maxAttempts - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
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
    
    // Try to load profile data with retries
    let attempts = 0;
    const maxAttempts = 5;
    let data, error;
    
    do {
      ({ data, error } = await window.supabaseClient
        .from('profiles')
        .select('username, display_name')
        .eq('id', userId)
        .maybeSingle());
      
      if (error) {
        console.error(`Error loading profile data (attempt ${attempts + 1}):`, error);
        if (attempts < maxAttempts - 1) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      } else if (!data) {
        // Profile doesn't exist yet, wait and retry
        if (attempts < maxAttempts - 1) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      } else if (data.username && (data.username.startsWith('user_') || data.username.startsWith('temp_'))) {
        // Profile has temporary username, wait and retry
        if (attempts < maxAttempts - 1) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      } else {
        // Success, break out of loop
        break;
      }
      
      attempts++;
    } while (attempts < maxAttempts);
    
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
  // Load app state and profile data after login to ensure it's available
  await loadAppStateAndSync();
  await loadProfileDataIntoLocalStorage();
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

  // Clear existing localStorage data to ensure clean state for new users
  const localStorageKeys = [
    'scheduleManager_employees',
    'scheduleManager_schedules',
    'scheduleManager_departments',
    'scheduleManager_holidays',
    'scheduleManager_mandatory_vacations',
    'scheduleManager_currency'
  ];
  
  // Always clear data first to ensure clean state
  localStorageKeys.forEach(key => localStorage.removeItem(key));

  if (rows && rows.data) {
    // Load remote into localStorage
    const d = rows.data || {};
    if (d.scheduleManager_employees) localStorage.setItem('scheduleManager_employees', JSON.stringify(d.scheduleManager_employees));
    if (d.scheduleManager_schedules) localStorage.setItem('scheduleManager_schedules', JSON.stringify(d.scheduleManager_schedules));
    if (d.scheduleManager_departments) localStorage.setItem('scheduleManager_departments', JSON.stringify(d.scheduleManager_departments));
    if (d.scheduleManager_holidays) localStorage.setItem('scheduleManager_holidays', JSON.stringify(d.scheduleManager_holidays));
    if (d.scheduleManager_mandatory_vacations) localStorage.setItem('scheduleManager_mandatory_vacations', JSON.stringify(d.scheduleManager_mandatory_vacations));
    if (d.scheduleManager_currency) localStorage.setItem('scheduleManager_currency', d.scheduleManager_currency);
  } else {
    // No remote yet: set empty defaults for new users
    localStorage.setItem('scheduleManager_employees', JSON.stringify([]));
    localStorage.setItem('scheduleManager_schedules', JSON.stringify({}));
    localStorage.setItem('scheduleManager_departments', JSON.stringify([]));
    localStorage.setItem('scheduleManager_holidays', JSON.stringify({}));
    localStorage.setItem('scheduleManager_mandatory_vacations', JSON.stringify({}));
    // Set default currency to Ft for new users
    localStorage.setItem('scheduleManager_currency', 'Ft');
    await cloudSyncSave();
  }
  
  // Also load profile data and store in localStorage
  await loadProfileDataIntoLocalStorage();
}

let syncTimeout;

async function cloudSyncSave() {
  // Debounce sync requests to prevent excessive API calls
  if (syncTimeout) {
    clearTimeout(syncTimeout);
  }
  
  syncTimeout = setTimeout(async () => {
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
    } finally {
      syncTimeout = null;
    }
  }, 500); // Debounce for 500ms
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

// Function to check if welcome notification has been shown and mark it as shown
async function checkAndMarkWelcomeNotification() {
  try {
    const session = await getSession();
    if (!session) return false;
    
    const userId = session.user.id;
    
    // Get the current welcome notification status
    const { data, error } = await window.supabaseClient
      .from('profiles')
      .select('welcome_notification_shown')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Error checking welcome notification status:', error);
      return false;
    }
    
    // If welcome notification hasn't been shown yet, return true (should show it)
    // and mark it as shown in the database
    if (!data || !data.welcome_notification_shown) {
      // Mark welcome notification as shown
      const { error: updateError } = await window.supabaseClient
        .from('profiles')
        .update({ welcome_notification_shown: true })
        .eq('id', userId);
      
      if (updateError) {
        console.error('Error updating welcome notification status:', updateError);
      }
      
      // Return true to indicate that welcome notification should be shown
      return true;
    }
    
    // Welcome notification has already been shown
    return false;
  } catch (err) {
    console.error('Error in checkAndMarkWelcomeNotification:', err);
    return false;
  }
}

// Function to directly mark welcome notification as shown (used when closing the modal)
async function markWelcomeNotificationAsShown() {
  try {
    const session = await getSession();
    if (!session) return false;
    
    const userId = session.user.id;
    
    // Mark welcome notification as shown
    const { error } = await window.supabaseClient
      .from('profiles')
      .update({ welcome_notification_shown: true })
      .eq('id', userId);
    
    if (error) {
      console.error('Error updating welcome notification status:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Error in markWelcomeNotificationAsShown:', err);
    return false;
  }
}

// Function to perform delayed profile sync if needed
async function performDelayedProfileSync() {
    try {
        const session = await getSession();
        if (!session) return;
        
        const userId = session.user.id;
        const storedUsername = localStorage.getItem('scheduleManager_username');
        
        if (storedUsername) {
            // Try to update the profile with the stored username
            const { data: updateData, error: updateError } = await window.supabaseClient
                .from('profiles')
                .update({ 
                    username: storedUsername, 
                    display_name: storedUsername 
                })
                .eq('id', userId)
                .select();
            
            if (!updateError && updateData && updateData.length > 0) {
                console.log('Successfully synced profile for user:', userId);
                localStorage.removeItem('scheduleManager_profile_needs_sync');
                return true;
            } else {
                console.error('Failed to sync profile:', updateError);
                return false;
            }
        }
        return false;
    } catch (syncError) {
        console.error('Error in delayed profile sync:', syncError);
        return false;
    }
}

// Function to periodically check and fix profile issues
async function periodicProfileCheck() {
  try {
    const session = await getSession();
    if (!session) return;
    
    const userId = session.user.id;
    const storedUsername = localStorage.getItem('scheduleManager_username');
    
    // If we don't have a stored username, nothing to check
    if (!storedUsername) return;
    
    // Check if profile needs sync
    const needsSync = localStorage.getItem('scheduleManager_profile_needs_sync') === 'true';
    if (needsSync) {
      console.log('Performing periodic profile sync...');
      await performDelayedProfileSync();
      return;
    }
    
    // Additionally, check if the database profile has a temporary username
    const { data: profileData, error: profileError } = await window.supabaseClient
      .from('profiles')
      .select('username')
      .eq('id', userId)
      .maybeSingle();
    
    if (!profileError && profileData) {
      // If the database has a temporary username but we have a real one in localStorage
      if ((profileData.username.startsWith('user_') || profileData.username.startsWith('pending_') || profileData.username.startsWith('temp_')) 
          && storedUsername 
          && !storedUsername.startsWith('user_') 
          && !storedUsername.startsWith('pending_') 
          && !storedUsername.startsWith('temp_')) {
        console.log('Detected temporary username in database, syncing with localStorage value...');
        const syncResult = await performDelayedProfileSync();
        if (syncResult) {
          console.log('Successfully fixed temporary username issue');
        }
      }
    }
  } catch (err) {
    console.error('Error in periodic profile check:', err);
  }
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
window.checkAndMarkWelcomeNotification = checkAndMarkWelcomeNotification;
window.markWelcomeNotificationAsShown = markWelcomeNotificationAsShown;
window.performDelayedProfileSync = performDelayedProfileSync;
window.periodicProfileCheck = periodicProfileCheck;

// Convenience: logout and redirect to login
window.logoutUser = async function() {
  try {
    // Ensure all data is saved before logout
    if (typeof window.cloudSyncSave === 'function') {
      await window.cloudSyncSave();
      // Add a small delay to ensure the save completes
      await new Promise(resolve => setTimeout(resolve, 300)); // Reduced from 500ms to 300ms
    }
    
    await signOut();
  } catch (e) {
    console.error(e);
  } finally {
    try { 
      // Clear localStorage after successful logout
      localStorage.clear(); 
    } catch (_) {}
    window.location.href = 'login.html';
  }
}