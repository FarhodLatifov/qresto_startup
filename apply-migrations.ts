import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables. Please add VITE_SUPABASE_SERVICE_ROLE_KEY to your .env file');
  console.log('\n📝 You can find your service role key at:');
  console.log('   https://app.supabase.com/project/_/settings/api\n');
  process.exit(1);
}

// Create admin client (service role)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigrations() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║  Applying Database Migrations              ║');
  console.log('╚════════════════════════════════════════════╝\n');

  const migrationFiles = [
    './supabase/migrations/00001_initial_schema.sql',
    './supabase/migrations/00002_add_reservations.sql'
  ];

  let allSuccess = true;

  for (const migrationPath of migrationFiles) {
    if (!fs.existsSync(migrationPath)) {
      console.error(`❌ Migration file not found: ${migrationPath}`);
      continue;
    }

    const sql = fs.readFileSync(migrationPath, 'utf-8');
    const fileName = migrationPath.split('/').pop();
    
    console.log(`📄 Applying ${fileName}...`);
    
    try {
      // Execute the migration using Supabase API
      const { error } = await supabase.rpc('exec_sql', { sql });
      
      if (error) {
        if (error.message.includes('Unknown function') || error.message.includes('exec_sql')) {
          console.log('⚠️  Direct SQL execution via RPC not available.\n');
          showManualInstructions(sql);
          allSuccess = false;
          break;
        }
        throw error;
      }

      console.log(`✅ ${fileName} applied successfully!\n`);
    } catch (error: any) {
      console.error(`❌ ${fileName} failed:`, error.message);
      showManualInstructions(sql);
      allSuccess = false;
    }
  }

  return allSuccess;
}

function showManualInstructions(sql: string) {
  console.log('\n📋 You can apply this migration manually:\n');
  console.log('1. Go to: https://app.supabase.com');
  console.log('2. Select your project');
  console.log('3. Go to SQL Editor');
  console.log('4. Create new query with the SQL from migration files\n');
}

// Run migration
applyMigrations().then(success => {
  if (success) {
    console.log('✨ All done! Your database schema is up to date.\n');
    process.exit(0);
  } else {
    console.log('\n⚠️  Migration requires manual intervention.\n');
    process.exit(1);
  }
});
