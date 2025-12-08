# 🚀 Quick Reference Card

## Essential Commands

```bash
# Development
npm run dev              # Start dev server at localhost:4321

# Production
npm run build            # Build for deployment
npm run preview          # Test production build locally

# Deployment
vercel                   # Deploy to Vercel (easiest)
netlify deploy --prod    # Deploy to Netlify
```

## Important URLs

**Local Development:**
- Main site: http://localhost:4321
- Login: http://localhost:4321/login
- Signup: http://localhost:4321/signup
- Admin: http://localhost:4321/admin

**Supabase Dashboard:**
- Project: https://app.supabase.com/project/zdmyiowalhdzneftwzrb
- SQL Editor: https://app.supabase.com/project/zdmyiowalhdzneftwzrb/sql
- Storage: https://app.supabase.com/project/zdmyiowalhdzneftwzrb/storage/buckets
- Auth: https://app.supabase.com/project/zdmyiowalhdzneftwzrb/auth/users

## Project Structure (Key Files)

```
src/
├── pages/
│   ├── index.astro              # Main feed
│   ├── login.astro              # Login
│   ├── signup.astro             # Signup
│   ├── admin.astro              # Admin dashboard
│   └── profile/[id].astro       # User profiles
├── components/
│   ├── PostCard.astro           # Display posts
│   └── PostComposer.tsx         # Create posts (React)
└── lib/
    ├── supabase.ts              # Supabase client
    └── auth.ts                  # Auth helpers

supabase/
├── schema.sql                   # Database setup
└── storage-setup.sql            # Storage policies
```

## Supabase Setup (One-Time)

1. **Database Tables:**
   ```
   Dashboard → SQL Editor → Run schema.sql
   ```

2. **Storage Bucket:**
   ```
   Dashboard → Storage → Create bucket "media"
   Set: Public, 5MB limit, image/video types
   ```

3. **Storage Policies:**
   ```
   Storage → media → Policies → Run storage-setup.sql
   ```

## Features Overview

| Feature | Route | Access |
|---------|-------|--------|
| Main Feed | `/` | Auth required |
| Login | `/login` | Public |
| Signup | `/signup` | Public |
| Profile View | `/profile/:id` | Auth required |
| Edit Profile | `/profile/edit` | Auth required |
| Admin Dashboard | `/admin` | Auth required |

## Database Schema

**profiles:**
- id, display_name, avatar_url, bio, created_at

**posts:**
- id, user_id, content, media_urls[], created_at, updated_at

## Environment Variables

In `.env`:
```bash
PUBLIC_SUPABASE_URL=https://zdmyiowalhdzneftwzrb.supabase.co
PUBLIC_SUPABASE_ANON_KEY=sb_publishable_s6qSC7dpfmcIg7JoXWJD6Q_wM05p0Y6
```

## Common Issues & Quick Fixes

**"Missing environment variables"**
→ Verify `.env` file exists in project root

**"Failed to create post"**
→ Check database tables created with schema.sql

**"Image upload failed"**
→ Verify storage bucket "media" exists and is public

**Build fails**
→ `rm -rf node_modules && npm install && npm run build`

**Can't sign up**
→ Check email auth enabled in Supabase Dashboard → Auth → Providers

## Storage Limits

**Free Tier (Supabase):**
- Database: 500 MB
- Storage: 1 GB
- Bandwidth: 5 GB/month

**Tips:**
- Images auto-compressed (~70% savings)
- Use Admin page to cleanup old posts
- Upgrade to Pro when needed ($25/mo)

## Security Checklist

✅ `.env` in `.gitignore` (never commit secrets)
✅ Row Level Security enabled on all tables
✅ Only anon key in frontend (never service role key)
✅ HTTP-only cookies for auth tokens
✅ File upload restrictions (5MB, image/video only)

## Testing Checklist

Before deploying:
- [ ] Sign up works
- [ ] Login/logout works
- [ ] Create post with text
- [ ] Upload images (1-4)
- [ ] Edit profile
- [ ] View other profiles
- [ ] Delete own post
- [ ] Admin dashboard shows stats
- [ ] Test on mobile

## Deployment Quick Start

**Vercel (Recommended):**
```bash
npm install -g vercel
vercel login
vercel
# Add environment variables when prompted
```

**Set domain:** Vercel Dashboard → Settings → Domains

## Key Dependencies

- `astro` - Web framework
- `@supabase/supabase-js` - Database & auth
- `@astrojs/react` - Interactive components
- `browser-image-compression` - Image optimization

## Documentation Files

- `README.md` - Project overview
- `NEXT_STEPS.md` - Setup guide (start here!)
- `SUPABASE_SETUP.md` - Detailed database setup
- `DEPLOYMENT.md` - Deployment options
- `PROJECT_SUMMARY.md` - Technical details

## Support

**Stuck?** Check these in order:
1. `NEXT_STEPS.md` for setup steps
2. Browser console for errors
3. Supabase logs in dashboard
4. Verify environment variables set

## Performance Tips

- Images compressed automatically
- Posts limited to 50 per page
- Storage buckets use CDN
- Static assets cached

## Upgrade Path

**When you outgrow free tier:**

Supabase Pro ($25/mo):
- 8 GB database
- 100 GB storage
- Better performance

## Key Features

✅ Secure authentication
✅ Personal profiles
✅ Photo sharing (auto-compressed)
✅ Family feed
✅ Admin tools
✅ Mobile responsive
✅ Storage management

---

**Ready to launch?** → Follow `NEXT_STEPS.md`

**Need details?** → See `PROJECT_SUMMARY.md`

**Deploying?** → Check `DEPLOYMENT.md`
