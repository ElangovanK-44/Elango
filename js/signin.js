import { validateMobile, showError, hideError } from './utils.js';
import { supabase } from './supabase.js';

const form = document.getElementById('signinForm');
const submitButton = form.querySelector('button[type="submit"]');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  hideError('errorMessage');

  const formData = {
    mobile: document.getElementById('mobile').value.trim(),
    password: document.getElementById('password').value
  };

  if (!validateMobile(formData.mobile)) {
    showError('errorMessage', 'Please enter a valid 10-digit mobile number');
    return;
  }

  if (!formData.password) {
    showError('errorMessage', 'Please enter your password');
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = 'Signing In...';

  try {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('email, id')
      .eq('mobile', formData.mobile)
      .maybeSingle();
    console.log('userData:', userData, 'userError:', userError);

    if (userError) {
      throw userError;
    }

    if (!userData) {
      showError('errorMessage', 'No account found with this mobile number');
      submitButton.disabled = false;
      submitButton.textContent = 'Sign In';
      return;
    }

    // Check if user already has an active session
    const { data: existingSession } = await supabase
      .from('user_sessions')
      .select('session_id, created_at')
      .eq('user_id', userData.id)
      .eq('is_active', true)
      .maybeSingle();
    console.log('existingSession:', existingSession);

    if (existingSession) {
      showError('errorMessage', 'You are already logged in on another device/browser. Please logout from the other session first.');
      submitButton.disabled = false;
      submitButton.textContent = 'Sign In';
      return;
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: userData.email,
      password: formData.password
    });
    console.log('authData:', authData, 'authError:', authError);

    if (authError) {
      throw authError;
    }

    if (authData.user) {
      const { data: profile } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', authData.user.id)
        .maybeSingle();
      console.log('profile:', profile);

      if (profile) {
        localStorage.setItem('userName', profile.full_name);
      }

      // Create a new session record
      const sessionId = crypto.randomUUID();
      localStorage.setItem('sessionId', sessionId);
      console.log('sessionId created:', sessionId);

      const { error: sessionInsertError } = await supabase
        .from('user_sessions')
        .insert({
          user_id: authData.user.id,
          session_id: sessionId,
          is_active: true,
          created_at: new Date().toISOString()
        });
      console.log('sessionInsertError:', sessionInsertError);

      window.location.href = '/dashboard.html';
    }
  } catch (error) {
    console.error('Signin error:', error);

    let errorMessage = 'An error occurred during sign in. Please try again.';

    if (error.message && error.message.includes('Invalid login credentials')) {
      errorMessage = 'Invalid mobile number or password';
    } else if (error.message) {
      errorMessage = error.message;
    }

    showError('errorMessage', errorMessage);
    submitButton.disabled = false;
    submitButton.textContent = 'Sign In';
  }
});