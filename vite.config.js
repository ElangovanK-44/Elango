import { defineConfig } from 'vite'
import { resolve } from 'path'

// Multi-page build: include all top-level HTML pages so they're emitted to dist
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        signin: resolve(__dirname, 'signin.html'),
        signup: resolve(__dirname, 'signup.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
        deposit: resolve(__dirname, 'deposit.html'),
        withdraw: resolve(__dirname, 'withdraw.html'),
        referral: resolve(__dirname, 'referral.html'),
        profile: resolve(__dirname, 'profile.html')
      }
    }
  }
})
