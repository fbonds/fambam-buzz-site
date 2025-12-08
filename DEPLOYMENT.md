# FamBam Buzz - Deployment Guide

This guide covers how to deploy your family social network to Porkbun hosting.

## Prerequisites

- Completed Supabase setup (see SUPABASE_SETUP.md)
- Porkbun hosting account with FTP/SFTP access
- Node.js 18+ installed locally

## Step 1: Configure for Production

1. Update `.env` with your production Supabase credentials (if different):
   ```
   PUBLIC_SUPABASE_URL=https://zdmyiowalhdzneftwzrb.supabase.co
   PUBLIC_SUPABASE_ANON_KEY=sb_publishable_s6qSC7dpfmcIg7JoXWJD6Q_wM05p0Y6
   ```

2. Ensure your Supabase project is configured:
   - Database tables created (profiles, posts)
   - Storage bucket "media" created
   - Row Level Security policies enabled
   - Email authentication enabled

## Step 2: Build the Project

Run the build command:

```bash
npm run build
```

This creates a `dist/` folder with:
- `dist/client/` - Static assets (CSS, JS, images)
- `dist/server/` - Node.js server application

## Step 3: Deploy to Porkbun

### Option A: Deploy with Node.js (Recommended)

If your Porkbun hosting supports Node.js applications:

1. **Upload Files via FTP/SFTP:**
   - Upload the entire `dist/` folder
   - Upload `package.json` and `package-lock.json`
   - Upload `.env` file (or set environment variables in hosting panel)

2. **Install Dependencies on Server:**
   ```bash
   npm install --production
   ```

3. **Start the Application:**
   ```bash
   node dist/server/entry.mjs
   ```

4. **Configure Web Server:**
   - Set up reverse proxy to Node.js app (usually port 3000 or 4321)
   - Or use a process manager like PM2:
     ```bash
     npm install -g pm2
     pm2 start dist/server/entry.mjs --name fambam
     pm2 save
     pm2 startup
     ```

### Option B: Static Export (If Node.js Not Available)

If your Porkbun hosting only supports static files:

1. **Change Build Mode:**
   
   Edit `astro.config.mjs`:
   ```javascript
   export default defineConfig({
     output: 'static', // Changed from 'hybrid'
     // Remove adapter line
     integrations: [react()]
   });
   ```

2. **Note:** This approach has limitations:
   - No server-side authentication checking
   - API routes won't work (need external API)
   - Consider using Vercel, Netlify, or Railway instead (all have free tiers)

### Option C: Deploy to Alternative Hosting (Recommended)

For better performance and easier deployment, consider these free/low-cost options:

**Vercel (Recommended - Free Tier):**
```bash
npm install -g vercel
vercel
```

**Netlify (Free Tier):**
```bash
npm install -g netlify-cli
netlify deploy --prod
```

**Railway (Free Tier with Credit):**
```bash
npm install -g @railway/cli
railway login
railway up
```

All three support:
- Automatic Node.js deployment
- Environment variables
- HTTPS by default
- Zero-downtime deployments

## Step 4: Configure DNS

1. Log in to Porkbun DNS management
2. Point your domain to your hosting:
   - **For Porkbun hosting:** Create an A record to their server IP
   - **For Vercel/Netlify:** Create a CNAME record to their provided domain

Example DNS records:
```
Type: A
Host: @
Answer: [Your hosting IP]

Type: CNAME
Host: www
Answer: [Your hosting domain]
```

## Step 5: Set Up HTTPS

1. **Porkbun Hosting:** Enable SSL in their control panel
2. **Vercel/Netlify/Railway:** Automatic HTTPS included

## Step 6: Environment Variables on Server

Make sure these environment variables are set on your production server:

```
PUBLIC_SUPABASE_URL=https://zdmyiowalhdzneftwzrb.supabase.co
PUBLIC_SUPABASE_ANON_KEY=sb_publishable_s6qSC7dpfmcIg7JoXWJD6Q_wM05p0Y6
NODE_ENV=production
```

## Step 7: Test Your Deployment

1. Visit your domain
2. Create a test account
3. Create a test post with an image
4. Verify image uploads to Supabase Storage
5. Test on mobile devices

## Monitoring & Maintenance

### Check Storage Usage

1. Visit Supabase Dashboard: https://app.supabase.com/project/zdmyiowalhdzneftwzrb
2. Go to Settings > Storage
3. Monitor database and storage usage

### Regular Maintenance

- Visit `/admin` page to view statistics
- Use cleanup tools to delete old posts if storage gets full
- Monitor Supabase free tier limits (500MB database, 1GB storage)

## Troubleshooting

### Images Not Uploading
- Check Supabase Storage bucket is public
- Verify storage policies are set correctly
- Check browser console for errors

### Authentication Not Working
- Verify environment variables are set correctly
- Check Supabase project URL and anon key
- Enable email authentication in Supabase dashboard

### Site Performance
- Images are automatically compressed before upload
- Posts are limited to 50 per page
- Consider enabling Supabase CDN for faster image loading

## Upgrading Supabase (When Needed)

If you exceed free tier limits:

**Supabase Pro ($25/month):**
- 8 GB database
- 100 GB storage
- 50 GB bandwidth
- Better performance

## Backup Strategy

Your data is automatically backed up by Supabase (7-day backups on Pro plan).

For additional safety:
1. Export posts regularly via SQL Editor
2. Download important media from Supabase Storage
3. Keep a backup of your `.env` file

## Cost Summary

**Current Setup (Free):**
- Supabase: Free tier (500MB DB + 1GB storage)
- Porkbun hosting: $48/year (your existing hosting)

**Recommended Upgrade Path:**
- Vercel/Netlify/Railway: Free tier (better than Porkbun for Node.js)
- Supabase Pro: $25/month (only when you need more storage)

## Support

- Supabase Documentation: https://supabase.com/docs
- Astro Documentation: https://docs.astro.build
- Porkbun Support: https://porkbun.com/support
