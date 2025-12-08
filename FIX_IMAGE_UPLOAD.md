# Fix Image Upload Error

## The Problem

Error: `new row violates row-level security policy (400/406)`

This means the storage bucket policies aren't set up correctly.

## Solution: Configure Storage Bucket Policies

### Step 1: Go to Storage Policies

https://app.supabase.com/project/zdmyiowalhdzneftwzrb/storage/policies

Or navigate:
1. Go to Supabase Dashboard
2. Click **Storage** in left sidebar
3. Click **Policies** tab
4. Find the **media** bucket

### Step 2: Create 3 Policies for the "media" bucket

Click **"New policy"** for the **media** bucket, then **"For full customization"**

---

#### Policy 1: Allow Upload

**Name:** `Users can upload media`

**Policy definition:** SELECT this option: **INSERT**

**Target roles:** `authenticated`

**USING expression:** (leave empty)

**WITH CHECK expression:**
```sql
(bucket_id = 'media'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)
```

Click **Review** → **Save policy**

---

#### Policy 2: Allow Public Viewing

**Name:** `Media is publicly accessible`

**Policy definition:** SELECT this option: **SELECT**

**Target roles:** `public`

**USING expression:**
```sql
bucket_id = 'media'::text
```

**WITH CHECK expression:** (leave empty)

Click **Review** → **Save policy**

---

#### Policy 3: Allow Delete

**Name:** `Users can delete their own media`

**Policy definition:** SELECT this option: **DELETE**

**Target roles:** `authenticated`

**USING expression:**
```sql
(bucket_id = 'media'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)
```

**WITH CHECK expression:** (leave empty)

Click **Review** → **Save policy**

---

### Step 3: Verify Bucket is Public

1. Go to: https://app.supabase.com/project/zdmyiowalhdzneftwzrb/storage/buckets
2. Click on **media** bucket
3. Look for **"Public bucket"** setting
4. Make sure it's **enabled** (toggle should be ON)
5. If not, click settings and enable it

### Step 4: Test Upload Again

1. Go to https://fambam.buzz
2. Log in
3. Try uploading an image
4. Should work now! ✅

## Alternative: Quick SQL Method

If you prefer SQL, run this in SQL Editor:

```sql
-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public to view media
CREATE POLICY "Media is publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'media');

-- Allow users to delete their own media
CREATE POLICY "Users can delete their own media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

## What These Policies Do

**Policy 1 (Upload):**
- Authenticated users can upload files
- Files must go in a folder named with their user ID
- Example: `media/7eebc4d-4bf6-4ec3-a9b0-12974bbb5d01/image.jpg`

**Policy 2 (View):**
- Anyone can view images (public access)
- Needed so images display in the feed

**Policy 3 (Delete):**
- Users can only delete their own uploaded files
- Prevents users from deleting others' images

## Verification

After setting up policies, check:

1. **Upload works:** Try uploading an image to a post
2. **Image displays:** Image should show in the feed
3. **Delete works:** Can delete your own posts with images

## Common Issues

### "Policy already exists" Error

If you get this error, the policy was already created. Either:
- Delete the old policy first, OR
- Skip creating it again

### Still Getting 406/400

Check:
1. ✅ Bucket named exactly `media` (lowercase)
2. ✅ Bucket is public
3. ✅ All 3 policies created
4. ✅ User is logged in (not in dev mode)

### Upload Works But Image Doesn't Display

Check:
1. ✅ Policy 2 (SELECT/public access) is set
2. ✅ Bucket is marked as public
3. ✅ Browser console for CORS errors

## File Structure in Storage

After uploads, your storage will look like:

```
media/
├── 7eebc4d-4bf6-4ec3-a9b0-12974bbb5d01/  ← User 1's folder
│   ├── 1733599200-abc123.jpg
│   └── 1733599300-def456.png
├── 8ffcd5e-5cf7-5fd4-b0c1-23085ccc6e02/  ← User 2's folder
│   └── 1733599400-ghi789.jpg
```

Each user gets their own folder (named with their user ID).

## Summary

1. ✅ Go to Storage → Policies
2. ✅ Create 3 policies for "media" bucket
3. ✅ Ensure bucket is public
4. ✅ Test upload

**Time needed:** 3 minutes

---

After this, image uploads will work perfectly! 🎉
