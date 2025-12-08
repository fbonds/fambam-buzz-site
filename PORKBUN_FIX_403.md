# Fixing the 403 Error on Porkbun

## The Problem

You're seeing a 403 error because **Porkbun is trying to serve source code instead of built files**.

Your repo structure:
```
/ (root)
├── src/          ← Source code (can't be served directly)
├── dist/         ← Built files (THIS is what should be served)
│   ├── index.html
│   ├── login.html
│   └── _astro/
└── package.json
```

## The Solution

I've just committed the `dist/` folder to your repo. Now you need to configure Porkbun.

## Step 1: Check Porkbun Dashboard

1. Go to Porkbun → Domain Management → fambam.buzz
2. Click **Secure Static Hosting**
3. Look for these settings:

### Option A: If Porkbun has "Publish Directory" or "Root Directory" setting

Set it to: **`dist`**

This tells Porkbun to serve files from the `dist/` folder instead of root.

### Option B: If Porkbun doesn't have that setting

Then it should automatically serve from root, and since we just committed `dist/`, you now have:
- `/dist/index.html`
- `/dist/login.html`
- etc.

In this case, you need to either:
1. Move files from `dist/` to root in Git, OR
2. Access your site at `https://fambam.buzz/dist/` (not ideal)

## Step 2: Configure Rewrite Rule

**CRITICAL:** Set this in Porkbun settings:

| Setting | Value |
|---------|-------|
| **Rewrite URL Path** | `/index.html` |

OR if files are in dist/:

| Setting | Value |
|---------|-------|
| **Rewrite URL Path** | `/dist/index.html` |

## Step 3: Push Changes

```bash
git commit -m "Add built files for Porkbun deployment"
git push
```

Porkbun should automatically pull the changes.

## Step 4: Wait & Test

1. Wait 1-2 minutes for Porkbun to update
2. Clear your browser cache (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
3. Visit https://fambam.buzz
4. You should see the site!

## If Still Getting 403

### Check 1: Verify Files Exist

The repo should now have:
```
dist/
├── index.html    ← This file MUST exist
├── login.html
├── signup.html
└── _astro/
```

### Check 2: Porkbun Configuration

Most likely issue: Porkbun doesn't know to serve from `dist/`

**Solution:** You need to tell Porkbun where your files are:

#### Method 1: Set Root Directory (Preferred)
If Porkbun has this setting:
- **Root Directory:** `dist`
- **Publish Directory:** `dist`
- **Output Directory:** `dist`

#### Method 2: Move Files to Root (If Method 1 not available)
We can restructure the repo to put built files in root:

```bash
# Move dist contents to root
mv dist/* .
mv dist/_astro .
rm -rf dist/
git add -A
git commit -m "Move built files to root for Porkbun"
git push
```

Then set rewrite to: `/index.html`

### Check 3: File Permissions

Files should be readable. Check in Porkbun dashboard or via FTP:
- Directories: 755
- Files: 644

### Check 4: Index File

Porkbun might be looking for a different default file. Try accessing directly:
- https://fambam.buzz/index.html
- https://fambam.buzz/dist/index.html

If one works, that tells you where Porkbun is serving from.

## Quick Fix: Manual FTP Upload

If Git integration isn't working:

1. **Get FTP credentials** from Porkbun
2. **Connect with FTP client** (FileZilla, etc.)
3. **Upload ONLY files from `dist/` folder:**
   ```
   Local dist/index.html    → Remote /index.html
   Local dist/login.html    → Remote /login.html
   Local dist/_astro/       → Remote /_astro/
   ```
4. **Set rewrite rule** to `/index.html`
5. **Test** https://fambam.buzz

## What I've Already Done

✅ Configured Astro for static builds
✅ Built the site (`dist/` folder created)
✅ Removed `dist/` from `.gitignore`
✅ Added `dist/` to Git
✅ Created Porkbun config files (`.porkbun`, `porkbun.json`)
✅ Added `_redirects` file for SPA routing

## What You Need to Do

1. **Commit and push these changes:**
   ```bash
   git commit -m "Add built files for Porkbun"
   git push
   ```

2. **Configure Porkbun** to serve from `dist/` directory

3. **Set rewrite rule** to `/index.html` (or `/dist/index.html`)

4. **Test** the site

## Expected Result

After configuration:
- ✅ Visit https://fambam.buzz
- ✅ See login page (or auto-logged in if dev mode)
- ✅ Can navigate to /admin, /signup, etc.
- ✅ No 403 errors

## Next Steps After It Works

1. **Disable dev mode:**
   ```bash
   # Edit .env
   DEV_MODE=false
   
   # Rebuild
   npm run build
   
   # Commit
   git add dist/ .env
   git commit -m "Disable dev mode for production"
   git push
   ```

2. **Set up Supabase** (see SUPABASE_SETUP.md)

3. **Test authentication and posting**

## Need More Help?

Contact Porkbun support and ask:
- "How do I serve files from a subdirectory (dist/) instead of root?"
- "Do you support Node.js builds or do I need to commit built files?"
- "How do I configure the root/publish directory?"

---

**TL;DR:** Commit the changes and configure Porkbun to serve from the `dist/` directory, then set rewrite rule to `/index.html`.
