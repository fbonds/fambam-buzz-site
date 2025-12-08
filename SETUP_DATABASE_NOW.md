# 🚨 Setup Database Tables NOW

## Quick Fix for "Could not find table 'public.posts'" Error

You need to create the database tables in Supabase. This takes 2 minutes.

## Step 1: Open Supabase SQL Editor

Click this link: https://app.supabase.com/project/zdmyiowalhdzneftwzrb/sql/new

Or navigate:
1. Go to https://app.supabase.com
2. Select project: zdmyiowalhdzneftwzrb
3. Click **SQL Editor** in left sidebar
4. Click **New Query**

## Step 2: Copy and Run This SQL

Copy ALL of this SQL and paste it into the editor:

```sql
-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  media_urls TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS posts_user_id_idx ON posts(user_id);
CREATE INDEX IF NOT EXISTS posts_created_at_idx ON posts(created_at DESC);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Posts policies
CREATE POLICY "Posts are viewable by authenticated users"
  ON posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create posts"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
  ON posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
  ON posts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update posts updated_at
DROP TRIGGER IF EXISTS on_post_updated ON posts;
CREATE TRIGGER on_post_updated
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
```

## Step 3: Click "Run" Button

Click the **RUN** button (or press Ctrl+Enter / Cmd+Enter)

You should see: **"Success. No rows returned"**

## Step 4: Create Storage Bucket for Images

1. Go to: https://app.supabase.com/project/zdmyiowalhdzneftwzrb/storage/buckets
2. Click **"New bucket"**
3. Configure:
   - **Name:** `media`
   - **Public bucket:** ✓ (checked)
   - **File size limit:** 5 MB
   - **Allowed MIME types:** `image/*,video/*`
4. Click **"Create bucket"**

## Step 5: Set Storage Policies

1. Click on the **media** bucket you just created
2. Click **"New policy"**
3. Click **"For full customization"**
4. Create 3 policies:

**Policy 1: Upload**
```sql
CREATE POLICY "Users can upload media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

**Policy 2: View**
```sql
CREATE POLICY "Media is publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'media');
```

**Policy 3: Delete**
```sql
CREATE POLICY "Users can delete their own media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

## Step 6: Refresh Your Site

1. Go to: https://fambam.buzz
2. **Hard refresh:** Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
3. Log in
4. **Should work now!** ✅

## Verification

After setup, check:
- ✅ Can see the feed page (no error)
- ✅ Can create a post
- ✅ Can upload images
- ✅ Posts appear in the feed

## If Still Having Issues

### Check Tables Were Created:

Go to: https://app.supabase.com/project/zdmyiowalhdzneftwzrb/editor

You should see:
- ✅ `profiles` table
- ✅ `posts` table

### Check Existing Users Need Profiles:

Your existing user accounts need profiles created. Run this in SQL Editor:

```sql
-- Create profiles for existing users
INSERT INTO profiles (id, display_name)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'display_name', split_part(email, '@', 1))
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles);
```

## What These Tables Do

**profiles:**
- Stores user display names, avatars, bios
- Automatically created when user signs up

**posts:**
- Stores all family posts
- Links to user profiles
- Can store up to 4 image URLs per post

**Storage bucket (media):**
- Stores uploaded images/videos
- 1GB free storage
- Images automatically compressed

---

**Next:** After running the SQL, commit and push the updated build (without DEV badge).

## Summary

1. ✅ Run schema.sql in Supabase SQL Editor
2. ✅ Create "media" storage bucket
3. ✅ Set storage policies
4. ✅ Refresh site - error should be gone!

**Estimated time: 5 minutes**
