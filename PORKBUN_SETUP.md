# Porkbun Setup Instructions

## The Issue

You're getting a 403 because Porkbun is serving your **source code** (from the root directory) instead of the **built files** (from the `dist/` directory).

## Solution

You need to configure Porkbun to either:
1. Build your site automatically when you push, OR
2. Point to the `dist/` directory

## Option 1: Configure Build Settings (Recommended)

In your Porkbun Secure Static Hosting dashboard:

### Build Settings:

| Setting | Value |
|---------|-------|
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |
| **Root Directory** | `/` |

### Rewrite Settings:

| Setting | Value |
|---------|-------|
| **Rewrite URL Path** | `/index.html` |

This tells Porkbun:
1. When you push to Git, run `npm install && npm run build`
2. Serve files from the `dist/` folder
3. Rewrite all routes to `/index.html` for SPA routing

## Option 2: Manual Upload via FTP (If auto-build isn't available)

If Porkbun doesn't support automatic building:

1. **Build locally:**
   ```bash
   npm run build
   ```

2. **Connect via FTP/SFTP:**
   - Get FTP credentials from Porkbun dashboard
   - Connect with FileZilla or another FTP client

3. **Upload ONLY `dist/` contents:**
   ```
   Upload these files to the ROOT of your hosting:
   dist/index.html → /index.html
   dist/login.html → /login.html
   dist/signup.html → /signup.html
   dist/admin.html → /admin.html
   dist/profile.html → /profile.html
   dist/favicon.svg → /favicon.svg
   dist/_astro/ → /_astro/
   dist/_redirects → /_redirects
   ```

4. **Set rewrite rule:**
   - Path: `/index.html`

## Option 3: Use GitHub Actions (If Porkbun supports it)

If Porkbun supports deploying from a specific branch, you can use GitHub Actions to build and push to a `gh-pages` branch.

## Checking Your Current Porkbun Configuration

Log into Porkbun and check:

1. **Go to:** Domain Management → fambam.buzz → Secure Static Hosting

2. **Check these settings:**
   - [ ] Connected to GitHub repo?
   - [ ] Build command configured?
   - [ ] Publish/output directory set to `dist`?
   - [ ] Rewrite URL path set to `/index.html`?

## What's Happening Now

Currently, Porkbun is likely:
- ✅ Connected to your Git repo
- ✅ Pulling your code when you push
- ❌ Serving from root directory (not `dist/`)
- ❌ Trying to serve `src/` files directly
- ❌ Can't find an `index.html` in root → 403 error

## What Should Happen

After configuration, Porkbun should:
- ✅ Pull your code from Git
- ✅ Run `npm install && npm run build`
- ✅ Serve files from `dist/` directory
- ✅ Serve `dist/index.html` at https://fambam.buzz
- ✅ Rewrite all routes to `/index.html`

## Testing After Configuration

1. Make a small change and push to Git
2. Wait for Porkbun to rebuild (may take 1-5 minutes)
3. Visit https://fambam.buzz
4. You should see the login page (in dev mode) or login form

## Common Porkbun Settings

Different hosts use different terminology:

| Our Term | Porkbun Might Call It |
|----------|----------------------|
| Build Command | Build Command, Build Script |
| Publish Directory | Output Directory, Public Directory, Root |
| Rewrite Rule | SPA Redirect, URL Rewrite |

## If Porkbun Doesn't Support Auto-Build

Some static hosting services don't support Node.js builds. If that's the case:

1. **Build locally before every push:**
   ```bash
   npm run build
   git add dist/
   git commit -m "Add built files"
   git push
   ```

2. **Configure Porkbun to serve from `dist/`**

3. **OR: Commit built files to a separate branch:**
   ```bash
   # Build
   npm run build
   
   # Push dist to a deploy branch
   git subtree push --prefix dist origin gh-pages
   ```
   
   Then point Porkbun to the `gh-pages` branch

## Environment Variables

Note: Since this is a static build, environment variables are embedded at build time.

Your `.env` file contains:
```bash
PUBLIC_SUPABASE_URL=https://zdmyiowalhdzneftwzrb.supabase.co
PUBLIC_SUPABASE_ANON_KEY=sb_publishable_s6qSC7dpfmcIg7JoXWJD6Q_wM05p0Y6
DEV_MODE=false  # Change to false for production!
```

These are embedded into the JavaScript during `npm run build`.

## Before Deploying to Production

**IMPORTANT:** Disable dev mode!

Edit `.env`:
```bash
DEV_MODE=false
```

Then rebuild and push:
```bash
npm run build
git add .env dist/
git commit -m "Disable dev mode for production"
git push
```

## Quick Checklist

- [ ] Porkbun connected to Git repo
- [ ] Build command: `npm install && npm run build`
- [ ] Publish directory: `dist`
- [ ] Rewrite URL path: `/index.html`
- [ ] DEV_MODE=false in `.env`
- [ ] Pushed latest changes to Git
- [ ] Waited for Porkbun to rebuild
- [ ] Tested at https://fambam.buzz

## Need Help?

If you're still seeing 403:

1. **Check Porkbun logs** - Most hosting services show build logs
2. **Verify publish directory** - Make sure it's set to `dist`
3. **Check file permissions** - Files should be readable (644)
4. **Contact Porkbun support** - Ask about Node.js build support

## Alternative: Commit Built Files

If Porkbun truly doesn't support building, you can commit the `dist/` folder:

1. **Remove `dist/` from `.gitignore`:**
   ```bash
   # Edit .gitignore and remove the line: dist/
   ```

2. **Commit built files:**
   ```bash
   npm run build
   git add dist/
   git commit -m "Add built files for Porkbun"
   git push
   ```

3. **Configure Porkbun to serve from `dist/`**

---

**Next step:** Check your Porkbun dashboard for build settings and configure as described above.
