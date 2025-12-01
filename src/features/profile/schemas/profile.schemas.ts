import { z } from 'zod';

/**
 * Schema for profile visibility update form
 */
export const profileVisibilitySchema = z.object({
  profile_visibility: z.boolean(),
});

export type ProfileVisibilityFormData = z.infer<typeof profileVisibilitySchema>;
