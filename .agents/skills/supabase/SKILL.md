---
name: Supabase Database Management
description: Skill for modifying and managing Supabase schemas, migrations, and RLS policies in the restaurant startup project.
---

# Supabase Management Skill

## Context
This project uses Supabase as the primary backend. Schema changes must be correctly synced, and RLS (Row Level Security) policies are heavily used to isolate restaurant menus, orders, and admin privileges.

## Workflow for Database Changes
1. **Understand Request**: Determine what tables, columns, or RLS policies need changing.
2. **Create Migration**: Write a new SQL migration file in `supabase/migrations/` or add to an existing pending file.
3. **Write Safe SQL**:
   - Use `CREATE TABLE IF NOT EXISTS ...`
   - Use `ALTER TABLE ... ADD COLUMN IF NOT EXISTS ...`
   - For RLS, use `DROP POLICY IF EXISTS ... ON ...; CREATE POLICY ...`
4. **Apply Migration**: 
   - Ask the user to run it via CLI: `npx tsx apply-migrations.ts`
   - OR instruct them to copy the SQL payload into the Supabase SQL Editor.
5. **Update TypeScript Types**: If the schema changed, update any related TypeScript interfaces to ensure perfect type sync between frontend and database.

## RLS Rules Best Practices
- **Guests**: Can read public objects (e.g., `is_active = true`), can insert into `orders` but only with specific conditions (e.g., `status = pending`).
- **Admins**: Require explicit logic or role checking to update all orders or fetch sensitive company analytics. Verify that owner IDs match properly.
