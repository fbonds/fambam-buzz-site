# Supabase Setup Instructions

Follow these steps to configure your Supabase project:

## 1. Create Database Tables

1. Go to your Supabase Dashboard: https://app.supabase.com/project/zdmyiowalhdzneftwzrb
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the contents of `supabase/schema.sql` and paste it into the editor
5. Click **Run** to execute the SQL

This will create:
- `profiles` table (user profiles)
- `posts` table (user posts)
- Row Level Security policies
- Automatic triggers for profile creation and timestamp updates

## 2. Create Storage Bucket

### Option A: Via Dashboard (Recommended)
1. Navigate to **Storage** in the left sidebar
2. Click **Create a new bucket**
3. Configure:
   - **Name**: `media`
   - **Public bucket**: ✓ (checked)
   - **File size limit**: 5 MB
   - **Allowed MIME types**: `image/*,video/*`
4. Click **Create bucket**

### Option B: Via SQL
1. In the SQL Editor, create a new query
2. Paste the contents of `supabase/storage-setup.sql`
3. Click **Run**

## 3. Configure Storage Policies

If you created the bucket via Dashboard, add these policies:

1. Go to **Storage** > **Policies** tab
2. Click **New Policy** for the `media` bucket
3. Create three policies using the SQL from `storage-setup.sql`:
   - "Users can upload media" (INSERT)
   - "Media is publicly accessible" (SELECT)
   - "Users can delete their own media" (DELETE)

## 4. Enable Email Authentication

1. Navigate to **Authentication** > **Providers**
2. Enable **Email** provider (should be enabled by default)
3. Configure email templates (optional):
   - Go to **Authentication** > **Email Templates**
   - Customize the signup confirmation email

## 5. Test Database Connection

Run this query in SQL Editor to verify setup:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check storage bucket
SELECT * FROM storage.buckets WHERE name = 'media';
```

## 6. Get Your API Keys (Already Done)

Your credentials are already in `.env`:
- Project URL: https://zdmyiowalhdzneftwzrb.supabase.co
- Anon Key: sb_publishable_s6qSC7dpfmcIg7JoXWJD6Q_wM05p0Y6

⚠️ **Security Note**: Never commit your service role key to git. Only use the anon key in frontend code.

## Optional: Storage Monitoring

To monitor storage usage, you can create a function:

```sql
CREATE OR REPLACE FUNCTION get_storage_usage()
RETURNS TABLE (
  bucket_name TEXT,
  total_size_mb NUMERIC,
  file_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bucket_id::TEXT,
    ROUND(SUM(COALESCE((metadata->>'size')::BIGINT, 0))::NUMERIC / 1024 / 1024, 2),
    COUNT(*)
  FROM storage.objects
  GROUP BY bucket_id;
END;
$$ LANGUAGE plpgsql;
```

Then query it with: `SELECT * FROM get_storage_usage();`
