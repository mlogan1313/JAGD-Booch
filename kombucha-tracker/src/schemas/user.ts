import { z } from 'zod';
import { timestampSchema } from './common';

// Enums
export const UserRoleSchema = z.enum(['admin', 'brewer', 'viewer']);

// Schema
export const UserProfileSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  email: z.string().email(),
  role: UserRoleSchema,
  isActive: z.boolean(),
  createdBy: z.string(),
  createdAt: timestampSchema,
  lastLogin: timestampSchema.nullish(),
  deactivatedAt: timestampSchema.nullish()
});

// Type export
export type UserProfile = z.infer<typeof UserProfileSchema>; 