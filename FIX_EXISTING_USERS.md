# Fix Existing User Profiles

## The Problem

Error: `violates foreign key constraint "posts_user_id_fkey"`

This means your user account exists in `auth.users` but doesn't have a corresponding profile in the `profiles` table.

## Why This Happened

The trigger that automatically creates profiles only works for NEW signups. Your account was created BEFORE the trigger, so it doesn't have a profile.

## Solution: Create Profiles for Existing Users

### Run This SQL in Supabase

1. **Go to SQL Editor:**
   https://app.supabase.com/project/zdmyiowalhdzneftwzrb/sql/new

2. **Copy and run this:**

```sql
-- Create profiles for all existing users who don't have one
INSERT INTO profiles (id, display_name, avatar_url, bio)
SELECT 
  u.id,
  COALESCE(u.raw_user_meta_data->>'display_name', split_part(u.email, '@', 1)) as display_name,
  u.raw_user_meta_data->>'avatar_url' as avatar_url,
  NULL as bio
FROM auth.users u
WHERE u.id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING;
```

3. **Click "Run"**

You should see: **"Success. [number] rows affected"**

### Verify It Worked

Run this query to check:

```sql
-- Check all users have profiles
SELECT 
  u.email,
  u.id,
  CASE WHEN p.id IS NOT NULL THEN '✓ Has Profile' ELSE '✗ Missing Profile' END as status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id;
```

You should see "✓ Has Profile" for all users.

## Test the Site

1. **Go to:** https://fambam.buzz
2. **Refresh:** Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
3. **Try creating a post**
4. **Should work now!** ✅

## What This SQL Does

- Finds all users in `auth.users` who don't have a profile
- Creates a profile for each one
- Uses their display name from signup metadata
- Uses their email username if no display name exists
- Sets bio to null (can be filled in later)

## If You Still Get Errors

### Check Your User ID

Run this to see your user info:

```sql
SELECT 
  id,
  email,
  raw_user_meta_data->>'display_name' as display_name
FROM auth.users
WHERE email = 'YOUR_EMAIL@example.com';
```

Replace `YOUR_EMAIL@example.com` with your actual email.

### Manually Create Your Profile

If the automatic script didn't work, create your profile manually:

```sql
-- Replace YOUR_USER_ID with your actual user ID from above
-- Replace 'Your Name' with your display name
INSERT INTO profiles (id, display_name, avatar_url, bio)
VALUES (
  'YOUR_USER_ID',
  'Your Name',
  NULL,
  NULL
)
ON CONFLICT (id) DO NOTHING;
```

## Prevention: The Trigger is Now Active

For any NEW users who sign up going forward:
- ✅ Profile automatically created on signup
- ✅ Display name taken from signup form
- ✅ No manual intervention needed

The trigger we created earlier handles this automatically.

## Summary

**Quick fix:**
1. Run the INSERT INTO profiles SQL above
2. Refresh your site
3. Try posting again
4. Should work! 🎉

**What it fixes:**
- Creates missing profile for your account
- Links your user account to the profiles table
- Allows posts to reference your user_id

---

**Estimated time:** 1 minute to run the SQL
