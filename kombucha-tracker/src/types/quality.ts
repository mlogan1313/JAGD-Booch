/**
 * Types for quality control and recall management
 */

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

export interface QualityReport {
  batchId: string;
  startDate: number;
  endDate: number;
  checks: QualityCheck[];
  notes: QualityNote[];
  recallInfo?: RecallInfo;
  summary: {
    totalChecks: number;
    passedChecks: number;
    failedChecks: number;
    warnings: number;
    issues: number;
  };
} 