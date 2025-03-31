/**
 * Equipment Types - Derived from Zod schemas
 */

import { z } from 'zod';
import {
  EquipmentSchema,
  ContainerSchema,
  EquipmentTypeEnum,
  EquipmentStatusEnum,
  ContainerTypeEnum,
  ContainerStatusEnum,
} from '../schemas/batch'; // Import from the centralized schema file

// Derive types from Zod schemas
export type Equipment = z.infer<typeof EquipmentSchema>;
export type Container = z.infer<typeof ContainerSchema>;

// Optionally export derived enum types if needed directly
export type EquipmentType = z.infer<typeof EquipmentTypeEnum>;
export type EquipmentStatus = z.infer<typeof EquipmentStatusEnum>;
export type ContainerType = z.infer<typeof ContainerTypeEnum>;
export type ContainerStatus = z.infer<typeof ContainerStatusEnum>;

// Remove EquipmentSchedule as requested
// export interface EquipmentSchedule { ... }

// --- Remove old manual type/interface definitions ---
/*
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
*/ 