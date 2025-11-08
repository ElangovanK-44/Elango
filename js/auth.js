import { supabase } from './supabase.js';

// Check if user session is valid
export async function checkSession() {
  const sessionId = localStorage.getItem('sessionId');
  console.log('checkSession: sessionId from localStorage:', sessionId);
  
  if (!sessionId) {
    console.warn('No sessionId found in localStorage. Redirecting to signin.');
    window.location.href = '/signin.html';
    return false;
  }

  const { data: { user } } = await supabase.auth.getUser();
  console.log('checkSession: supabase user:', user);
  
  if (!user) {
    console.warn('No user found in Supabase auth. Redirecting to signin.');
    window.location.href = '/signin.html';
    return false;
  }

  // Verify session is still active in database
  const { data: session, error } = await supabase
    .from('user_sessions')
    .select('is_active')
    .eq('user_id', user.id)
    .eq('session_id', sessionId)
    .eq('is_active', true)
    .maybeSingle();
  console.log('checkSession: session from DB:', session, 'error:', error);

  if (error || !session) {
    console.warn('Session not found or inactive in DB. Logging out.');
    // Session not found or inactive, logout user
    await logoutUser();
    return false;
  }

  console.log('Session is valid!');
  return true;
}

// Logout user and deactivate session
export async function logoutUser() {
  const sessionId = localStorage.getItem('sessionId');
  
  if (sessionId) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Deactivate the session in database
      await supabase
        .from('user_sessions')
        .update({ is_active: false, logged_out_at: new Date().toISOString() })
        .eq('session_id', sessionId)
        .eq('user_id', user.id);
    }
  }

  // Sign out from Supabase
  await supabase.auth.signOut();

  // Clear local storage
  localStorage.removeItem('sessionId');
  localStorage.removeItem('userName');

  // Redirect to signin
  window.location.href = '/signin.html';
}

// Initialize session check on page load
export function initAuth() {
  checkSession();
}

// Make logout function available globally
window.handleLogout = async function(event) {
  if (event) {
    event.preventDefault();
  }
  
  if (confirm('Are you sure you want to logout?')) {
    await logoutUser();
  }
  
  return false;
};
