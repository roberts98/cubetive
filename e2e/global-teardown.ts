/**
 * Global Teardown for E2E Tests
 *
 * This script runs AFTER all E2E tests complete and performs a complete
 * database cleanup of the test Supabase project.
 *
 * Strategy:
 * - Uses Supabase service role key to bypass RLS policies
 * - Deletes all data from auth.users (cascades to profiles and solves)
 * - Preserves the permanent test user for next run
 * - Runs only in test environment (safety check)
 *
 * Safety:
 * - Requires VITE_SUPABASE_SERVICE_ROLE_KEY in .env.test
 * - Verifies we're in test environment before deleting
 * - Preserves test user specified by E2E_USERNAME_ID
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

async function globalTeardown() {
  console.log('\n🧹 Starting E2E test teardown...\n');

  // Get environment variables
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
  const preserveUserId = process.env.E2E_USERNAME_ID;

  // Validate required environment variables
  if (!supabaseUrl) {
    throw new Error('VITE_SUPABASE_URL is not set in .env.test');
  }

  if (!supabaseServiceKey) {
    throw new Error(
      'VITE_SUPABASE_SERVICE_ROLE_KEY is not set in .env.test. ' +
        'Get this from Supabase dashboard: Settings > API > service_role key'
    );
  }

  // Safety check: Ensure we're using test environment
  if (!supabaseUrl.includes('lvtrctlpyqqrluszjxpb')) {
    throw new Error(
      `Safety check failed: VITE_SUPABASE_URL does not match test project.\n` +
        `Expected test project URL, got: ${supabaseUrl}\n` +
        `Aborting teardown to prevent accidental deletion of production data.`
    );
  }

  // Create Supabase admin client with service role key
  // Service role bypasses RLS policies, allowing us to delete all data
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    // Step 1: Delete ALL solves (including preserved user's test data)
    // We want a clean slate for test data, even for the permanent test user
    console.log('📊 Deleting all solve records...');
    const { error: solvesError, count: solvesCount } = await supabase
      .from('solves')
      .delete({ count: 'exact' })
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Match all records

    if (solvesError) {
      console.error('❌ Error deleting solves:', solvesError.message);
    } else {
      console.log(`✅ Deleted ${solvesCount || 0} solve records`);
    }

    // Step 2: Reset preserved user's profile to default state
    // Keep the profile record but reset statistics and modifications
    if (preserveUserId) {
      console.log('🔄 Resetting preserved user profile to default state...');
      const { error: resetError } = await supabase
        .from('profiles')
        .update({
          total_solves: 0,
          pb_single: null,
          pb_single_date: null,
          pb_single_scramble: null,
          pb_ao5: null,
          pb_ao5_date: null,
          pb_ao12: null,
          pb_ao12_date: null,
          profile_visibility: false,
        })
        .eq('id', preserveUserId);

      if (resetError) {
        console.error('❌ Error resetting profile:', resetError.message);
      } else {
        console.log('✅ Reset preserved user profile to defaults');
      }
    }

    // Step 3: Delete all OTHER user profiles (users created during tests)
    console.log('👤 Deleting test user profiles...');
    const { error: profilesError, count: profilesCount } = await supabase
      .from('profiles')
      .delete({ count: 'exact' })
      .neq('id', preserveUserId || '00000000-0000-0000-0000-000000000000');

    if (profilesError) {
      console.error('❌ Error deleting profiles:', profilesError.message);
    } else {
      console.log(`✅ Deleted ${profilesCount || 0} profile records`);
    }

    // Step 4: Delete all auth users (except preserved user)
    // This is the critical step - deletes users from auth.users
    // CASCADE will automatically delete associated profiles and solves
    console.log('🔐 Deleting test auth users...');

    // Get all users except the preserved test user
    const { data: users, error: fetchError } = await supabase.auth.admin.listUsers();

    if (fetchError) {
      throw new Error(`Failed to fetch users: ${fetchError.message}`);
    }

    let deletedCount = 0;
    const errors: string[] = [];

    for (const user of users.users) {
      // Skip the preserved test user
      if (user.id === preserveUserId) {
        console.log(`⏭️  Skipping preserved test user: ${user.email}`);
        continue;
      }

      // Delete the user
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);

      if (deleteError) {
        errors.push(`Failed to delete user ${user.email}: ${deleteError.message}`);
      } else {
        deletedCount++;
        console.log(`  ✓ Deleted user: ${user.email}`);
      }
    }

    if (errors.length > 0) {
      console.error('\n❌ Errors during user deletion:');
      errors.forEach((err) => console.error(`  - ${err}`));
    }

    console.log(`✅ Deleted ${deletedCount} auth users`);

    // Summary
    console.log('\n✨ Teardown complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Summary:');
    console.log(`  • Solves deleted: ${solvesCount || 0}`);
    console.log(`  • Profiles deleted: ${profilesCount || 0}`);
    console.log(`  • Auth users deleted: ${deletedCount}`);
    if (preserveUserId) {
      console.log(`  • Preserved test user: ${preserveUserId}`);
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } catch (error) {
    console.error('\n❌ Teardown failed with error:');
    console.error(error);
    throw error;
  }
}

export default globalTeardown;

// Run teardown if executed directly (not imported)
if (import.meta.url === `file://${process.argv[1]}`) {
  globalTeardown().catch((error) => {
    console.error('Teardown failed:', error);
    process.exit(1);
  });
}
