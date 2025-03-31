/**
 * Equipment Types
 */

export interface Equipment {
  id: string;
  name: string;
  type: 'FERMENTER' | 'BOTTLING' | 'OTHER';
  capacity: number;
  status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE';
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Container {
  id: string;
  name: string;
  type: 'BOTTLE' | 'JAR' | 'OTHER';
  capacity: number;
  status: 'EMPTY' | 'FILLED' | 'CLEANING';
  currentBatchId?: string;
  notes?: string;
  fillDate?: number;
  emptyDate?: number;
  createdAt: number;
  updatedAt: number;
}

export interface EquipmentSchedule {
  id: string;
  equipmentId: string;
  startTime: number;
  endTime: number;
  batchId: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  createdAt: number;
  updatedAt: number;
} 