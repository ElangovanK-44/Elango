import { showError, hideError, showToast } from './utils.js';
import { initAuth } from './auth.js';

// Check authentication on page load
initAuth();

const form = document.getElementById('withdrawForm');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const amount = parseFloat(document.getElementById('amount').value);
  const bankDetails = document.getElementById('bankDetails').value.trim();
  const cryptoAddress = document.getElementById('cryptoAddress').value.trim();

  if (amount < 1000) {
    showToast('Minimum withdrawal amount is ₹1,000', 'error');
    return;
  }

  if (!bankDetails && !cryptoAddress) {
    showToast('Please provide either bank details or crypto address', 'error');
    return;
  }

  showToast('Withdrawal request submitted successfully!');

  setTimeout(() => {
    form.reset();
  }, 1500);
});
