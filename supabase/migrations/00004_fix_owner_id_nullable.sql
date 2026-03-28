-- Fix owner_id to allow NULL for initial setup
-- This allows creating the first restaurant before authentication is set up

-- Drop the NOT NULL constraint on owner_id
ALTER TABLE restaurants 
  ALTER COLUMN owner_id DROP NOT NULL;

-- Update RLS policies to handle NULL owner_id
DROP POLICY IF EXISTS "Users can insert their own restaurants." ON restaurants;
DROP POLICY IF EXISTS "Users can update their own restaurants." ON restaurants;

CREATE POLICY "Users can insert their own restaurants."
  ON restaurants FOR INSERT
  WITH CHECK (auth.uid() = owner_id OR owner_id IS NULL);

CREATE POLICY "Users can update their own restaurants."
  ON restaurants FOR UPDATE
  USING (auth.uid() = owner_id OR owner_id IS NULL);

-- Keep delete policy strict for security
-- Only owners can delete their restaurants
