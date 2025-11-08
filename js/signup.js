import { validateEmail, validateMobile, validatePassword, showError, hideError, showSuccess } from './utils.js';
import { supabase, generateReferralCode } from './supabase.js';

const form = document.getElementById('signupForm');
const submitButton = form.querySelector('button[type="submit"]');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  hideError('errorMessage');
  hideError('successMessage');

  const formData = {
    fullName: document.getElementById('fullName').value.trim(),
    mobile: document.getElementById('mobile').value.trim(),
    altMobile: document.getElementById('altMobile').value.trim(),
    email: document.getElementById('email').value.trim(),
    password: document.getElementById('password').value,
    confirmPassword: document.getElementById('confirmPassword').value,
    referralCode: document.getElementById('referralCode').value.trim()
  };

  if (!formData.fullName) {
    showError('errorMessage', 'Please enter your full name');
    return;
  }

  if (!validateMobile(formData.mobile)) {
    showError('errorMessage', 'Please enter a valid 10-digit mobile number');
    return;
  }

  if (!validateEmail(formData.email)) {
    showError('errorMessage', 'Please enter a valid email address');
    return;
  }

  if (!validatePassword(formData.password)) {
    showError('errorMessage', 'Password must be at least 6 characters long');
    return;
  }

  if (formData.password !== formData.confirmPassword) {
    showError('errorMessage', 'Passwords do not match');
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = 'Creating Account...';

  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
          mobile: formData.mobile
        }
      }
    });

    if (authError) {
      throw authError;
    }

    if (authData.user) {
      const ownReferralCode = generateReferralCode();

      const { error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user.id,
            full_name: formData.fullName,
            mobile: formData.mobile,
            alt_mobile: formData.altMobile || null,
            email: formData.email,
            referral_code: formData.referralCode || null,
            own_referral_code: ownReferralCode,
            kyc_status: 'pending'
          }
        ]);

      if (profileError) {
        throw profileError;
      }

      showSuccess('successMessage', 'Account created successfully! Redirecting to sign in...');

      setTimeout(() => {
        window.location.href = '/signin.html';
      }, 2000);
    }
  } catch (error) {
    console.error('Signup error:', error);

    let errorMessage = 'An error occurred during signup. Please try again.';

    if (error.message.includes('already registered')) {
      errorMessage = 'This email is already registered. Please sign in instead.';
    } else if (error.message.includes('duplicate key')) {
      errorMessage = 'This mobile number or email is already registered.';
    } else if (error.message) {
      errorMessage = error.message;
    }

    showError('errorMessage', errorMessage);
    submitButton.disabled = false;
    submitButton.textContent = 'Sign Up';
  }
});