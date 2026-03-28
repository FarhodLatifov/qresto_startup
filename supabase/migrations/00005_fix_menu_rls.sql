-- Fix RLS policies for categories and dishes tables
-- This allows owners to manage menu items even when restaurant has NULL owner_id

-- CATEGORIES
DROP POLICY IF EXISTS "Owners can manage categories." ON categories;

CREATE POLICY "Owners can manage categories."
  ON categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM restaurants r 
      WHERE r.id = restaurant_id 
      AND (r.owner_id IS NULL OR auth.uid() = r.owner_id)
    )
  );

-- DISHES
DROP POLICY IF EXISTS "Owners can manage dishes." ON dishes;

CREATE POLICY "Owners can manage dishes."
  ON dishes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM restaurants r 
      WHERE r.id = restaurant_id 
      AND (r.owner_id IS NULL OR auth.uid() = r.owner_id)
    )
  );

-- TABLES
DROP POLICY IF EXISTS "Owners can manage tables." ON tables;

CREATE POLICY "Owners can manage tables."
  ON tables FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM restaurants r 
      WHERE r.id = restaurant_id 
      AND (r.owner_id IS NULL OR auth.uid() = r.owner_id)
    )
  );
