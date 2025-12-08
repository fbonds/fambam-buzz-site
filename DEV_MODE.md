# Development Mode

To make local development easier without needing to set up email verification, the app includes a **Dev Mode** feature.

## How It Works

When `DEV_MODE=true` is set in `.env`, the app:

✅ **Bypasses authentication** - No login/signup required
✅ **Logs you in automatically** as a dev user (Fletcher)
✅ **Shows dev indicators** - Yellow "DEV" badge in header
✅ **Works without database** - Uses mock profile data
✅ **Displays warnings** - Reminds you posts won't save

## Configuration

Edit `.env`:

```bash
# Dev mode - bypass authentication (DO NOT USE IN PRODUCTION!)
DEV_MODE=true
DEV_USER_ID=fletcher-dev-id
DEV_USER_NAME=Fletcher
```

## Using Dev Mode

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Visit http://localhost:4321**
   - You'll be automatically logged in as Fletcher
   - No need to create an account or verify email

3. **Test the UI:**
   - View the feed
   - Try the post composer (won't actually save)
   - Browse pages and navigation

## Limitations in Dev Mode

⚠️ **Posts won't be saved** - Database writes are skipped
⚠️ **No real images** - File uploads won't persist
⚠️ **Mock profile** - Profile data is hard-coded
⚠️ **No other users** - Can't see or interact with real users

## Disabling Dev Mode

To use the real authentication system:

1. **Set up Supabase** (see `SUPABASE_SETUP.md`)

2. **Disable dev mode in `.env`:**
   ```bash
   DEV_MODE=false
   ```

3. **Restart the server:**
   ```bash
   # Stop with Ctrl+C, then:
   npm run dev
   ```

4. **Create a real account** at `/signup`

## Production Safety

🔒 **Dev mode automatically disables in production** when you build and deploy:

```bash
npm run build  # DEV_MODE won't affect production build
```

The `.env` file is never deployed (it's in `.gitignore`), so production deployments always use real authentication.

## Visual Indicators

When dev mode is active, you'll see:

- 🛠️ Yellow "DEV" badge in header
- Warning banner on feed page
- Message on login page
- All indicating dev mode is active

## Files Modified for Dev Mode

- `.env` - Dev mode configuration
- `src/lib/dev-auth.ts` - Dev mode utilities
- `src/lib/auth.ts` - Authentication bypass logic
- `src/pages/index.astro` - Dev mode warnings
- `src/pages/login.astro` - Dev mode indicator
- `src/layouts/BaseLayout.astro` - DEV badge

## Troubleshooting

**Still seeing login page?**
- Check `.env` has `DEV_MODE=true`
- Restart dev server with `Ctrl+C` then `npm run dev`

**Want to test real auth?**
- Set `DEV_MODE=false` in `.env`
- Complete Supabase setup
- Restart server

---

**Ready to go live?** Set `DEV_MODE=false` and follow `DEPLOYMENT.md`!
