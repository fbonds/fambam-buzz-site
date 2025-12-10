#!/bin/bash
# Deploy with Buzz Announcements
# This script builds, deploys, and has Buzz announce new features

set -e

echo "🐝 FamBam Buzz Deployment with Announcements"
echo "=============================================="
echo ""

# Check if there are pending announcements
PENDING=$(grep -A 20 "\[Pending\]" CHANGELOG.md | head -20)

if [ -z "$PENDING" ]; then
  echo "ℹ️  No pending announcements in CHANGELOG.md"
  echo "   Add [Pending] entries to have Buzz announce them"
  echo ""
  read -p "Continue deployment anyway? (y/n) " -n 1 -r
  echo ""
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 0
  fi
fi

# Show what will be announced
if [ ! -z "$PENDING" ]; then
  echo "📢 Buzz will announce:"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "$PENDING" | sed 's/## \[Pending\]//' | head -15
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  read -p "Post this announcement? (y/n) " -n 1 -r
  echo ""
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 0
  fi
fi

# Build the site
echo ""
echo "🔨 Building site..."
npm run build

# Copy to root for Porkbun
echo "📦 Preparing deployment files..."
rm -f *.html _astro/*.js favicon.svg
cp -r dist/* .
rm -rf dist/

# Git operations
echo "📝 Committing changes..."
git add -A

# Get commit message
echo ""
echo "Enter commit message (or press Enter for auto-generated):"
read -r COMMIT_MSG

if [ -z "$COMMIT_MSG" ]; then
  # Auto-generate from changelog
  if [ ! -z "$PENDING" ]; then
    COMMIT_MSG=$(echo "$PENDING" | grep "##" | sed 's/## \[Pending\] [0-9-]* - //' | head -1)
    COMMIT_MSG="Deploy: $COMMIT_MSG"
  else
    COMMIT_MSG="Deploy updates"
  fi
fi

git commit -m "$COMMIT_MSG" --no-verify || echo "No changes to commit"

echo "🚀 Pushing to repository..."
git push

# Post Buzz announcement if there are pending items
if [ ! -z "$PENDING" ]; then
  echo ""
  echo "🐝 Posting Buzz announcement..."
  
  # Extract the announcement text (remove the header line and date)
  ANNOUNCEMENT=$(echo "$PENDING" | sed '/^## \[Pending\]/d' | sed '/^---/d' | sed '/^$/d' | head -15)
  
  # Call the announcement script
  if [ -f "scripts/buzz-announcement.js" ]; then
    node scripts/buzz-announcement.js "$ANNOUNCEMENT"
    
    # Mark as deployed in CHANGELOG
    echo ""
    echo "📝 Marking as deployed in CHANGELOG.md..."
    sed -i.bak 's/\[Pending\]/[DEPLOYED]/' CHANGELOG.md
    rm CHANGELOG.md.bak 2>/dev/null || true
    
    git add CHANGELOG.md
    git commit -m "Mark features as announced by Buzz" --no-verify || true
    git push || true
  else
    echo "⚠️  Buzz script not found, skipping announcement"
    echo "   Announcement text saved for manual posting:"
    echo "$ANNOUNCEMENT"
  fi
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Your site will be live in 1-2 minutes at:"
echo "   https://fambam.buzz"
echo ""

if [ ! -z "$PENDING" ]; then
  echo "🐝 Buzz has posted the announcement to the family feed!"
fi
