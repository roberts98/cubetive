import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  registerSchema,
  resetPasswordRequestSchema,
  updatePasswordSchema,
  verifyEmailCodeSchema,
} from './auth.schemas';

describe('Auth Schemas', () => {
  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: true,
      };

      const result = loginSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should accept rememberMe as false', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false,
      };

      const result = loginSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should reject missing email', () => {
      const invalidData = {
        password: 'password123',
        rememberMe: true,
      };

      const result = loginSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        const emailError = result.error.issues.find((e) => e.path[0] === 'email');
        expect(emailError).toBeDefined();
      }
    });

    it('should reject empty email', () => {
      const invalidData = {
        email: '',
        password: 'password123',
        rememberMe: true,
      };

      const result = loginSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        const emailError = result.error.issues.find((e) => e.path[0] === 'email');
        expect(emailError).toBeDefined();
      }
    });

    it('should reject invalid email format', () => {
      const invalidData = {
        email: 'not-an-email',
        password: 'password123',
        rememberMe: true,
      };

      const result = loginSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Please enter a valid email address');
      }
    });

    it('should reject missing password', () => {
      const invalidData = {
        email: 'test@example.com',
        rememberMe: true,
      };

      const result = loginSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        const passwordError = result.error.issues.find((e) => e.path[0] === 'password');
        expect(passwordError).toBeDefined();
      }
    });

    it('should reject empty password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '',
        rememberMe: true,
      };

      const result = loginSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        const passwordError = result.error.issues.find((e) => e.path[0] === 'password');
        expect(passwordError).toBeDefined();
      }
    });

    it('should not enforce minimum password length on login', () => {
      const validData = {
        email: 'test@example.com',
        password: 'short',
        rememberMe: false,
      };

      const result = loginSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });
  });

  describe('registerSchema', () => {
    it('should validate correct registration data', () => {
      const validData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        confirmPassword: 'password123',
      };

      const result = registerSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should accept username with underscores and hyphens', () => {
      const validData = {
        email: 'test@example.com',
        username: 'test_user-123',
        password: 'password123',
        confirmPassword: 'password123',
      };

      const result = registerSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should accept minimum length username (3 chars)', () => {
      const validData = {
        email: 'test@example.com',
        username: 'abc',
        password: 'password123',
        confirmPassword: 'password123',
      };

      const result = registerSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should accept maximum length username (30 chars)', () => {
      const validData = {
        email: 'test@example.com',
        username: 'a'.repeat(30),
        password: 'password123',
        confirmPassword: 'password123',
      };

      const result = registerSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should reject username shorter than 3 characters', () => {
      const invalidData = {
        email: 'test@example.com',
        username: 'ab',
        password: 'password123',
        confirmPassword: 'password123',
      };

      const result = registerSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Username must be at least 3 characters');
      }
    });

    it('should reject username longer than 30 characters', () => {
      const invalidData = {
        email: 'test@example.com',
        username: 'a'.repeat(31),
        password: 'password123',
        confirmPassword: 'password123',
      };

      const result = registerSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Username must be at most 30 characters');
      }
    });

    it('should reject username with special characters', () => {
      const invalidData = {
        email: 'test@example.com',
        username: 'user@name',
        password: 'password123',
        confirmPassword: 'password123',
      };

      const result = registerSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'Username can only contain letters, numbers, _ and -'
        );
      }
    });

    it('should reject username with spaces', () => {
      const invalidData = {
        email: 'test@example.com',
        username: 'user name',
        password: 'password123',
        confirmPassword: 'password123',
      };

      const result = registerSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'Username can only contain letters, numbers, _ and -'
        );
      }
    });

    it('should reject missing email', () => {
      const invalidData = {
        username: 'testuser',
        password: 'password123',
        confirmPassword: 'password123',
      };

      const result = registerSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        const emailError = result.error.issues.find((e) => e.path[0] === 'email');
        expect(emailError).toBeDefined();
      }
    });

    it('should reject invalid email format', () => {
      const invalidData = {
        email: 'invalid-email',
        username: 'testuser',
        password: 'password123',
        confirmPassword: 'password123',
      };

      const result = registerSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Please enter a valid email address');
      }
    });

    it('should reject password shorter than 8 characters', () => {
      const invalidData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'short',
        confirmPassword: 'short',
      };

      const result = registerSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        const passwordError = result.error.issues.find((e) => e.path[0] === 'password');
        expect(passwordError?.message).toBe('Password must be at least 8 characters');
      }
    });

    it('should reject missing password', () => {
      const invalidData = {
        email: 'test@example.com',
        username: 'testuser',
        confirmPassword: 'password123',
      };

      const result = registerSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        const passwordError = result.error.issues.find((e) => e.path[0] === 'password');
        expect(passwordError).toBeDefined();
      }
    });

    it('should reject missing confirmPassword', () => {
      const invalidData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      };

      const result = registerSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        const confirmError = result.error.issues.find((e) => e.path[0] === 'confirmPassword');
        expect(confirmError).toBeDefined();
      }
    });

    it('should reject non-matching passwords', () => {
      const invalidData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        confirmPassword: 'different123',
      };

      const result = registerSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        const confirmError = result.error.issues.find((e) => e.path[0] === 'confirmPassword');
        expect(confirmError?.message).toBe('Passwords do not match');
      }
    });

    it('should accept exactly 8 character password', () => {
      const validData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'pass1234',
        confirmPassword: 'pass1234',
      };

      const result = registerSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });
  });

  describe('resetPasswordRequestSchema', () => {
    it('should validate correct reset password request', () => {
      const validData = {
        email: 'test@example.com',
      };

      const result = resetPasswordRequestSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should reject missing email', () => {
      const invalidData = {};

      const result = resetPasswordRequestSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        const emailError = result.error.issues.find((e) => e.path[0] === 'email');
        expect(emailError).toBeDefined();
      }
    });

    it('should reject empty email', () => {
      const invalidData = {
        email: '',
      };

      const result = resetPasswordRequestSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        const emailError = result.error.issues.find((e) => e.path[0] === 'email');
        expect(emailError).toBeDefined();
      }
    });

    it('should reject invalid email format', () => {
      const invalidData = {
        email: 'not-an-email',
      };

      const result = resetPasswordRequestSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Please enter a valid email address');
      }
    });
  });

  describe('updatePasswordSchema', () => {
    it('should validate correct password update', () => {
      const validData = {
        password: 'newPassword123',
        confirmPassword: 'newPassword123',
      };

      const result = updatePasswordSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should reject password shorter than 8 characters', () => {
      const invalidData = {
        password: 'short',
        confirmPassword: 'short',
      };

      const result = updatePasswordSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        const passwordError = result.error.issues.find((e) => e.path[0] === 'password');
        expect(passwordError?.message).toBe('Password must be at least 8 characters');
      }
    });

    it('should reject missing password', () => {
      const invalidData = {
        confirmPassword: 'password123',
      };

      const result = updatePasswordSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        const passwordError = result.error.issues.find((e) => e.path[0] === 'password');
        expect(passwordError).toBeDefined();
      }
    });

    it('should reject missing confirmPassword', () => {
      const invalidData = {
        password: 'password123',
      };

      const result = updatePasswordSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        const confirmError = result.error.issues.find((e) => e.path[0] === 'confirmPassword');
        expect(confirmError).toBeDefined();
      }
    });

    it('should reject non-matching passwords', () => {
      const invalidData = {
        password: 'password123',
        confirmPassword: 'different123',
      };

      const result = updatePasswordSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        const confirmError = result.error.issues.find((e) => e.path[0] === 'confirmPassword');
        expect(confirmError?.message).toBe('Passwords do not match');
      }
    });
  });

  describe('verifyEmailCodeSchema', () => {
    it('should validate correct verification code', () => {
      const validData = {
        email: 'test@example.com',
        code: '123456',
      };

      const result = verifyEmailCodeSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should accept all numeric 6-digit codes', () => {
      const validData = {
        email: 'test@example.com',
        code: '000000',
      };

      const result = verifyEmailCodeSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should reject missing code', () => {
      const invalidData = {
        email: 'test@example.com',
      };

      const result = verifyEmailCodeSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        const codeError = result.error.issues.find((e) => e.path[0] === 'code');
        expect(codeError).toBeDefined();
      }
    });

    it('should reject empty code', () => {
      const invalidData = {
        email: 'test@example.com',
        code: '',
      };

      const result = verifyEmailCodeSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        const codeError = result.error.issues.find((e) => e.path[0] === 'code');
        expect(codeError).toBeDefined();
      }
    });

    it('should reject code shorter than 6 digits', () => {
      const invalidData = {
        email: 'test@example.com',
        code: '12345',
      };

      const result = verifyEmailCodeSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Verification code must be 6 digits');
      }
    });

    it('should reject code longer than 6 digits', () => {
      const invalidData = {
        email: 'test@example.com',
        code: '1234567',
      };

      const result = verifyEmailCodeSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Verification code must be 6 digits');
      }
    });

    it('should reject code with letters', () => {
      const invalidData = {
        email: 'test@example.com',
        code: '12345a',
      };

      const result = verifyEmailCodeSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Verification code must contain only numbers');
      }
    });

    it('should reject code with special characters', () => {
      const invalidData = {
        email: 'test@example.com',
        code: '12345!',
      };

      const result = verifyEmailCodeSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Verification code must contain only numbers');
      }
    });

    it('should reject missing email', () => {
      const invalidData = {
        code: '123456',
      };

      const result = verifyEmailCodeSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        const emailError = result.error.issues.find((e) => e.path[0] === 'email');
        expect(emailError).toBeDefined();
      }
    });

    it('should reject invalid email format', () => {
      const invalidData = {
        email: 'invalid-email',
        code: '123456',
      };

      const result = verifyEmailCodeSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Please enter a valid email address');
      }
    });
  });
});
