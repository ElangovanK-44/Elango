import { initAuth } from './auth.js';

// Check authentication on page load
initAuth();

const userName = localStorage.getItem('userName') || 'zoro';
const userNameElement = document.getElementById('userName');

if (userNameElement) {
  userNameElement.textContent = userName;
}
