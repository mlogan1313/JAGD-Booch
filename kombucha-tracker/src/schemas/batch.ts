import { z } from 'zod';

// --- Imported Schemas/Enums ---
import { QualityNoteSchema, RecallInfoSchema } from './quality';
import { EquipmentSchema } from './equipment';
import { ContainerSchema } from './container';
import { UserProfileSchema } from './user';
import { AuditLogSchema } from './audit';

// --- Base Types (Defined locally) ---
const timestampSchema = z.number();
const uidSchema = z.string().min(1);

// --- Batch Specific Enums (Defined locally) ---
export const StageEnum = z.enum(['1F', '2F', 'KEGGED', 'BOTTLED', 'COMPLETED']);
export const BatchTypeEnum = z.enum(['1F', '2F', 'KEG', 'BOTTLE']);

// Enums for constrained values (UPPERCASE standard)
export const EquipmentTypeEnum = z.enum(['KETTLE', 'FERMENTER', 'KEG', 'BOTTLE', 'OTHER']); // Uppercase, added OTHER
export const ContainerTypeEnum = z.enum(['BOTTLE', 'KEG', 'OTHER']); // Uppercase, added OTHER
export const EquipmentStatusEnum = z.enum(['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'DIRTY']); // Uppercase, DIRTY replaces cleaning
export const ContainerStatusEnum = z.enum(['EMPTY', 'FILLED', 'DIRTY']); // Uppercase, DIRTY replaces cleaning
export const UserRoleSchema = z.enum(['admin', 'brewer', 'viewer']); // Keep roles lowercase for now

// New Enums for Quality
export const QualityCheckTypeEnum = z.enum(['PH', 'TEMPERATURE', 'TASTE', 'VISUAL', 'OTHER']);
export const QualityCheckStatusEnum = z.enum(['PASS', 'FAIL', 'WARNING']);

// --- Batch Specific Schemas (Defined locally) ---

export const BatchCodeSchema = z.object({
  code: z.string(),
  parentCode: z.string().optional(),
  childCodes: z.array(z.string()),
  lineage: z.array(z.string())
});

export const FermentationStageSchema = z.object({
  stage: StageEnum,
  startTime: timestampSchema,
  endTime: timestampSchema.optional(),
  equipmentId: z.string(),
  notes: z.string().optional()
});

export const MeasurementSchema = z.object({
  timestamp: timestampSchema,
  value: z.number(),
  notes: z.string().optional()
});

export const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  completed: z.boolean(),
  completedAt: timestampSchema.optional(),
  notes: z.string().optional()
});

export const ChecklistSchema = z.object({
  id: z.string(),
  title: z.string(),
  tasks: z.array(TaskSchema),
  completed: z.boolean()
});

export const FlavoringDetailsSchema = z.object({
  ingredients: z.array(z.string()),
  addedAt: timestampSchema,
  notes: z.string().optional()
});

export const FinishingDetailsSchema = z.object({
  type: z.enum(['KEG', 'BOTTLE']),
  containerIds: z.array(z.string()),
  date: timestampSchema,
  volume: z.number(),
  carbonationLevel: z.number().optional(),
  notes: z.string().optional()
});

export const EquipmentHistoryItemSchema = z.object({
    equipmentId: z.string(),
    startTime: timestampSchema,
    endTime: timestampSchema.optional(),
    notes: z.string().optional()
});

export const SplitPortionSchema = z.object({
    batchId: z.string(),
    volume: z.number(),
    date: timestampSchema,
    sourceEquipmentId: z.string(),
    targetEquipmentId: z.string()
});

// --- Main Batch Schema ---
export const BatchSchema = z.object({
  // Basic Information
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  batchCode: BatchCodeSchema,
  batchNumber: z.number(),
  batchDate: timestampSchema,
  batchType: BatchTypeEnum,

  // Stage Tracking
  stage: StageEnum,
  stageHistory: z.array(FermentationStageSchema),

  // Equipment Tracking
  currentEquipmentId: z.string(),
  equipmentHistory: z.array(EquipmentHistoryItemSchema),

  // Batch Relationships
  parentBatchId: z.string().optional(),
  childBatchIds: z.array(z.string()),
  splitPortions: z.array(SplitPortionSchema),

  // Measurements
  measurements: z.object({
    ph: z.array(MeasurementSchema),
    temperature: z.array(MeasurementSchema),
  }),

  // Tasks and Checklists
  checklists: z.array(ChecklistSchema),

  // Flavoring
  flavoring: FlavoringDetailsSchema.optional(),

  // Batch Details
  volume: z.number(),
  teaType: z.string(),
  sugarAmount: z.number(),
  starterAmount: z.number(),

  // Quality Control (Using imported schemas)
  qualityNotes: z.array(QualityNoteSchema).optional(), // Imported
  recallStatus: RecallInfoSchema.optional(), // Imported

  // Finishing Details
  finishingDetails: FinishingDetailsSchema.optional(),

  // Metadata
  createdBy: uidSchema,
  lastModifiedBy: uidSchema,
  notes: z.string().optional(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

// --- Root Database Schema ---
export const DatabaseSchema = z.object({
  users: z.record(uidSchema, z.object({
    profile: UserProfileSchema // Imported
  })),
  batches: z.record(z.string(), BatchSchema),
  equipment: z.record(z.string(), EquipmentSchema), // Imported
  containers: z.record(z.string(), ContainerSchema), // Imported
  auditLogs: z.record(z.string(), AuditLogSchema).optional() // Imported
});

// --- Type Exports --- 
// Batch specific types/enums
export type Batch = z.infer<typeof BatchSchema>;
export type BatchCode = z.infer<typeof BatchCodeSchema>;
export type FermentationStage = z.infer<typeof FermentationStageSchema>;
export type Measurement = z.infer<typeof MeasurementSchema>;
export type Task = z.infer<typeof TaskSchema>;
export type Checklist = z.infer<typeof ChecklistSchema>;
export type FlavoringDetails = z.infer<typeof FlavoringDetailsSchema>;
export type FinishingDetails = z.infer<typeof FinishingDetailsSchema>;
export type EquipmentHistoryItem = z.infer<typeof EquipmentHistoryItemSchema>;
export type SplitPortion = z.infer<typeof SplitPortionSchema>;

// Root DB type
export type Database = z.infer<typeof DatabaseSchema>; 