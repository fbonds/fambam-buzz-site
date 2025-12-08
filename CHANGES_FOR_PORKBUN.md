# Changes Made for Porkbun Static Hosting

## Summary

Your FamBam Buzz site has been reconfigured from a **Node.js server application** to a **static Single-Page Application (SPA)** that works with Porkbun Secure Static Hosting.

## Major Changes

### 1. Build Configuration

**Before (Node.js):**
```javascript
export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  integrations: [react()]
});
```

**After (Static SPA):**
```javascript
export default defineConfig({
  output: 'static',
  integrations: [react()],
  build: { format: 'file' }
});
```

### 2. Authentication System

**Before:** Server-side authentication with cookies and API routes
**After:** Client-side authentication with Supabase SDK

- Removed all `/api/*` routes
- Created `client-auth.ts` for client-side auth
- Login/signup now happen entirely in the browser
- Auth state managed by Supabase client library

### 3. Data Fetching

**Before:** Server-side data fetching at build/request time
**After:** Client-side data fetching with React hooks

- All pages now load data in the browser using `useEffect`
- Posts and profiles fetched after page load
- Better for user-specific data and real-time updates

### 4. File Structure Changes

**Removed:**
- `src/pages/api/` - All API endpoints
- `src/pages/profile/[id].astro` - Dynamic profile routes
- `src/middleware/` - Server middleware
- `vercel.json` - Vercel configuration
- `DEPLOYMENT.md` - Old deployment guide

**Added:**
- `src/lib/client-auth.ts` - Client-side auth functions
- `src/components/AuthGuard.tsx` - Auth protection component
- `src/components/LoginForm.tsx` - Client-side login
- `src/components/SignupForm.tsx` - Client-side signup
- `src/components/Feed.tsx` - Client-side feed loading
- `public/_redirects` - SPA routing configuration
- `PORKBUN_DEPLOYMENT.md` - Porkbun deployment guide
- `CHANGES_FOR_PORKBUN.md` - This file

**Modified:**
- `astro.config.mjs` - Changed to static output
- `src/pages/index.astro` - Now uses client-side Feed component
- `src/pages/login.astro` - Uses client-side LoginForm
- `src/pages/signup.astro` - Uses client-side SignupForm
- All documentation files - Removed Vercel references

### 5. Build Output

**Before:**
```
dist/
├── server/          # Node.js server files
│   └── entry.mjs
└── client/          # Static assets
    └── _astro/
```

**After:**
```
dist/
├── index.html           # Main entry point
├── login.html
├── signup.html
├── admin.html
├── profile.html
└── _astro/              # JS and CSS bundles
    ├── client-auth.*.js
    ├── Feed.*.js
    └── ...
```

## How It Works Now

### 1. Initial Load

1. User visits `https://fambam.buzz`
2. Porkbun serves `index.html`
3. Browser downloads JavaScript bundles
4. React components initialize
5. Client-side auth check happens
6. If not logged in, redirect to `/login.html`

### 2. Navigation

1. User clicks link (e.g., to `/admin`)
2. Browser requests `/admin` from server
3. Porkbun rewrite rule catches it: returns `/index.html`
4. JavaScript reads the URL and loads appropriate component
5. No full page reload needed

### 3. Authentication

1. User submits login form
2. JavaScript calls `supabase.auth.signInWithPassword()`
3. Supabase returns session tokens
4. Tokens stored in browser's localStorage
5. Page redirects to feed
6. Feed component checks auth and loads data

### 4. Data Loading

1. Component mounts (e.g., Feed)
2. `useEffect` runs
3. Checks authentication
4. Fetches data from Supabase
5. Updates component state
6. React re-renders with data

## Key Differences

| Aspect | Before (Node.js) | After (Static SPA) |
|--------|------------------|-------------------|
| **Server** | Required | Not needed |
| **Auth** | Server-side cookies | Client-side tokens |
| **Data** | Fetched at build/request | Fetched in browser |
| **Routes** | Server renders | Browser handles |
| **Hosting** | Needs Node.js | Any static host |
| **Deployment** | Complex | Simple (FTP upload) |
| **Performance** | Server rendering | CDN cached |

## Benefits of Static Approach

✅ **Simpler hosting** - Works with Porkbun static hosting
✅ **Faster CDN delivery** - All files cached at edge
✅ **Lower costs** - No server to run
✅ **Better security** - No server to attack
✅ **Easier deployment** - Just upload files
✅ **Better scaling** - CDN handles traffic

## Trade-offs

⚠️ **Slower initial auth** - Client needs to check auth after load
⚠️ **More JavaScript** - Auth logic runs in browser
⚠️ **SEO considerations** - Content loads after JS (not an issue for private family site)
⚠️ **No API routes** - Can't have custom server endpoints (don't need them with Supabase)

## Dev Mode Still Works

Dev mode (`DEV_MODE=true` in `.env`) works the same way:
- Auto-logs you in without database
- Shows mock data
- Great for testing UI locally

## Testing the Static Build

```bash
# Build
npm run build

# Preview locally
npm run preview

# Visit http://localhost:4321
```

## Deploying to Porkbun

1. **Build the site:**
   ```bash
   npm run build
   ```

2. **Upload `dist/` contents via FTP**

3. **Configure Porkbun:**
   - Set **Rewrite URL Path** to: `/index.html`
   - Enable HTTPS

4. **Test:**
   - Visit https://fambam.buzz
   - Try logging in
   - Create a post

## Files to Upload

Upload ALL files from `dist/` directory:
```
index.html
login.html
signup.html
admin.html
profile.html
favicon.svg
_astro/
  ├── client-auth.[hash].js
  ├── Feed.[hash].js
  ├── LoginForm.[hash].js
  ├── SignupForm.[hash].js
  └── [other files]
```

## Important: Rewrite Rule

**This is critical for SPA routing to work!**

In Porkbun's Secure Static Hosting settings:

| Setting | Value |
|---------|-------|
| **Rewrite URL Path** | `/index.html` |

This tells Porkbun: "For any URL that doesn't match a file, serve index.html instead"

Without this, refreshing the page or direct links won't work.

## Environment Variables

Note: `.env` file is NOT uploaded. The environment variables are embedded at build time into the JavaScript bundles.

Your Supabase credentials are public-safe (anon key is meant to be public).

## Next Steps

1. Review `PORKBUN_DEPLOYMENT.md` for detailed deployment steps
2. Build the site: `npm run build`
3. Upload to Porkbun via FTP/SFTP
4. Configure rewrite rule
5. Test at https://fambam.buzz

## Questions?

- Static vs Node.js: See above comparison table
- Deployment help: See `PORKBUN_DEPLOYMENT.md`
- Authentication: Uses Supabase client library
- Dev mode: See `DEV_MODE.md`

---

🎉 **Ready to deploy!** Your site is now configured for Porkbun Static Hosting.
