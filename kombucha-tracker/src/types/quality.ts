/**
 * Types for quality control and recall management - Derived from Zod schemas
 */
import { z } from 'zod';
import {
  QualityNoteSchema,
  RecallInfoSchema,
  QualityCheckSchema,
  QualityNoteSeverityEnum,
  QualityCheckTypeEnum,
  QualityCheckStatusEnum
} from '../schemas/batch'; // Import from the centralized schema file

// Derive types from Zod schemas
export type QualityNote = z.infer<typeof QualityNoteSchema>;
export type RecallInfo = z.infer<typeof RecallInfoSchema>;
export type QualityCheck = z.infer<typeof QualityCheckSchema>;

// Optionally export derived enum types if needed directly
export type QualityNoteSeverity = z.infer<typeof QualityNoteSeverityEnum>;
export type QualityCheckType = z.infer<typeof QualityCheckTypeEnum>;
export type QualityCheckStatus = z.infer<typeof QualityCheckStatusEnum>;

// QualityReport seems specific and not directly derived from a single schema yet.
// Keep it for now, but ensure it uses derived types where applicable.
export interface QualityReport {
  batchId: string;
  startDate: number;
  endDate: number;
  checks: QualityCheck[]; // Uses derived QualityCheck
  notes: QualityNote[];   // Uses derived QualityNote
  recallInfo?: RecallInfo; // Uses derived RecallInfo
  summary: {
    totalChecks: number;
    passedChecks: number;
    failedChecks: number;
    warnings: number;
    issues: number;
  };
}

// --- Remove old manual type/interface definitions ---
/*
export interface QualityNote {
  id: string;
  batchId: string;
  timestamp: number;
  note: string;
  severity: 'INFO' | 'WARNING' | 'ISSUE';
  resolved?: boolean;
  resolution?: string;
  resolvedAt?: number;
  createdBy: string;
  updatedBy: string;
}

export interface RecallInfo {
  id: string;
  batchId: string;
  isRecalled: boolean;
  recallDate?: number;
  recallReason?: string;
  affectedChildBatches?: string[]; // Batch codes of affected batches
  resolution?: string;
  resolvedAt?: number;
  createdBy: string;
  updatedBy: string;
}

export interface QualityCheck {
  id: string;
  batchId: string;
  timestamp: number;
  type: 'PH' | 'TEMPERATURE' | 'TASTE' | 'VISUAL' | 'OTHER';
  value?: number;
  unit?: string;
  notes?: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  createdBy: string;
  updatedBy: string;
}
*/ 