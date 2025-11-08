import { formatCurrency } from './utils.js';
import { initAuth } from './auth.js';

// Check authentication on page load
initAuth();

const amountInput = document.getElementById('amount');

amountInput.addEventListener('input', updateSummary);

function updateSummary() {
  const amount = parseFloat(amountInput.value) || 0;

  const monthlyPayout = Math.floor(amount * 0.09);
  const totalReturns = monthlyPayout * 24;

  document.getElementById('principalAmount').textContent = formatCurrency(amount);
  document.getElementById('monthlyPayout').textContent = formatCurrency(monthlyPayout);
  document.getElementById('totalReturns').textContent = formatCurrency(totalReturns);
}

window.convertToUSD = function() {
  const amount = parseFloat(amountInput.value);

  if (!amount || amount < 100000) {
    alert('Please enter a valid amount (minimum ₹1,00,000)');
    return;
  }

  const usdRate = 83;
  const usdAmount = (amount / usdRate).toFixed(2);

  alert(`₹${amount.toLocaleString('en-IN')} = $${usdAmount} USD\n\nPlease send approximately $${usdAmount} USDT to the address below.`);
};

updateSummary();
