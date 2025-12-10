# 🐝 Buzz the Bee Scripts

## Quick Start (Easiest Method)

**Don't want to mess with scripts?** Just create a normal account:

1. Go to https://fambam.buzz/signup.html
2. Sign up as "Buzz the Bee 🐝" with any email
3. Post announcements like normal posts
4. Done!

---

## Automated Script (Advanced)

### Prerequisites

1. **Get Supabase Service Role Key:**
   - https://app.supabase.com/project/zdmyiowalhdzneftwzrb/settings/api
   - Copy the `service_role` key (⚠️ NOT the anon key!)

2. **Add to .env:**
   ```bash
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

3. **Install (if needed):**
   ```bash
   npm install
   ```

### Usage

```bash
# Basic announcement
node scripts/buzz-announcement.js "🎉 New feature launched! Try it out!"

# Multi-line announcement
node scripts/buzz-announcement.js "🚀 Big update!

New features:
✨ Gallery navigation
❤️ Reactions
💬 Comments

Enjoy!"
```

### First Run

The script will automatically:
1. Create Buzz the Bee account (if doesn't exist)
2. Set up profile with bio
3. Post your announcement

### Example Announcements

**New Features:**
```bash
node scripts/buzz-announcement.js "🎉 New: Image Gallery!

Click any photo to view full size, then use ← → arrows to browse through multiple images!

Try it on posts with photos! 📸"
```

**Bug Fixes:**
```bash
node scripts/buzz-announcement.js "🔧 Fixed: Profile pages now loading properly!

Click anyone's name or avatar to view their profile. Let me know if you see any issues! 🐝"
```

**Tips:**
```bash
node scripts/buzz-announcement.js "💡 Tip: React with emojis!

Try clicking the + button next to Like:
❤️ Like • 🥰 Love • 😂 Laugh • 🎉 Celebrate

React away! 😊"
```

---

## Security Warning

⚠️ **Service Role Key = Full Admin Access**

- Never commit to git
- Never share publicly
- Keep .env secure
- Can create/delete any data

**Safer alternative:** Just create Buzz account manually and post normally!

---

## Troubleshooting

**"Missing credentials"**
- Check .env has `SUPABASE_SERVICE_ROLE_KEY`
- Make sure no extra spaces or quotes

**"Error creating user"**
- Buzz account might already exist
- Script will find and use existing account

**"Permission denied"**
- Make script executable: `chmod +x scripts/buzz-announcement.js`

---

## Files

- `buzz-announcement.js` - Main script
- `../BUZZ_BOT_SETUP.md` - Complete setup guide with all options
- `README.md` - This file

---

## Need Help?

See full documentation: `../BUZZ_BOT_SETUP.md`

**Recommended:** Just create Buzz account manually - it's easier and safer! 🐝
