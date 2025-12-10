# 🔔 Notifications Implementation Guide

## Overview

This guide explains how to implement browser push notifications and email notifications for new posts on FamBam Buzz.

---

## 1. Browser Push Notifications

### What They Do:
- Show desktop/mobile notifications when someone posts
- Work even when browser tab is closed (requires service worker)
- Require user permission

### Implementation Steps:

#### A. Request Permission

Add this to `Feed.tsx`:

```typescript
useEffect(() => {
  // Request notification permission on load
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        console.log('Notifications enabled!');
      }
    });
  }
}, []);
```

#### B. Show Notifications

Update the realtime subscription in `Feed.tsx`:

```typescript
.on(
  'postgres_changes',
  { event: 'INSERT', schema: 'public', table: 'posts' },
  async (payload) => {
    const { data } = await supabase
      .from('posts')
      .select(`*, profile:profiles(*)`)
      .eq('id', payload.new.id)
      .single();

    if (data) {
      setNewPosts((prev) => [data, ...prev]);
      setNewPostsCount((prev) => prev + 1);
      
      // Show browser notification
      if (Notification.permission === 'granted' && data.user_id !== user?.id) {
        new Notification('New Post from ' + data.profile.display_name, {
          body: data.content.substring(0, 100) + (data.content.length > 100 ? '...' : ''),
          icon: data.profile.avatar_url || '/favicon.svg',
          tag: 'new-post',
          requireInteraction: false
        });
      }
    }
  }
)
```

#### C. Add Settings Toggle

Create a `NotificationSettings.tsx` component:

```typescript
import { useState, useEffect } from 'react';

export default function NotificationSettings() {
  const [enabled, setEnabled] = useState(false);
  const [permission, setPermission] = useState(Notification.permission);

  const handleToggle = async () => {
    if (permission === 'granted') {
      setEnabled(!enabled);
      localStorage.setItem('notifications_enabled', (!enabled).toString());
    } else if (permission === 'default') {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === 'granted') {
        setEnabled(true);
        localStorage.setItem('notifications_enabled', 'true');
      }
    } else {
      alert('Notifications are blocked. Enable them in your browser settings.');
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('notifications_enabled');
    setEnabled(saved === 'true');
  }, []);

  return (
    <div className="card">
      <h3>Notification Settings</h3>
      <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <input 
          type="checkbox" 
          checked={enabled && permission === 'granted'}
          onChange={handleToggle}
        />
        Enable browser notifications for new posts
      </label>
      {permission === 'denied' && (
        <p style={{ color: '#d32f2f', fontSize: '14px', marginTop: '10px' }}>
          Notifications are blocked. To enable, go to your browser settings.
        </p>
      )}
    </div>
  );
}
```

---

## 2. Email Notifications

### What They Do:
- Send email when someone posts
- Works even when not on the site
- Optional per-user setting

### Implementation Options:

#### Option A: Supabase Edge Function (Recommended)

**Pros:** Free tier includes 500K function invocations/month, runs on Supabase infrastructure

**Steps:**

1. **Create Edge Function:**

```bash
supabase functions new send-post-notification
```

2. **Function Code (`supabase/functions/send-post-notification/index.ts`):**

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { postId } = await req.json()
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Get post details
  const { data: post } = await supabase
    .from('posts')
    .select('*, profile:profiles(*)')
    .eq('id', postId)
    .single()

  // Get users with email notifications enabled
  const { data: users } = await supabase
    .from('profiles')
    .select('id, display_name, user:auth.users(email)')
    .eq('email_notifications', true)
    .neq('id', post.user_id) // Don't email the poster

  // Send emails using Resend (see below)
  for (const user of users || []) {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'FamBam Buzz <noreply@fambam.buzz>',
        to: user.user.email,
        subject: `New post from ${post.profile.display_name}`,
        html: `
          <h2>New Post on FamBam Buzz</h2>
          <p><strong>${post.profile.display_name}</strong> posted:</p>
          <p>${post.content}</p>
          <p><a href="https://fambam.buzz">View on FamBam Buzz</a></p>
        `
      })
    })
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

3. **Add Database Trigger:**

