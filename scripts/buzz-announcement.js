#!/usr/bin/env node
/**
 * Buzz the Bee - Feature Announcement Bot
 * 
 * Posts feature announcements to the family feed
 * Usage: node scripts/buzz-announcement.js "Your announcement message"
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const envPath = join(__dirname, '..', '.env');
const envContent = readFileSync(envPath, 'utf-8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    envVars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
  }
});

const supabaseUrl = envVars.PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY; // Need service role key for this

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.error('Need: PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const BUZZ_EMAIL = 'buzz@fambam.buzz';
const BUZZ_NAME = 'Buzz the Bee 🐝';
const BUZZ_BIO = 'Your friendly family social network assistant! I announce new features and updates.';

async function getOrCreateBuzzAccount() {
  // Check if Buzz account exists
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('display_name', BUZZ_NAME)
    .single();

  if (existingProfile) {
    console.log('✅ Buzz account found:', existingProfile.id);
    return existingProfile.id;
  }

  console.log('📝 Creating Buzz the Bee account...');

  // Create auth user for Buzz
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: BUZZ_EMAIL,
    password: Math.random().toString(36).slice(-16), // Random password, won't be used
    email_confirm: true,
    user_metadata: {
      display_name: BUZZ_NAME,
      is_bot: true
    }
  });

  if (authError) {
    console.error('❌ Error creating Buzz auth user:', authError);
    process.exit(1);
  }

  // Update profile with bio (profile created automatically by trigger)
  await supabase
    .from('profiles')
    .update({ 
      bio: BUZZ_BIO,
      avatar_url: null // Could upload a bee emoji as avatar
    })
    .eq('id', authData.user.id);

  console.log('✅ Buzz account created:', authData.user.id);
  return authData.user.id;
}

async function postAnnouncement(message, images = []) {
  const buzzId = await getOrCreateBuzzAccount();

  console.log('\n📢 Posting announcement...');
  console.log('Message:', message);

  const { data, error } = await supabase
    .from('posts')
    .insert({
      user_id: buzzId,
      content: message,
      media_urls: images.length > 0 ? images : null
    })
    .select()
    .single();

  if (error) {
    console.error('❌ Error posting announcement:', error);
    process.exit(1);
  }

  console.log('✅ Announcement posted successfully!');
  console.log('Post ID:', data.id);
  console.log('\n🎉 Your family will see this announcement in their feed!');
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(`
🐝 Buzz the Bee - Feature Announcement Bot

Usage:
  node scripts/buzz-announcement.js "Your message here"
  node scripts/buzz-announcement.js "Message" "image1.jpg" "image2.jpg"

Examples:
  node scripts/buzz-announcement.js "🎉 New feature: Image gallery navigation! Click any photo to view full size, then use arrow buttons to browse through multiple images."

  node scripts/buzz-announcement.js "🚀 Just deployed real-time updates! New posts appear instantly with a blue banner - no need to refresh!"

Note: Requires SUPABASE_SERVICE_ROLE_KEY in .env file
  `);
  process.exit(0);
}

const [message, ...images] = args;
await postAnnouncement(message, images);
