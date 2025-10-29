# Disable Email Confirmation for Template Websites

## Supabase Dashboard Settings

Go to your Supabase project dashboard and update these settings:

### 1. Authentication Settings
**Path:** Authentication → Providers → Email

- **Enable email confirmations:** Turn OFF
- **Enable email change confirmations:** Turn OFF (optional)

### 2. Alternative: Update via SQL
Run this in Supabase SQL Editor:

```sql
-- This updates the auth config to disable email confirmation
-- Note: This might not work depending on your Supabase version
-- Use the dashboard method above instead
```

After making this change, users will be able to sign up and immediately sign in without email confirmation, just like Google OAuth.