```sql
-- Add email_notifications column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT false;

-- Create function to call edge function
CREATE OR REPLACE FUNCTION notify_new_post()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://zdmyiowalhdzneftwzrb.supabase.co/functions/v1/send-post-notification',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.supabase_service_role_key') || '"}'::jsonb,
    body := json_build_object('postId', NEW.id)::jsonb
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on new post
CREATE TRIGGER on_post_created
  AFTER INSERT ON posts
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_post();
```

4. **Set Up Resend (Email Service):**
   - Sign up at https://resend.com (free: 100 emails/day, 3,000/month)
   - Get API key
   - Add to Supabase: `supabase secrets set RESEND_API_KEY=re_xxx`

#### Option B: Client-Side (Simpler, Less Reliable)

Call an API directly from the Feed component when detecting new posts. Less reliable because it only works when someone is viewing the feed.

---

## 3. User Settings UI

Add to profile page or create a settings page:

```typescript
// src/pages/settings.astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout title="Settings">
  <div id="settings-root"></div>
</BaseLayout>

<script>
  import { createRoot } from 'react-dom/client';
  import SettingsPage from '../components/SettingsPage';

  const root = document.getElementById('settings-root');
  if (root) {
    createRoot(root).render(<SettingsPage />);
  }
</script>
```

```typescript
// src/components/SettingsPage.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getCurrentUser } from '../lib/client-auth';
import NotificationSettings from './NotificationSettings';

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    const currentUser = await getCurrentUser();
    setUser(currentUser);

    const { data } = await supabase
      .from('profiles')
      .select('email_notifications')
      .eq('id', currentUser.id)
      .single();

    setEmailNotifications(data?.email_notifications || false);
    setLoading(false);
  }

  async function toggleEmailNotifications() {
    const newValue = !emailNotifications;
    setEmailNotifications(newValue);

    await supabase
      .from('profiles')
      .update({ email_notifications: newValue })
      .eq('id', user.id);
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Settings</h1>

      <NotificationSettings />

      <div className="card" style={{ marginTop: '20px' }}>
        <h3>Email Notifications</h3>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input 
            type="checkbox" 
            checked={emailNotifications}
            onChange={toggleEmailNotifications}
          />
          Send me emails when someone posts
        </label>
        <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
          You'll receive an email notification whenever a family member creates a new post.
        </p>
      </div>
    </div>
  );
}
```

---

## 4. Database Schema Updates

Run this SQL in Supabase:

```sql
-- Add notification preferences to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS browser_notifications BOOLEAN DEFAULT true;

-- Update RLS policies to allow users to update their own notification settings
-- (already covered by existing "Users can update their own profile" policy)
```

---

## 5. Costs & Limitations

### Browser Notifications:
- **Cost:** Free
- **Limitations:** 
  - User must grant permission
  - Only works when browser is open (or with service worker)
  - Some mobile browsers limit notifications

### Email Notifications:

**Resend (Recommended):**
- Free tier: 3,000 emails/month, 100/day
- Paid: $20/month for 50,000 emails
- Good: Easy setup, reliable, good deliverability

**Supabase Email (Alternative):**
- Uses your Supabase project
- Free tier: limited emails
- Good: No extra setup, integrated

---

## 6. Testing

### Browser Notifications:
1. Load the site
2. Allow notifications when prompted
3. Open in another browser/incognito
4. Post from second browser
5. Should see notification in first browser

### Email Notifications:
1. Enable email notifications in settings
2. Have another user post
3. Check your email (including spam folder)

---

## 7. Privacy Considerations

- **Browser notifications:** Don't show full post content (privacy)
- **Email notifications:** Option to disable
- **Unsubscribe link:** Add to emails
- **Respect "Do Not Disturb":** Check browser/OS settings

---

## Recommended Implementation Order:

1. **Start with browser notifications** (easier, free, immediate)
2. **Add settings toggle** (let users control)
3. **Then add email** (if family wants it)

---

## Summary

**For immediate implementation:**
- Browser notifications: ~30 minutes
- Settings UI: ~1 hour
- Total: Can be done in one session!

**For email notifications:**
- Supabase Edge Function + Resend: ~2-3 hours
- Requires: Resend account, edge function deployment
- Worth it if: Family checks email more than browser

**Best approach:** Start with browser notifications, see if family wants email too.
