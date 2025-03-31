import { z } from 'zod';
import { timestampSchema } from './common';

// Enum (Consider making values more specific or linking to other enums)
export const AuditEventTypeEnum = z.enum([
    'USER_LOGIN',
    'USER_LOGOUT',
    'USER_ROLE_CHANGE',
    'BATCH_CREATE',
    'BATCH_UPDATE',
    'BATCH_DELETE',
    'EQUIPMENT_STATUS_CHANGE',
    'CONTAINER_STATUS_CHANGE',
    'QUALITY_CHECK_ADDED',
    'QUALITY_CHECK_FAILED'
    // Add other events as needed
]);

// Schemas
export const AuditEventSchema = z.object({
  id: z.string(),
  userId: z.string(),
  eventType: AuditEventTypeEnum,
  timestamp: timestampSchema,
  entityId: z.string().optional(),
  entityType: z.string().optional(),
  changes: z.record(z.any()).optional(),
  notes: z.string().optional()
});

export const AuditLogSchema = z.object({
  id: z.string(),
  events: z.array(AuditEventSchema),
  lastUpdated: timestampSchema
});

// Type Exports
export type AuditEvent = z.infer<typeof AuditEventSchema>;
export type AuditLog = z.infer<typeof AuditLogSchema>; 