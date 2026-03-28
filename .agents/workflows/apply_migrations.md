---
description: How to safely apply database migrations
---
# Apply Supabase Migrations

Use this workflow when the user needs to update the database schema after pulling new code or creating a new feature.

1. Verify that `.env` is loaded with `VITE_SUPABASE_SERVICE_ROLE_KEY` if using the automated script.
2. Check `supabase/migrations/` for the latest SQL files.
// turbo
3. Run the automated TypeScript migration runner if available:
```bash
npx tsx apply-migrations.ts
```
4. If step 3 fails due to connection or missing env variables, instruct the user to:
   - Go to https://app.supabase.com -> SQL Editor -> New Query.
   - Copy the contents of the required `.sql` migrations.
   - Paste and click Run.
5. Verify the tables now exist or are updated properly.
