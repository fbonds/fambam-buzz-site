-- FamBam Buzz - New Features Schema
-- Run this in Supabase SQL Editor after the main schema.sql

-- Add last_visit tracking to profiles for notification badge
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_visit TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create post_reactions table for likes/reactions
CREATE TABLE IF NOT EXISTS post_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reaction_type TEXT DEFAULT 'like' CHECK (reaction_type IN ('like', 'love', 'laugh', 'celebrate')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id) -- One reaction per user per post
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS post_reactions_post_id_idx ON post_reactions(post_id);
CREATE INDEX IF NOT EXISTS post_reactions_user_id_idx ON post_reactions(user_id);
CREATE INDEX IF NOT EXISTS comments_post_id_idx ON comments(post_id);
CREATE INDEX IF NOT EXISTS comments_user_id_idx ON comments(user_id);
CREATE INDEX IF NOT EXISTS comments_created_at_idx ON comments(created_at DESC);

-- Enable Row Level Security
ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Post Reactions Policies
CREATE POLICY "Anyone can view reactions"
  ON post_reactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can add reactions"
  ON post_reactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own reactions"
  ON post_reactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Comments Policies
CREATE POLICY "Anyone can view comments"
  ON comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can add comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update comment updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_comment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for comment updates
DROP TRIGGER IF EXISTS on_comment_updated ON comments;
CREATE TRIGGER on_comment_updated
  BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_comment_updated_at();

-- Function to get reaction counts for a post
CREATE OR REPLACE FUNCTION get_reaction_counts(post_uuid UUID)
RETURNS TABLE(reaction_type TEXT, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT pr.reaction_type, COUNT(*)::BIGINT
  FROM post_reactions pr
  WHERE pr.post_id = post_uuid
  GROUP BY pr.reaction_type;
END;
$$ LANGUAGE plpgsql;

-- Function to get comment count for a post
CREATE OR REPLACE FUNCTION get_comment_count(post_uuid UUID)
RETURNS BIGINT AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM comments WHERE post_id = post_uuid);
END;
$$ LANGUAGE plpgsql;
