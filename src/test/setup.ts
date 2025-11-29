import { expect, afterEach, vi, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';

// Suppress React 19 act() warnings for async effects
// These are expected when testing hooks with immediate async execution
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    const message = typeof args[0] === 'string' ? args[0] : '';
    if (
      message.includes('An update to TestComponent inside a test was not wrapped in act') ||
      message.includes('Warning: ReactDOM.render')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Extend Vitest matchers if needed
expect.extend({});
