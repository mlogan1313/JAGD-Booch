/**
 * Types for batch management and tracking - Derived from Zod schemas
 */

// Import Zod schemas to derive types from
import { z } from 'zod';
import {
  BatchSchema,
  BatchCodeSchema,
  FermentationStageSchema,
  MeasurementSchema,
  TaskSchema,
  ChecklistSchema,
  FlavoringDetailsSchema,
  QualityNoteSchema,
  RecallInfoSchema,
  FinishingDetailsSchema,
  EquipmentHistoryItemSchema,
  SplitPortionSchema,
  StageEnum,
  BatchTypeEnum,
  FinishingDetailsSchema as FinishingZodSchema
} from '../schemas/batch';

// No longer need direct imports from other type files if schemas cover everything
// import { EquipmentType } from './equipment';
// import { QualityNote, RecallInfo } from './quality';

// Derive types directly from Zod schemas
export type BatchStage = z.infer<typeof StageEnum>;
export type BatchType = z.infer<typeof BatchTypeEnum>;
export type FinishingType = z.infer<typeof FinishingZodSchema>['type'];

export type BatchCode = z.infer<typeof BatchCodeSchema>;
export type FermentationStage = z.infer<typeof FermentationStageSchema>;
export type Measurement = z.infer<typeof MeasurementSchema>;
export type Task = z.infer<typeof TaskSchema>;
export type Checklist = z.infer<typeof ChecklistSchema>;
export type FlavoringDetails = z.infer<typeof FlavoringDetailsSchema>;
export type QualityNote = z.infer<typeof QualityNoteSchema>;
export type RecallInfo = z.infer<typeof RecallInfoSchema>;
export type FinishingDetails = z.infer<typeof FinishingDetailsSchema>;
export type EquipmentHistoryItem = z.infer<typeof EquipmentHistoryItemSchema>;
export type SplitPortion = z.infer<typeof SplitPortionSchema>;
export type Batch = z.infer<typeof BatchSchema>;

// Keep the FirebaseBatchData interface if it's used for structuring data in Firebase
// It uses the derived Batch type, so it should remain consistent.
export interface FirebaseBatchData {
  [userId: string]: {
    [batchId: string]: Batch;
  };
}

// ---- Remove old manual type/interface definitions ----
/*
export type BatchStage = 
  | '1F'          // Primary fermentation in kettle
  | '2F'          // Secondary fermentation in fermenter
  | 'KEGGED'      // Transferred to keg
  | 'BOTTLED'     // Bottled from keg or fermenter
  | 'COMPLETED';  // Finished and archived

export interface BatchCode {
  code: string;           // Format: YYYYMMDD-XXXX-ZZZZ
  parentCode?: string;    // Reference to parent batch code
  childCodes: string[];   // References to child batch codes
  lineage: string[];      // Full lineage from original 1F batch
}

export interface FermentationStage {
  stage: BatchStage;
  startTime: number;
  endTime?: number;
  equipmentId: string;
  notes?: string;
}

export interface Measurement {
  timestamp: number;
  value: number;
  notes?: string;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: number;
  notes?: string;
}

export interface Checklist {
  id: string;
  title: string;
  tasks: Task[];
  completed: boolean;
}

export interface FlavoringDetails {
  ingredients: string[];
  addedAt: number;
  notes?: string;
}

export interface Batch {
  // Basic Information
  id: string;
  name: string;
  description?: string;
  batchCode: BatchCode;
  batchNumber: number;
  batchDate: number;
  batchType: '1F' | '2F' | 'KEG' | 'BOTTLE'; // <-- Replace with BatchType
  
  // Stage Tracking
  stage: BatchStage;
  stageHistory: FermentationStage[];
  
  // Equipment Tracking
  currentEquipmentId: string;
  equipmentHistory: {
    equipmentId: string;
    startTime: number;
    endTime?: number;
    notes?: string;
  }[];
  
  // Batch Relationships
  parentBatchId?: string;
  childBatchIds: string[];
  splitPortions: {
    batchId: string;
    volume: number;
    date: number;
    sourceEquipmentId: string;
    targetEquipmentId: string;
  }[];
  
  // Measurements
  measurements: {
    ph: Measurement[];
    temperature: Measurement[];
  };
  
  // Tasks and Checklists
  checklists: Checklist[];
  
  // Flavoring
  flavoring?: FlavoringDetails;
  
  // Batch Details
  volume: number;
  teaType: string;
  sugarAmount: number;
  starterAmount: number;
  
  // Quality Control
  qualityNotes?: QualityNote[];
  recallStatus?: RecallInfo;
  
  // Finishing Details
  finishingDetails?: {
    type: 'KEG' | 'BOTTLE'; // <-- Replace with FinishingType
    containerIds: string[];
    date: number;
    volume: number;
    carbonationLevel?: number;
    notes?: string;
  };
  
  // Metadata
  createdBy: string;
  lastModifiedBy: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}
*/ 