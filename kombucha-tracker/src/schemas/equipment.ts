import { z } from 'zod';
import { timestampSchema, uidSchema, BaseMetadataSchema } from './common';

// Enums
export const EquipmentTypeEnum = z.enum(['KETTLE', 'FERMENTER', 'KEG', 'BOTTLE', 'OTHER']);
export const EquipmentStatusEnum = z.enum(['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'DIRTY']);

// Schema
export const EquipmentSchema = z.object({
  id: z.string(),
  metadata: BaseMetadataSchema.extend({
    type: EquipmentTypeEnum,
    capacity: z.number()
  }),
  status: z.object({
    current: EquipmentStatusEnum,
    lastUpdated: timestampSchema,
    currentBatchId: z.string().optional()
  }),
  maintenance: z.object({
    lastCleaned: timestampSchema.optional(),
    lastMaintained: timestampSchema.optional(),
    nextMaintenance: timestampSchema.optional(),
    notes: z.string().optional()
  })
});

// Type export
export type Equipment = z.infer<typeof EquipmentSchema>; 