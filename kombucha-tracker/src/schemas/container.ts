import { z } from 'zod';
import { timestampSchema, uidSchema, BaseMetadataSchema } from './common';

// Enums
export const ContainerTypeEnum = z.enum(['BOTTLE', 'KEG', 'OTHER']);
export const ContainerStatusEnum = z.enum(['EMPTY', 'FILLED', 'DIRTY']);

// Schema
export const ContainerSchema = z.object({
  id: z.string(),
  metadata: BaseMetadataSchema.extend({
    type: ContainerTypeEnum,
    capacity: z.number()
  }),
  status: z.object({
    current: ContainerStatusEnum,
    lastUpdated: timestampSchema,
    currentBatchId: z.string().optional(),
    fillDate: timestampSchema.optional(),
    emptyDate: timestampSchema.optional()
  })
});

// Type export
export type Container = z.infer<typeof ContainerSchema>; 