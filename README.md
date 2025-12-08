# 🐝 FamBam Buzz

A private family social network where family members can share updates, photos, and stay connected.

## Features

- **Personal Profiles**: Each family member has their own profile with avatar and bio
- **Shared Feed**: See all family posts in one chronological feed
- **Photo Sharing**: Upload and share photos with automatic compression
- **Private & Secure**: Family-only access with email authentication
- **Storage Smart**: Images stored on Supabase (free 1GB), not your hosting
- **Auto Cleanup**: Admin tools to manage storage and delete old posts
- **Mobile Friendly**: Responsive design works on all devices

## Tech Stack

- **Astro**: Modern web framework with minimal JavaScript
- **Supabase**: Backend database, authentication, and storage
- **React**: Interactive components (post composer)
- **Node.js**: Server-side rendering and API routes

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed instructions.

Quick steps:
1. Create tables by running SQL in Supabase dashboard
2. Create "media" storage bucket
3. Enable email authentication

### 3. Configure Environment

The `.env` file is already configured with your Supabase credentials:

```
PUBLIC_SUPABASE_URL=https://zdmyiowalhdzneftwzrb.supabase.co
PUBLIC_SUPABASE_ANON_KEY=sb_publishable_s6qSC7dpfmcIg7JoXWJD6Q_wM05p0Y6
```

### 4. Run Development Server

```bash
npm run dev
```

Visit http://localhost:4321

### 5. Create Your First Account

1. Go to `/signup`
2. Create an account with your email
3. Sign in and start posting!

## Project Structure

```
/
├── src/
│   ├── pages/
│   │   ├── index.astro          # Main feed
│   │   ├── login.astro          # Login page
│   │   ├── signup.astro         # Signup page
│   │   ├── admin.astro          # Storage management
│   │   ├── profile/
│   │   │   ├── [id].astro       # View profile
│   │   │   └── edit.astro       # Edit profile
│   │   └── api/                 # API endpoints
│   ├── components/
│   │   ├── PostCard.astro       # Post display
│   │   └── PostComposer.tsx     # Post creation (React)
│   ├── layouts/
│   │   └── BaseLayout.astro     # Page layout
│   └── lib/
│       ├── supabase.ts          # Supabase client
│       └── auth.ts              # Auth helpers
├── supabase/
│   ├── schema.sql               # Database schema
│   └── storage-setup.sql        # Storage policies
└── public/                      # Static assets
```

## Commands

| Command | Action |
|---------|--------|
| `npm install` | Install dependencies |
| `npm run dev` | Start dev server at localhost:4321 |
| `npm run build` | Build for production to `./dist/` |
| `npm run preview` | Preview production build |

## Storage Management

- Images are automatically compressed before upload (saves ~70% space)
- Max 4 images per post, 5MB per image
- Total free storage: 1GB on Supabase
- Use `/admin` page to monitor and cleanup old posts
- Automatically deletes media when posts are deleted

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

**Recommended:** Deploy to Vercel, Netlify, or Railway (all free tiers support Node.js):

```bash
# Vercel (easiest)
npm install -g vercel
vercel

# Netlify
npm install -g netlify-cli
netlify deploy --prod
```

## Security Notes

- ⚠️ **Never commit** `.env` file to git (already in .gitignore)
- ⚠️ Only use the **anon/publishable key** in frontend code
- ⚠️ Never expose your Supabase **service role key**
- Row Level Security (RLS) protects all data access
- Authentication required for all features

## Cost Breakdown

**Free Tier:**
- Supabase: 500MB database + 1GB storage + 5GB bandwidth
- Vercel/Netlify: Unlimited hosting
- **Total: $0/month**

**When You Outgrow Free Tier:**
- Supabase Pro: $25/month (8GB database + 100GB storage)

## Support & Documentation

- [Supabase Documentation](https://supabase.com/docs)
- [Astro Documentation](https://docs.astro.build)
- [Setup Guide](./SUPABASE_SETUP.md)
- [Deployment Guide](./DEPLOYMENT.md)

## License

MIT - Feel free to use for your own family!

---

Built with ❤️ for families who want to stay connected.
