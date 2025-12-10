# 🐝 Automated Buzz Announcements

## What This Is

Buzz the Bee automatically posts feature announcements to your family feed when you deploy updates. Your family always knows what's new!

---

## Quick Setup (One Time - 5 Minutes)

### 1. Create Buzz Account

Go to https://fambam.buzz/signup.html and create:
- **Email:** `buzz@fambam.buzz` (or any email you control)
- **Name:** `Buzz the Bee 🐝`
- **Password:** (save this!)

Then edit profile:
- **Bio:** "Your friendly family assistant! I announce new features and updates."
- **Avatar:** Upload a bee emoji or icon (optional)

### 2. Set Password in Environment

Add to your `.env` file:

```bash
BUZZ_PASSWORD=your-buzz-password-here
```

Or set as environment variable:

```bash
export BUZZ_PASSWORD="your-buzz-password-here"
```

**That's it!** Setup complete. 🎉

---

## How to Use

### Every Time You Deploy:

**1. Update CHANGELOG.md**

Add your feature announcement under `[Pending]`:

```markdown
## [Pending] 2025-01-10 - Image Gallery

🎉 New feature: Image Gallery!

Click any photo to view full size, then use ← → arrows to browse through all images.

Try it out! 📸
```

**2. Run Deployment**

```bash
# Option A: Full automated deployment (builds, commits, posts)
./scripts/deploy-with-buzz.sh

# Option B: Just post announcement (manual deployment)
node scripts/post-announcement.js
```

**3. Done!**

Buzz automatically:
- ✅ Posts announcement to family feed
- ✅ Marks as `[DEPLOYED]` in CHANGELOG
- ✅ Everyone sees what's new!

---

## Deployment Script Features

### Full Deployment (`deploy-with-buzz.sh`)

Does everything:
1. Shows pending announcements
2. Asks for confirmation
3. Builds your site
4. Commits and pushes to git
5. Posts as Buzz
6. Updates CHANGELOG

```bash
./scripts/deploy-with-buzz.sh
```

### Just Announcement (`post-announcement.js`)

If you already deployed manually:

```bash
node scripts/post-announcement.js
```

Reads `[Pending]` from CHANGELOG and posts it.

---

## CHANGELOG.md Format

```markdown
# FamBam Buzz - Changelog

## [Pending] 2025-01-10 - Short Title

Your announcement text here.
Can be multiple lines.
Use emojis! 🎉

Features:
✨ Feature 1
❤️ Feature 2

---

## [DEPLOYED] 2025-01-09 - Previous Feature

This was already announced.

---
```

**Rules:**
- One `[Pending]` section at a time
- After posting, becomes `[DEPLOYED]`
- Write like you're talking to family
- Use emojis and friendly language

---

## Example Announcements

### New Feature
```markdown
## [Pending] 2025-01-10 - Image Gallery

🎉 New feature: Image Gallery!

Click any photo in a post to view it full size, then use the ← → arrow buttons to browse through all the images!

Perfect for viewing multiple photos. Try it out! 📸
```

### Bug Fix
```markdown
## [Pending] 2025-01-10 - Profile Fix

🔧 Fixed: Profile pages now loading properly!

Click anyone's name or avatar to view their profile. Should work smoothly now!

Let me know if you see any other issues! 🐝
```

### Multiple Features
```markdown
## [Pending] 2025-01-10 - Major Update

🚀 Big update just launched!

New features:
✨ Image gallery with navigation
❤️ 4 reaction types (like, love, laugh, celebrate)
💬 Comments on posts
👤 Profile pages

Everything works on mobile too! Enjoy! 🐝
```

### Tip/Reminder
```markdown
## [Pending] 2025-01-10 - Did You Know?

💡 Tip: React with emojis!

Click the + button next to Like to see all reaction options:
❤️ Like
🥰 Love  
😂 Laugh
🎉 Celebrate

React away! 😊
```

---

## Buzz's Voice

**Keep it:**
- Friendly and warm
- Simple and clear
- Enthusiastic but natural
- Family-appropriate

**Examples:**

✅ Good:
> "🎉 New feature! Click photos to view them full size. Try it out! 📸"

❌ Too technical:
> "Implemented modal lightbox component with gallery state management."

✅ Good:
> "🔧 Fixed a bug where profiles weren't loading. Should work great now!"

❌ Too formal:
> "Resolved profile rendering exception in production environment."

---

## Troubleshooting

### "No pending announcements"

Add a `[Pending]` section to CHANGELOG.md

### "Could not log in as Buzz"

- Make sure Buzz account exists
- Check `BUZZ_PASSWORD` is correct
- Try logging in manually at fambam.buzz

### "BUZZ_PASSWORD not set"

Add to `.env`:
```bash
BUZZ_PASSWORD=your-password
```

Or run with environment variable:
```bash
BUZZ_PASSWORD="your-password" node scripts/post-announcement.js
```

### Script doesn't run

Make it executable:
```bash
chmod +x scripts/deploy-with-buzz.sh
chmod +x scripts/post-announcement.js
```

---

## Workflow Examples

### Quick Deployment

```bash
# 1. Edit your code
# 2. Add to CHANGELOG.md:

## [Pending] 2025-01-10 - New Feature
🎉 Just added... (your announcement)

# 3. Deploy
./scripts/deploy-with-buzz.sh

# Done! Buzz posts automatically.
```

### Manual Control

```bash
# 1. Build and deploy yourself
npm run build
git add -A
git commit -m "Add feature"
git push

# 2. Add announcement to CHANGELOG.md
# 3. Let Buzz announce
node scripts/post-announcement.js

# Done!
```

---

## Security Notes

**Safe:**
- ✅ Buzz is just a normal user account
- ✅ Password in .env (gitignored)
- ✅ Can only post, nothing else
- ✅ Can be changed anytime

**Don't:**
- ❌ Share Buzz password publicly
- ❌ Commit .env to git (already in .gitignore)

**If Buzz gets compromised:**
- Just change the password
- Update BUZZ_PASSWORD in .env
- Done!

---

## Tips

### Multiple Deployments

If deploying multiple times per day:

```markdown
## [Pending] 2025-01-10 - Today's Updates

Updates for today:
✨ Fixed image gallery bug
🔧 Improved mobile layout  
💬 Comment notifications

All working great now! 🐝
```

### Skip Announcement

Don't want Buzz to announce? Just don't add `[Pending]` to CHANGELOG.

Or deploy manually without running the script.

### Test Before Posting

1. Add `[Pending]` entry
2. Run: `node scripts/post-announcement.js`
3. Check feed
4. If wrong, delete post and edit CHANGELOG
5. Try again

---

## What Gets Automated

**Automated:**
- ✅ Reading CHANGELOG
- ✅ Posting to feed as Buzz
- ✅ Marking as deployed
- ✅ Git operations (with deploy script)

**You control:**
- ✏️ What to announce (CHANGELOG.md)
- ✏️ When to deploy
- ✏️ Announcement wording

---

## Summary

**One-time setup:**
1. Create Buzz account
2. Add `BUZZ_PASSWORD` to .env

**Every deployment:**
1. Add `[Pending]` to CHANGELOG.md
2. Run `./scripts/deploy-with-buzz.sh`
3. Done! Buzz announces automatically.

**Your family always knows what's new!** 🐝🎉
