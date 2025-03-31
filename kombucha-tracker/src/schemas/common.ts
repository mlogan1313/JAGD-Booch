import { z } from 'zod';

// Base schemas for common types
export const timestampSchema = z.number();
export const uidSchema = z.string().min(1);

// Base metadata schema (Used by Equipment, Container, potentially others)
export const BaseMetadataSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  createdBy: uidSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema
}); 