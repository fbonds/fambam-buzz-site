# Fix Email Verification Link

## The Problem

Supabase is sending verification emails with `localhost:3000` instead of `https://fambam.buzz`.

## The Solution

Configure your Site URL in Supabase dashboard.

## Step-by-Step Fix

### 1. Go to Supabase Dashboard

Visit: https://app.supabase.com/project/zdmyiowalhdzneftwzrb/auth/url-configuration

Or navigate:
1. Go to https://app.supabase.com
2. Select your project (zdmyiowalhdzneftwzrb)
3. Click **Authentication** in left sidebar
4. Click **URL Configuration**

### 2. Update Site URL

Find the **Site URL** setting and change it to:

```
https://fambam.buzz
```

**Important:** Use `https://` not `http://`

### 3. Add Redirect URLs (Optional but Recommended)

In the **Redirect URLs** section, add these allowed URLs:

```
https://fambam.buzz
https://fambam.buzz/**
https://www.fambam.buzz
https://www.fambam.buzz/**
http://localhost:4321/**  (for local development)
```

Click **Add URL** for each one.

### 4. Save Changes

Click **Save** at the bottom of the page.

### 5. Test the Fix

1. **Try logging in again** at https://fambam.buzz
2. If you're already registered, just sign in with your email/password
3. You should be able to log in without email verification
4. OR register a new test account to verify the email link works

## What About the Token You Have?

The verification link you received has a valid token. You can manually complete verification:

### Option 1: Use the Token Directly

1. Go to: https://fambam.buzz
2. Replace the URL with: `https://fambam.buzz/#access_token=YOUR_TOKEN_HERE&type=signup`
3. The site should recognize the token and log you in

### Option 2: Just Sign In

Since Supabase confirmed your email (you clicked the link), you can probably just sign in:

1. Go to: https://fambam.buzz/login.html
2. Enter your email: fbonds@gmail.com
3. Enter your password
4. Click Sign In

The email verification might have already completed in the background.

## Additional Settings to Check

While in Supabase Authentication settings:

### Email Templates

**Authentication** → **Email Templates**

Check these templates:
- **Confirm signup** - This is the verification email
- **Magic Link** - If you want passwordless login
- **Change Email Address** - For email changes

You can customize the email content here if needed.

### Disable Email Confirmation (Optional)

If you don't want to require email verification:

1. Go to **Authentication** → **Providers** → **Email**
2. Find **Confirm email**
3. Toggle it OFF
4. Click **Save**

This allows users to sign in immediately without email verification.

**Note:** For a private family site, disabling email confirmation might be fine since you control who has access.

## Testing After Fix

1. **Create a new test account:**
   - Go to https://fambam.buzz/signup.html
   - Use a different email (e.g., test@example.com)
   - Complete signup

2. **Check your email**
   - Should receive verification email
   - Link should now point to `https://fambam.buzz`
   - Click the link

3. **Verify it works**
   - Should redirect to your site
   - Should be automatically logged in
   - Can create posts, etc.

## Current Status

Your account (fbonds@gmail.com) should already be verified since you clicked the email link. The token in the URL was valid, it just went to the wrong domain (localhost).

**Try logging in now** at https://fambam.buzz/login.html with your credentials.

## Why This Happened

When you built the site locally with `npm run build`, Supabase was configured with `localhost` as the default. The Site URL setting in Supabase overrides this for production.

## Summary

✅ **Quick Fix:** Change Site URL in Supabase to `https://fambam.buzz`

✅ **Test:** Try logging in at https://fambam.buzz/login.html

✅ **Optional:** Disable email confirmation for easier family signup

---

**Next step:** Update Supabase Site URL, then try logging in!
