import { z } from 'zod';

// Base schemas for common types
const timestampSchema = z.number();
const uidSchema = z.string().min(1);

// Enums for constrained values
const StageEnum = z.enum(['1F', '2F', 'KEGGED', 'BOTTLED', 'COMPLETED']);
const EquipmentTypeEnum = z.enum(['kettle', 'fermenter', 'keg', 'bottle']);
const ContainerTypeEnum = z.enum(['bottle', 'keg']);
const EquipmentStatusEnum = z.enum(['available', 'in_use', 'maintenance', 'cleaning']);
const ContainerStatusEnum = z.enum(['empty', 'filled', 'cleaning']);

// Nested schemas
const BatchCodeSchema = z.object({
  code: z.string(),
  parentCode: z.string().nullable(),
  lineage: z.array(z.string())
});

const FlavoringSchema = z.object({
  ingredients: z.array(z.string()),
  addedAt: timestampSchema,
  notes: z.string()
});

export const StageSchema = z.object({
  stage: StageEnum,
  startTime: timestampSchema,
  endTime: timestampSchema.nullable(),
  equipmentId: z.string(),
  notes: z.string(),
  flavoring: FlavoringSchema.nullable()
});

export const MeasurementSchema = z.object({
  type: z.enum(['ph', 'temperature']),
  value: z.number(),
  timestamp: timestampSchema,
  notes: z.string()
});

// Main schemas
export const BatchMetadataSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  batchNumber: z.number(),
  batchDate: timestampSchema,
  createdBy: uidSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema
});

export const BatchRecipeSchema = z.object({
  teaType: z.string(),
  sugarAmount: z.number(),
  starterAmount: z.number(),
  volume: z.number()
});

export const BatchCurrentStageSchema = z.object({
  stage: StageEnum,
  startTime: timestampSchema,
  equipmentId: z.string(),
  notes: z.string()
});

export const QualityCheckSchema = z.object({
  id: z.string(),
  type: z.string(),
  timestamp: z.number(),
  passed: z.boolean(),
  notes: z.string().optional(),
  performedBy: z.string(),
  measurements: z.array(z.object({
    type: z.string(),
    value: z.number(),
    unit: z.string()
  }))
});

export type QualityCheck = z.infer<typeof QualityCheckSchema>;

export const BatchSchema = z.object({
  metadata: BatchMetadataSchema,
  recipe: BatchRecipeSchema,
  currentStage: BatchCurrentStageSchema,
  batchCode: BatchCodeSchema,
  qualityChecks: z.array(QualityCheckSchema).optional()
});

export const StageHistorySchema = z.record(z.string(), StageSchema);

export const MeasurementHistorySchema = z.record(z.string(), MeasurementSchema);

// Equipment schemas
export const EquipmentMetadataSchema = z.object({
  name: z.string(),
  type: EquipmentTypeEnum,
  capacity: z.number(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema
});

export const EquipmentStatusSchema = z.object({
  current: EquipmentStatusEnum,
  lastUpdated: timestampSchema,
  currentBatchId: z.string().nullable()
});

export const EquipmentMaintenanceSchema = z.object({
  lastCleaned: timestampSchema,
  lastSanitized: timestampSchema,
  notes: z.string()
});

export const EquipmentSchema = z.object({
  metadata: EquipmentMetadataSchema,
  status: EquipmentStatusSchema,
  maintenance: EquipmentMaintenanceSchema
});

// Container schemas
export const ContainerMetadataSchema = z.object({
  name: z.string(),
  type: ContainerTypeEnum,
  capacity: z.number(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema
});

export const ContainerStatusSchema = z.object({
  current: ContainerStatusEnum,
  lastUpdated: timestampSchema,
  currentBatchId: z.string().nullable(),
  fillDate: timestampSchema.nullable(),
  emptyDate: timestampSchema.nullable()
});

export const ContainerSchema = z.object({
  metadata: ContainerMetadataSchema,
  status: ContainerStatusSchema
});

// User schema
export const UserRoleSchema = z.enum(['admin', 'brewer', 'viewer']);
export const UserProfileSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  email: z.string().email(),
  role: UserRoleSchema,
  isActive: z.boolean(),
  createdAt: timestampSchema,
  lastLogin: timestampSchema.nullable(),
  deactivatedAt: timestampSchema.nullable()
});

// Quality Control Schema
export const QualityControlSchema = z.object({
  id: z.string(),
  batchId: z.string(),
  checks: z.array(QualityCheckSchema),
  lastUpdated: timestampSchema
});

// Audit Log Schema
export const AuditEventSchema = z.object({
  id: z.string(),
  userId: z.string(),
  eventType: z.enum([
    'user_login',
    'user_logout',
    'user_role_change',
    'batch_create',
    'batch_update',
    'batch_delete',
    'equipment_status_change',
    'container_status_change',
    'quality_check_added',
    'quality_check_failed'
  ]),
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

// Database root schema
export const DatabaseSchema = z.object({
  users: z.record(uidSchema, z.object({
    profile: UserProfileSchema
  })),
  batches: z.record(z.string(), BatchSchema),
  stages: z.record(z.string(), StageHistorySchema),
  measurements: z.record(z.string(), MeasurementHistorySchema),
  equipment: z.record(z.string(), EquipmentSchema),
  containers: z.record(z.string(), ContainerSchema)
});

// Type exports
export type Batch = z.infer<typeof BatchSchema>;
export type Stage = z.infer<typeof StageSchema>;
export type Measurement = z.infer<typeof MeasurementSchema>;
export type Equipment = z.infer<typeof EquipmentSchema>;
export type Container = z.infer<typeof ContainerSchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type Database = z.infer<typeof DatabaseSchema>; 