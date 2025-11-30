import { describe, it, expect } from 'vitest';
import { calculatePasswordStrength } from './password';

describe('calculatePasswordStrength', () => {
  describe('weak passwords', () => {
    it('should classify empty password as weak', () => {
      const result = calculatePasswordStrength('');

      expect(result.strength).toBe('weak');
      expect(result.score).toBe(0);
      expect(result.feedback).toContain('Use at least 8 characters');
      expect(result.feedback).toContain('Add numbers');
      expect(result.feedback).toContain('Add special characters');
    });

    it('should classify short password as weak', () => {
      const result = calculatePasswordStrength('pass');

      expect(result.strength).toBe('weak');
      expect(result.score).toBeLessThan(40);
      expect(result.feedback).toContain('Use at least 8 characters');
    });

    it('should classify 7-char password as weak', () => {
      const result = calculatePasswordStrength('pass123');

      expect(result.strength).toBe('weak');
      expect(result.score).toBeLessThan(40);
      expect(result.feedback).toContain('Use at least 8 characters');
    });

    it('should classify 8-char lowercase-only password as weak', () => {
      const result = calculatePasswordStrength('password');

      expect(result.strength).toBe('weak');
      expect(result.score).toBe(25); // Only length >= 8
      expect(result.feedback).toContain('Add numbers');
      expect(result.feedback).toContain('Add special characters');
    });

    it('should classify 8-char password with mixed case as medium', () => {
      const result = calculatePasswordStrength('Password');

      expect(result.strength).toBe('medium');
      expect(result.score).toBe(45); // 25 (length>=8) + 20 (mixed case)
      expect(result.feedback).toContain('Add numbers');
      expect(result.feedback).toContain('Add special characters');
    });
  });

  describe('medium strength passwords', () => {
    it('should classify 8-char password with mixed case and numbers as medium', () => {
      const result = calculatePasswordStrength('Pass1234');

      expect(result.strength).toBe('medium');
      expect(result.score).toBe(60); // 25 (length>=8) + 20 (mixed case) + 15 (numbers)
      expect(result.feedback).toContain('Add special characters');
      expect(result.feedback).not.toContain('Use at least 8 characters');
      expect(result.feedback).not.toContain('Add numbers');
    });

    it('should classify 8-char password with lowercase and numbers as medium', () => {
      const result = calculatePasswordStrength('pass1234');

      expect(result.strength).toBe('medium');
      expect(result.score).toBe(40); // 25 (length>=8) + 15 (numbers)
      expect(result.feedback).toContain('Add special characters');
    });

    it('should classify 12-char lowercase password as medium', () => {
      const result = calculatePasswordStrength('passwordlong');

      expect(result.strength).toBe('medium');
      expect(result.score).toBe(50); // 25 (length>=8) + 25 (length>=12)
      expect(result.feedback).toContain('Add numbers');
      expect(result.feedback).toContain('Add special characters');
    });

    it('should classify 12-char password with numbers as medium', () => {
      const result = calculatePasswordStrength('password1234');

      expect(result.strength).toBe('medium');
      expect(result.score).toBe(65); // 25 (>=8) + 25 (>=12) + 15 (numbers)
      expect(result.feedback).toContain('Add special characters');
    });
  });

  describe('strong passwords', () => {
    it('should classify password with all criteria as strong', () => {
      const result = calculatePasswordStrength('Password123!');

      expect(result.strength).toBe('strong');
      expect(result.score).toBe(100); // 25+25+20+15+15
      expect(result.feedback).toHaveLength(0);
    });

    it('should classify 12-char password with mixed case and numbers as strong', () => {
      const result = calculatePasswordStrength('Password1234');

      expect(result.strength).toBe('strong');
      expect(result.score).toBe(85); // 25+25+20+15
      expect(result.feedback).toContain('Add special characters');
    });

    it('should classify 12-char password with mixed case and special chars as strong', () => {
      const result = calculatePasswordStrength('Password!@#$');

      expect(result.strength).toBe('strong');
      expect(result.score).toBe(85); // 25+25+20+15
      expect(result.feedback).toContain('Add numbers');
    });

    it('should classify very long password with minimal complexity as medium', () => {
      const result = calculatePasswordStrength('passwordverylongtext12');

      expect(result.strength).toBe('medium');
      expect(result.score).toBe(65); // 25+25+15
      expect(result.feedback).toContain('Add special characters');
    });

    it('should handle multiple special characters', () => {
      const result = calculatePasswordStrength('Pass123!@#$%');

      expect(result.strength).toBe('strong');
      expect(result.score).toBe(100);
      expect(result.feedback).toHaveLength(0);
    });

    it('should handle spaces as special characters', () => {
      const result = calculatePasswordStrength('Pass 123 Word');

      expect(result.strength).toBe('strong');
      expect(result.score).toBe(100);
      expect(result.feedback).toHaveLength(0);
    });
  });

  describe('score calculation', () => {
    it('should add 25 points for length >= 8', () => {
      const short = calculatePasswordStrength('passwor'); // 7 chars
      const long = calculatePasswordStrength('password'); // 8 chars

      expect(long.score - short.score).toBe(25);
    });

    it('should add additional 25 points for length >= 12', () => {
      const medium = calculatePasswordStrength('password123'); // 11 chars
      const long = calculatePasswordStrength('password1234'); // 12 chars

      // Both have length>=8 and numbers, but long also has length>=12
      expect(long.score - medium.score).toBe(25);
    });

    it('should add 20 points for mixed case', () => {
      const lower = calculatePasswordStrength('password');
      const mixed = calculatePasswordStrength('Password');

      expect(mixed.score - lower.score).toBe(20);
    });

    it('should add 15 points for numbers', () => {
      const noNumbers = calculatePasswordStrength('password');
      const withNumbers = calculatePasswordStrength('password1');

      expect(withNumbers.score - noNumbers.score).toBe(15);
    });

    it('should add 15 points for special characters', () => {
      const noSpecial = calculatePasswordStrength('password');
      const withSpecial = calculatePasswordStrength('password!');

      expect(withSpecial.score - noSpecial.score).toBe(15);
    });

    it('should calculate maximum score of 100', () => {
      const result = calculatePasswordStrength('MyP@ssw0rd123!');

      expect(result.score).toBe(100);
    });

    it('should calculate minimum score of 0', () => {
      const result = calculatePasswordStrength('');

      expect(result.score).toBe(0);
    });
  });

  describe('feedback generation', () => {
    it('should provide no feedback for strong password with all criteria', () => {
      const result = calculatePasswordStrength('MyP@ssw0rd123!');

      expect(result.feedback).toHaveLength(0);
    });

    it('should suggest adding length when password is short', () => {
      const result = calculatePasswordStrength('Pass1!');

      expect(result.feedback).toContain('Use at least 8 characters');
    });

    it('should suggest adding numbers when missing', () => {
      const result = calculatePasswordStrength('Password!');

      expect(result.feedback).toContain('Add numbers');
    });

    it('should suggest adding special characters when missing', () => {
      const result = calculatePasswordStrength('Password123');

      expect(result.feedback).toContain('Add special characters');
    });

    it('should provide all feedback when password is very weak', () => {
      const result = calculatePasswordStrength('pass');

      expect(result.feedback).toHaveLength(3);
      expect(result.feedback).toContain('Use at least 8 characters');
      expect(result.feedback).toContain('Add numbers');
      expect(result.feedback).toContain('Add special characters');
    });

    it('should not mention mixed case in feedback (bonus feature)', () => {
      const result = calculatePasswordStrength('password');

      // Mixed case is not required, just a bonus
      expect(result.feedback).not.toContain('mixed case');
      expect(result.feedback).not.toContain('uppercase');
      expect(result.feedback).not.toContain('lowercase');
    });
  });

  describe('edge cases', () => {
    it('should handle single character', () => {
      const result = calculatePasswordStrength('a');

      expect(result.strength).toBe('weak');
      expect(result.score).toBeLessThan(40);
    });

    it('should handle very long password', () => {
      const longPassword = 'a'.repeat(100);
      const result = calculatePasswordStrength(longPassword);

      expect(result.strength).toBe('medium');
      expect(result.score).toBe(50); // Both length bonuses
    });

    it('should handle password with only numbers', () => {
      const result = calculatePasswordStrength('12345678');

      expect(result.strength).toBe('medium');
      expect(result.score).toBe(40);
      expect(result.feedback).toContain('Add special characters');
    });

    it('should handle password with only special characters', () => {
      const result = calculatePasswordStrength('!@#$%^&*');

      expect(result.strength).toBe('medium');
      expect(result.score).toBe(40);
      expect(result.feedback).toContain('Add numbers');
    });

    it('should handle unicode characters as special characters', () => {
      const result = calculatePasswordStrength('Password123★');

      expect(result.strength).toBe('strong');
      expect(result.score).toBe(100);
    });

    it('should treat uppercase-only password correctly', () => {
      const result = calculatePasswordStrength('PASSWORD');

      expect(result.strength).toBe('weak');
      expect(result.score).toBe(25); // Only length bonus (>=8), no mixed case (needs both upper AND lower)
    });

    it('should handle password with mixed numbers and letters', () => {
      const result = calculatePasswordStrength('p1a2s3s4w5o6r7d8');

      expect(result.strength).toBe('medium');
      expect(result.score).toBe(65); // 25 (>=8) + 25 (>=12) + 15 (numbers)
    });
  });

  describe('real-world password examples', () => {
    it('should rate "password" as weak', () => {
      const result = calculatePasswordStrength('password');

      expect(result.strength).toBe('weak');
    });

    it('should rate "Password123" as medium', () => {
      const result = calculatePasswordStrength('Password123');

      expect(result.strength).toBe('medium');
      expect(result.score).toBe(60); // 25 (>=8) + 20 (mixed) + 15 (numbers)
    });

    it('should rate "P@ssw0rd!" as strong', () => {
      const result = calculatePasswordStrength('P@ssw0rd!');

      expect(result.strength).toBe('strong');
      expect(result.score).toBe(75);
    });

    it('should rate "MySecureP@ssw0rd2024" as strong', () => {
      const result = calculatePasswordStrength('MySecureP@ssw0rd2024');

      expect(result.strength).toBe('strong');
      expect(result.score).toBe(100);
      expect(result.feedback).toHaveLength(0);
    });

    it('should rate "12345678" as medium', () => {
      const result = calculatePasswordStrength('12345678');

      expect(result.strength).toBe('medium');
    });

    it('should rate "qwerty123" as medium', () => {
      const result = calculatePasswordStrength('qwerty123');

      expect(result.strength).toBe('medium');
      expect(result.score).toBe(40); // 25 (>=8) + 15 (numbers)
    });
  });

  describe('strength thresholds', () => {
    it('should classify score < 40 as weak', () => {
      // score = 25 (length>=8)
      const result = calculatePasswordStrength('password');

      expect(result.score).toBe(25);
      expect(result.strength).toBe('weak');
    });

    it('should classify score = 40 as medium', () => {
      // score = 40 (25 + 15)
      const result = calculatePasswordStrength('password123');

      expect(result.score).toBe(40);
      expect(result.strength).toBe('medium');
    });

    it('should classify score = 69 as medium', () => {
      // score = 65 (25+25+15)
      const result = calculatePasswordStrength('passwordlong1234');

      expect(result.score).toBe(65);
      expect(result.strength).toBe('medium');
    });

    it('should classify score = 70 as strong', () => {
      // score = 75 (25+20+15+15)
      const result = calculatePasswordStrength('Password1!');

      expect(result.score).toBe(75);
      expect(result.strength).toBe('strong');
    });

    it('should classify score = 100 as strong', () => {
      const result = calculatePasswordStrength('Password123!');

      expect(result.score).toBe(100);
      expect(result.strength).toBe('strong');
    });
  });
});
