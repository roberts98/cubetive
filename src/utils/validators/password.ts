import type {
  PasswordStrengthResult,
  PasswordStrength,
} from '../../features/auth/types/auth.types';

export const validatePassword = (password: string): boolean => {
  return password.length >= 8;
};

export const calculatePasswordStrength = (password: string): PasswordStrengthResult => {
  let score = 0;
  const feedback: string[] = [];

  if (password.length >= 8) score += 25;
  if (password.length >= 12) score += 25;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 20;
  if (/\d/.test(password)) score += 15;
  if (/[^a-zA-Z0-9]/.test(password)) score += 15;

  if (password.length < 8) feedback.push('Use at least 8 characters');
  if (!/\d/.test(password)) feedback.push('Add numbers');
  if (!/[^a-zA-Z0-9]/.test(password)) feedback.push('Add special characters');

  const strength: PasswordStrength = score < 40 ? 'weak' : score < 70 ? 'medium' : 'strong';

  return { strength, score, feedback };
};
