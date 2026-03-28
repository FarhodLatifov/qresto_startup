-- Update RLS policies for restaurants table to allow initial setup
-- Run this in Supabase SQL Editor if you already have the initial schema

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert their own restaurants." ON restaurants;
DROP POLICY IF EXISTS "Users can update their own restaurants." ON restaurants;

-- Create new policies that allow NULL owner_id for initial setup
CREATE POLICY "Users can insert their own restaurants."
  ON restaurants FOR INSERT
  WITH CHECK (auth.uid() = owner_id OR owner_id IS NULL);

CREATE POLICY "Users can update their own restaurants."
  ON restaurants FOR UPDATE
  USING (auth.uid() = owner_id OR owner_id IS NULL);

-- Note: Delete policy still requires owner_id to match auth.uid()
-- This is intentional for security
