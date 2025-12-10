#!/usr/bin/env node
/**
 * Post Buzz Announcement - Simple Version
 * Reads from CHANGELOG.md and posts via Buzz account
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment
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
const supabaseKey = envVars.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const BUZZ_EMAIL = envVars.BUZZ_EMAIL || 'buzz@fambam.buzz';
const BUZZ_PASSWORD = envVars.BUZZ_PASSWORD;

async function postAnnouncement() {
  // Read CHANGELOG
  const changelog = readFileSync(join(__dirname, '..', 'CHANGELOG.md'), 'utf-8');
  
  // Find [Pending] entries
  const pendingMatch = changelog.match(/## \[Pending\][^\n]*\n([\s\S]*?)(?=\n##|\n---|\Z)/);
  
  if (!pendingMatch) {
    console.log('ℹ️  No pending announcements in CHANGELOG.md');
    return;
  }

  const announcement = pendingMatch[1].trim();
  
  if (!announcement) {
    console.log('ℹ️  Pending section is empty');
    return;
  }

  console.log('\n📢 Announcement to post:');
  console.log('━'.repeat(50));
  console.log(announcement);
  console.log('━'.repeat(50));

  // Check for Buzz credentials
  if (!BUZZ_PASSWORD) {
    console.log('\n⚠️  BUZZ_PASSWORD not set in environment');
    console.log('\nTo enable automated announcements:');
    console.log('1. Create Buzz account at https://fambam.buzz/signup.html');
    console.log('2. Set environment variable:');
    console.log('   export BUZZ_PASSWORD="your-buzz-password"');
    console.log('\nOr add to .env:');
    console.log('   BUZZ_PASSWORD=your-buzz-password');
    console.log('\n📋 Copy the announcement above and post manually as Buzz');
    return;
  }

  // Authenticate as Buzz
  console.log('\n🐝 Logging in as Buzz...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: BUZZ_EMAIL,
    password: BUZZ_PASSWORD
  });

  if (authError) {
    console.error('❌ Could not log in as Buzz:', authError.message);
    console.log('\n💡 Make sure Buzz account exists and password is correct');
    console.log('   Email:', BUZZ_EMAIL);
    console.log('\n📋 Copy the announcement above and post manually');
    return;
  }

  // Post announcement
  console.log('📝 Posting announcement...');
  const { error: postError } = await supabase
    .from('posts')
    .insert({
      user_id: authData.user.id,
      content: announcement
    });

  if (postError) {
    console.error('❌ Error posting:', postError.message);
    return;
  }

  await supabase.auth.signOut();

  console.log('✅ Announcement posted successfully!');
  console.log('🎉 Your family will see it in their feed!');
  
  // Mark as deployed in CHANGELOG
  const updatedChangelog = changelog.replace(/\[Pending\]/, '[DEPLOYED]');
  const { writeFileSync } = await import('fs');
  writeFileSync(join(__dirname, '..', 'CHANGELOG.md'), updatedChangelog);
  
  console.log('\n📝 Marked as [DEPLOYED] in CHANGELOG.md');
}

postAnnouncement().catch(console.error);
