/**
 * Test User Credentials
 *
 * Contains credentials for test users used in E2E tests.
 *
 * - TEST_USER: Permanent test user for authenticated session reuse
 * - TEST_USERS: Collection of test users for different scenarios
 */

export const TEST_USER = {
  id: process.env.E2E_USERNAME_ID || '',
  email: process.env.E2E_USERNAME || '',
  password: process.env.E2E_PASSWORD || '',
  username: 'e2e_test_user',
};

/**
 * Collection of test users for different test scenarios
 */
export const TEST_USERS = {
  /**
   * Primary test user (preserved across test runs)
   */
  standard: TEST_USER,

  /**
   * Generate a new user with unique email for registration tests
   * Uses timestamp to ensure uniqueness across parallel test runs
   */
  generateNewUser: () => ({
    email: `e2e-test-${Date.now()}@cubetive.test`,
    username: `e2e_user_${Date.now()}`,
    password: 'TestPassword123!',
  }),

  /**
   * Invalid credentials for negative testing
   */
  invalid: {
    email: 'nonexistent@cubetive.test',
    password: 'WrongPassword123!',
  },

  /**
   * Invalid format credentials for validation testing
   */
  invalidFormat: {
    email: 'not-an-email',
    password: 'weak',
    username: 'ab', // Too short
  },
};

/**
 * Validation constants (should match auth.constants.ts)
 */
export const AUTH_VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,
};
