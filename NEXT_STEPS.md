# 🚀 Next Steps - Getting FamBam Buzz Running

You're almost ready to launch! Follow these steps in order:

## Step 1: Set Up Supabase Database (15 minutes)

1. **Open Supabase Dashboard:**
   - Go to: https://app.supabase.com/project/zdmyiowalhdzneftwzrb
   - Log in to your Supabase account

2. **Create Database Tables:**
   - Click **SQL Editor** in the left sidebar
   - Click **New Query**
   - Open the file `supabase/schema.sql` in your project
   - Copy ALL the SQL code
   - Paste it into the Supabase SQL Editor
   - Click **Run** button
   - You should see: "Success. No rows returned"

3. **Create Storage Bucket for Photos:**
   - Click **Storage** in the left sidebar
   - Click **Create a new bucket**
   - Set name: `media`
   - Check **Public bucket** ✓
   - Set file size limit: `5` MB
   - Set allowed MIME types: `image/*,video/*`
   - Click **Create bucket**

4. **Set Storage Policies:**
   - Go to **Storage** > Click on `media` bucket
   - Click **Policies** tab
   - Click **New Policy**
   - Select **For full customization**
   - Open file `supabase/storage-setup.sql`
   - Copy and run each policy separately (3 policies total)

5. **Verify Email Auth is Enabled:**
   - Click **Authentication** in the left sidebar
   - Click **Providers**
   - Ensure **Email** is toggled ON (green)

## Step 2: Test Locally (5 minutes)

1. **Start the development server:**
   ```bash
   cd /Users/fletcher/code/fambam-buzz-site
   npm run dev
   ```

2. **Open your browser:**
   - Visit: http://localhost:4321

3. **Create your first account:**
   - Click "Sign up"
   - Enter your email and password
   - Set your display name
   - Click "Create Account"

4. **Test the features:**
   - Create a post
   - Upload a photo
   - Edit your profile
   - Visit the Admin page

## Step 3: Invite Family Members

Once everything is working locally:

1. **Share the login link** with family members
2. Each person should:
   - Go to `/signup`
   - Create their account
   - Set up their profile
   - Start posting!

## Step 4: Deploy to Production (Optional - 30 minutes)

See `DEPLOYMENT.md` for full deployment instructions.

**Quick Deploy to Vercel (Recommended):**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Follow prompts:
# - Link to new project: Yes
# - Project name: fambam-buzz
# - Add environment variables when prompted
```

Then point your domain fambam.buzz to Vercel.

## Common Issues & Solutions

### Issue: "Missing Supabase environment variables"
**Solution:** Make sure `.env` file exists with your credentials:
```
PUBLIC_SUPABASE_URL=https://zdmyiowalhdzneftwzrb.supabase.co
PUBLIC_SUPABASE_ANON_KEY=sb_publishable_s6qSC7dpfmcIg7JoXWJD6Q_wM05p0Y6
```

### Issue: "Failed to create post"
**Solution:** 
- Check that database tables were created (Step 1.2)
- Verify you're signed in
- Check browser console for errors

### Issue: "Image upload failed"
**Solution:**
- Verify storage bucket "media" exists (Step 1.3)
- Check storage policies are set (Step 1.4)
- Ensure file is under 5MB

### Issue: "Can't sign up / sign in"
**Solution:**
- Verify email authentication is enabled (Step 1.5)
- Check Supabase project URL is correct in `.env`
- Try a different email address

## Features Overview

### For Family Members:
- ✅ Create and edit profile
- ✅ Post text updates
- ✅ Upload up to 4 photos per post
- ✅ View family feed
- ✅ Delete own posts
- ✅ View other family members' profiles

### For Admins:
- ✅ View storage statistics
- ✅ Monitor number of posts
- ✅ Clean up old posts
- ✅ Check database usage

## Storage Limits

**Supabase Free Tier:**
- Database: 500 MB
- Storage: 1 GB (for photos)
- Bandwidth: 5 GB/month

**Tips to maximize storage:**
- Photos are automatically compressed (saves ~70%)
- Use Admin page to delete old posts
- Upgrade to Supabase Pro ($25/mo) when needed

## Need Help?

1. Check the documentation:
   - `README.md` - Overview and features
   - `SUPABASE_SETUP.md` - Detailed Supabase setup
   - `DEPLOYMENT.md` - Deployment options

2. Check Supabase Dashboard:
   - Database: https://app.supabase.com/project/zdmyiowalhdzneftwzrb/editor
   - Storage: https://app.supabase.com/project/zdmyiowalhdzneftwzrb/storage/buckets

3. Common commands:
   ```bash
   npm run dev       # Start development server
   npm run build     # Build for production
   npm run preview   # Preview production build
   ```

## What's Included

✅ Complete authentication system (signup, login, logout)
✅ User profiles with avatars and bios
✅ Post creation with text and photos
✅ Shared family feed
✅ Image compression and optimization
✅ Storage management dashboard
✅ Mobile-responsive design
✅ Secure with Row Level Security
✅ Free tier friendly (smart storage management)

---

🎉 **You're all set!** Start with Step 1 above to get your family social network running!

Any questions? Check the documentation files or visit the Supabase docs.
