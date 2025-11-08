# Single Session Login System

## Overview
This implementation ensures that users can only have **one active login session at a time**. If a user tries to login from another device or browser while already logged in, they will be prevented and shown an error message.

## How It Works

### 1. **Login Process** (`js/signin.js`)
- When a user logs in, the system checks if they already have an active session
- If an active session exists, login is prevented with the message: "You are already logged in on another device/browser"
- If no active session exists, a new session is created with a unique session ID
- The session ID is stored in both:
  - Local storage (browser)
  - Database (user_sessions table)

### 2. **Session Validation** (`js/auth.js`)
- On every protected page load, the system validates:
  - Session ID exists in local storage
  - User is authenticated with Supabase
  - Session is still marked as active in the database
- If validation fails, user is automatically logged out and redirected to signin page

### 3. **Logout Process** (`js/auth.js`)
- When user clicks logout:
  - Session is marked as inactive in database
  - Logged out timestamp is recorded
  - Local storage is cleared
  - Supabase auth session is terminated
  - User is redirected to signin page

## Database Setup

### Step 1: Create the user_sessions table
Run the SQL script in your Supabase SQL Editor:

```bash
# The SQL file is located at:
database/create_user_sessions_table.sql
```

This will create:
- `user_sessions` table with proper indexes
- Row Level Security (RLS) policies
- Proper foreign key relationships

### Step 2: Verify Table Creation
In Supabase Dashboard:
1. Go to Table Editor
2. Verify `user_sessions` table exists with columns:
   - id (UUID, primary key)
   - user_id (UUID, references auth.users)
   - session_id (VARCHAR, unique)
   - is_active (BOOLEAN)
   - created_at (TIMESTAMP)
   - logged_out_at (TIMESTAMP)
   - last_activity (TIMESTAMP)

## Files Modified

### New Files Created:
1. **`js/auth.js`** - Session management and authentication middleware
2. **`database/create_user_sessions_table.sql`** - Database schema for sessions

### Modified Files:
1. **`js/signin.js`** - Added session checking before login
2. **`js/dashboard.js`** - Added auth check on page load
3. **`js/deposit.js`** - Added auth check on page load
4. **`js/withdraw.js`** - Added auth check on page load
5. **`js/referral.js`** - Added auth check on page load
6. **`js/profile.js`** - Added auth check on page load
7. **`dashboard.html`** - Updated logout link to use proper logout function
8. **`deposit.html`** - Updated logout link
9. **`withdraw.html`** - Updated logout link
10. **`referral.html`** - Updated logout link
11. **`profile.html`** - Updated logout link

## Usage

### For Users:
1. **Login**: Enter credentials on signin page
2. **Single Session**: Can only be logged in on one device/browser at a time
3. **Logout**: Click logout button to end current session
4. **New Login**: After logout, can login again from any device

### For Developers:
```javascript
// Import auth functions
import { initAuth, logoutUser } from './auth.js';

// Check auth on protected pages
initAuth();

// Manually logout user
await logoutUser();
```

## Security Features

1. **Session Tracking**: Each login creates a unique session ID
2. **Database Validation**: Sessions validated against database on every page load
3. **Automatic Cleanup**: Inactive sessions marked with logout timestamp
4. **RLS Policies**: Users can only access their own session data
5. **Token-based**: Uses Supabase JWT tokens for authentication

## Testing

### Test Scenario 1: Normal Login/Logout
1. Login with valid credentials
2. Access dashboard and other pages
3. Click logout
4. Verify redirect to signin page

### Test Scenario 2: Duplicate Login Prevention
1. Login from Browser A
2. Try to login from Browser B with same credentials
3. Verify error message appears
4. Logout from Browser A
5. Login from Browser B should now work

### Test Scenario 3: Session Expiry
1. Login normally
2. Manually delete session from database
3. Navigate to any protected page
4. Verify automatic logout and redirect

## Troubleshooting

### Issue: "You are already logged in" but I'm not
**Solution**: Old session stuck in database
```sql
-- In Supabase SQL Editor, clear old sessions:
UPDATE user_sessions 
SET is_active = false, logged_out_at = NOW() 
WHERE user_id = 'YOUR_USER_ID';
```

### Issue: Automatic logout on every page refresh
**Solution**: Check browser local storage and Supabase session
1. Open browser DevTools > Application > Local Storage
2. Verify `sessionId` exists
3. Check Supabase auth state in console

### Issue: Database table not found
**Solution**: Run the SQL migration script
1. Copy content from `database/create_user_sessions_table.sql`
2. Paste in Supabase SQL Editor
3. Run the script

## Future Enhancements

Possible improvements:
1. **Session Timeout**: Auto-logout after inactivity
2. **Multi-Device Management**: Allow viewing and managing all active sessions
3. **Session History**: Keep log of all login/logout activities
4. **Device Information**: Track device type, browser, IP address
5. **Force Logout**: Admin ability to force logout users
6. **Remember Me**: Optional persistent sessions

## Support

For issues or questions:
1. Check browser console for errors
2. Verify database tables exist
3. Check Supabase auth dashboard
4. Review RLS policies in Supabase
