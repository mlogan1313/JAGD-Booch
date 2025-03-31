/**
 * Types for batch management and tracking
 */

import { EquipmentType } from './equipment';
import { QualityNote, RecallInfo } from './quality';

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
  batchType: '1F' | '2F' | 'KEG' | 'BOTTLE';
  
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
    type: 'KEG' | 'BOTTLE';
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

export interface FirebaseBatchData {
  [userId: string]: {
    [batchId: string]: Batch;
  };
} 