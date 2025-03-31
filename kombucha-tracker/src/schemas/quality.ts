import { z } from 'zod';
import { timestampSchema, uidSchema } from './common';

// Enums
export const QualityNoteSeverityEnum = z.enum(['INFO', 'WARNING', 'ISSUE']);
export const QualityCheckTypeEnum = z.enum(['PH', 'TEMPERATURE', 'TASTE', 'VISUAL', 'OTHER']);
export const QualityCheckStatusEnum = z.enum(['PASS', 'FAIL', 'WARNING']);

// Schemas
export const QualityNoteSchema = z.object({
  id: z.string(),
  batchId: z.string(),
  timestamp: timestampSchema,
  note: z.string(),
  severity: QualityNoteSeverityEnum,
  resolved: z.boolean().optional(),
  resolution: z.string().optional(),
  resolvedAt: timestampSchema.optional(),
  createdBy: uidSchema,
  updatedBy: uidSchema
});

export const RecallInfoSchema = z.object({
  id: z.string(),
  batchId: z.string(),
  isRecalled: z.boolean(),
  recallDate: timestampSchema.optional(),
  recallReason: z.string().optional(),
  affectedChildBatches: z.array(z.string()).optional(),
  resolution: z.string().optional(),
  resolvedAt: timestampSchema.optional(),
  createdBy: uidSchema,
  updatedBy: uidSchema
});

export const QualityCheckSchema = z.object({
  id: z.string(),
  batchId: z.string(),
  timestamp: timestampSchema,
  type: QualityCheckTypeEnum,
  value: z.number().optional(),
  unit: z.string().optional(),
  notes: z.string().optional(),
  status: QualityCheckStatusEnum,
  createdBy: uidSchema,
  updatedBy: uidSchema
});

// Type exports
export type QualityNote = z.infer<typeof QualityNoteSchema>;
export type RecallInfo = z.infer<typeof RecallInfoSchema>;
export type QualityCheck = z.infer<typeof QualityCheckSchema>; 