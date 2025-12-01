/**
 * Authentication Check Utilities
 *
 * Helpers to verify if the test environment is properly configured for auth tests.
 * Use these to conditionally skip tests that require a valid, confirmed test user.
 */

import { TEST_USER } from './test-users';

/**
 * Check if test user environment variables are configured
 */
export const hasTestUserCredentials = (): boolean => {
  return Boolean(TEST_USER.email && TEST_USER.password && TEST_USER.id);
};

/**
 * Skip reason message for tests requiring authenticated user
 */
export const SKIP_REASON_AUTH =
  'Test requires a valid, email-confirmed test user in the test database. ' +
  'Ensure E2E_USERNAME, E2E_PASSWORD, and E2E_USERNAME_ID are set in .env.test ' +
  'and the user exists with confirmed email in your test Supabase instance.';

/**
 * Skip reason message for tests requiring clean database state
 */
export const SKIP_REASON_DB =
  'Test requires proper database setup and teardown. ' +
  'Ensure VITE_SUPABASE_SERVICE_ROLE_KEY is set in .env.test.';
