# Deploying to Porkbun Static Hosting

Your FamBam Buzz site is now configured as a **static Single-Page Application (SPA)** ready for Porkbun deployment.

## Prerequisites

1. ✅ Supabase project set up (see `SUPABASE_SETUP.md`)
2. ✅ Porkbun domain (fambam.buzz) 
3. ✅ Porkbun Secure Static Hosting enabled

## Step 1: Build for Production

Disable dev mode and build the static site:

1. **Edit `.env`:**
   ```bash
   # Disable dev mode for production
   DEV_MODE=false
   
   PUBLIC_SUPABASE_URL=https://zdmyiowalhdzneftwzrb.supabase.co
   PUBLIC_SUPABASE_ANON_KEY=sb_publishable_s6qSC7dpfmcIg7JoXWJD6Q_wM05p0Y6
   ```

2. **Build the site:**
   ```bash
   npm run build
   ```

   This creates a `dist/` folder with all your static files.

## Step 2: Verify Build Output

Check that `dist/` contains:
```
dist/
├── index.html           # Main entry point
├── login.html
├── signup.html
├── admin.html
├── _astro/              # JS and CSS assets
├── favicon.svg
└── profile/
    ├── [id].html
    └── edit.html
```

## Step 3: Configure Porkbun Static Hosting

### A. Set Root Directory

In Porkbun's hosting settings:

1. Go to **Domain Management** → **fambam.buzz**
2. Click **Secure Static Hosting**
3. Set **Root Directory** to: `/` (or wherever you upload the dist contents)

### B. Set Rewrite Rule (CRITICAL for SPA)

This makes internal routing work:

| Setting | Value |
|---------|-------|
| **Rewrite URL Path** | `/index.html` |

This tells the server: "For any path that doesn't exist as a file, serve index.html and let the JavaScript handle routing."

### C. Enable HTTPS

Ensure **Force HTTPS** is enabled in Porkbun settings.

## Step 4: Upload Files

### Option A: FTP/SFTP Upload

1. **Connect to Porkbun via FTP:**
   - Host: (provided by Porkbun)
   - Username: (your FTP username)
   - Password: (your FTP password)
   - Port: 21 (FTP) or 22 (SFTP)

2. **Upload the contents of `dist/` folder:**
   ```
   dist/index.html → /index.html
   dist/_astro/    → /_astro/
   dist/login.html → /login.html
   ... (all files)
   ```

   ⚠️ Upload the **contents** of dist, not the dist folder itself!

### Option B: Git Integration (if available)

If Porkbun supports Git integration:

1. Push to GitHub:
   ```bash
   git add .
   git commit -m "Production build for Porkbun"
   git push
   ```

2. Connect Porkbun to your GitHub repository
3. Set build command: `npm run build`
4. Set publish directory: `dist`

## Step 5: Test Your Deployment

1. **Visit your domain:** https://fambam.buzz

2. **Test these pages:**
   - Home/Feed: https://fambam.buzz
   - Login: https://fambam.buzz/login
   - Signup: https://fambam.buzz/signup
   - Profile: https://fambam.buzz/profile/[user-id]

3. **Test functionality:**
   - Sign up for an account
   - Verify email (if Supabase requires it)
   - Sign in
   - Create a post
   - Upload a photo
   - Edit profile

## Troubleshooting

### 403 Forbidden Error

**Cause:** Server can't find index.html

**Fix:**
1. Verify you uploaded the **contents** of `dist/`, not the folder itself
2. Check `index.html` is in the root directory
3. Verify permissions (644 for files, 755 for directories)

### Blank Page or "Not Found"

**Cause:** Rewrite rule not configured

**Fix:**
1. Set Rewrite URL Path to `/index.html` in Porkbun settings
2. Wait 5-10 minutes for DNS/CDN to update
3. Clear browser cache and try again

### Routes Don't Work (404 on refresh)

**Cause:** SPA routing not configured

**Fix:**
1. Ensure Rewrite URL Path is set to `/index.html`
2. Verify `_redirects` file is in the root
3. Contact Porkbun support if rewrite isn't working

### Login Not Working

**Cause:** Environment variables not set

**Fix:**
1. Supabase URLs must be in `src/lib/supabase.ts` (they're embedded at build time)
2. Rebuild with `npm run build` if you changed Supabase credentials
3. Check browser console for Supabase errors

### Images Not Uploading

**Cause:** Supabase storage not configured

**Fix:**
1. Complete `SUPABASE_SETUP.md` steps
2. Verify storage bucket "media" exists
3. Check storage policies are set
4. Ensure bucket is public

## File Structure on Porkbun

After upload, your Porkbun hosting should look like:

```
/ (root)
├── index.html           ← Main entry point
├── login.html
├── signup.html
├── admin.html
├── favicon.svg
├── _astro/
│   ├── client.[hash].js
│   ├── PostComposer.[hash].js
│   └── [css files]
└── profile/
    └── [id].html
```

## Updating Your Site

When you make changes:

1. **Make your code changes**

2. **Rebuild:**
   ```bash
   npm run build
   ```

3. **Re-upload `dist/` contents** via FTP/SFTP

4. **Clear cache:**
   - Browser cache
   - Porkbun CDN cache (if available in settings)

## Performance Tips

✅ **Already optimized:**
- Automatic image compression
- Minified JavaScript and CSS
- Optimized asset loading

🚀 **Additional optimizations:**
- Enable Porkbun CDN (if available)
- Set cache headers for static assets
- Use Supabase CDN for images

## Security Notes

⚠️ **Important:**
- `.env` file is NOT uploaded (it's build-time only)
- Supabase anon key is safe to include in static files
- NEVER include Supabase service role key in frontend

## Support

**Porkbun Issues:**
- Check Porkbun documentation
- Contact Porkbun support
- Verify hosting plan supports static sites

**Site Issues:**
- Check browser console for errors
- Verify Supabase setup is complete
- Check `TROUBLESHOOTING.md`

## Rollback Plan

If deployment fails:

1. Keep your old site backed up
2. Test locally first: `npm run build && npm run preview`
3. Upload to a test subdomain first (if available)

## Cost

**Monthly costs with Porkbun:**
- Hosting: $4/month (Porkbun existing)
- Supabase: $0 (free tier)
- **Total: $4/month**

## What's Different from Node.js Version

✅ **Static build** - No Node.js server needed
✅ **Client-side auth** - Supabase handles authentication
✅ **SPA routing** - Handled by Astro and browser
✅ **Simpler deployment** - Just upload files
✅ **Better performance** - Served from CDN

## Next Steps

1. Build: `npm run build`
2. Upload `dist/` contents to Porkbun
3. Set rewrite rule: `/index.html`
4. Test at https://fambam.buzz
5. Invite family members!

---

🎉 **Ready to deploy!** Follow the steps above to get FamBam Buzz live on Porkbun.
