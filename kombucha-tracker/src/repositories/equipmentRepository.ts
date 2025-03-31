import { BaseRepository } from './baseRepository';
import { Equipment, EquipmentSchema, EquipmentStatusEnum } from '../schemas/equipment';
import { ref, get, set, update } from 'firebase/database';
import { database } from '../services/firebase';
import { z } from 'zod';

export class EquipmentRepository extends BaseRepository<Equipment, typeof EquipmentSchema> {
  constructor() {
    super('equipment', EquipmentSchema);
  }

  async updateStatus(
    equipmentId: string,
    status: z.infer<typeof EquipmentStatusEnum>,
    currentBatchId: string | null = null
  ): Promise<void> {
    const equipmentRef = ref(database, `equipment/${equipmentId}`);
    const currentEquipment = await get(equipmentRef);
    
    if (!currentEquipment.exists()) {
      throw new Error(`Equipment ${equipmentId} not found`);
    }

    try {
      const updatedStatus = {
        current: status,
        lastUpdated: Date.now(),
        currentBatchId
      };
      await update(equipmentRef, { status: updatedStatus });
    } catch (error) {
      console.error(`Error updating status for equipment ${equipmentId}:`, error);
      throw error;
    }
  }

  async recordMaintenance(
    equipmentId: string,
    maintenance: {
      lastCleaned?: boolean;
      lastMaintained?: boolean;
      nextMaintenance?: number | null;
      notes?: string;
    }
  ): Promise<void> {
    const equipmentRef = ref(database, `equipment/${equipmentId}`);
    const currentEquipment = await get(equipmentRef);
    
    if (!currentEquipment.exists()) {
      throw new Error(`Equipment ${equipmentId} not found`);
    }

    try {
      const currentMaintenanceData = currentEquipment.val()?.maintenance || {};
      const updatedMaintenance: Partial<Equipment['maintenance']> = {};

      if (maintenance.lastCleaned) updatedMaintenance.lastCleaned = Date.now();
      if (maintenance.lastMaintained) updatedMaintenance.lastMaintained = Date.now();
      if (maintenance.nextMaintenance !== undefined) updatedMaintenance.nextMaintenance = maintenance.nextMaintenance;
      if (maintenance.notes) updatedMaintenance.notes = maintenance.notes;

      const finalMaintenance = { ...currentMaintenanceData, ...updatedMaintenance };

      await update(equipmentRef, { maintenance: finalMaintenance });
    } catch (error) {
      console.error(`Error recording maintenance for equipment ${equipmentId}:`, error);
      throw error;
    }
  }

  async getAvailableEquipment(): Promise<Equipment[]> {
    const equipmentRef = ref(database, 'equipment');
    const snapshot = await get(equipmentRef);
    if (!snapshot.exists()) return [];

    const equipment: Equipment[] = [];
    snapshot.forEach((childSnapshot) => {
      try {
        const equipmentData = EquipmentSchema.parse(childSnapshot.val());
        if (equipmentData.status.current === EquipmentStatusEnum.Enum.AVAILABLE) {
          equipment.push(equipmentData);
        }
      } catch (error) {
        console.error(`Validation error parsing available equipment: ${childSnapshot.key}`, error);
      }
    });
    return equipment;
  }

  async getEquipmentInUse(): Promise<Equipment[]> {
    const equipmentRef = ref(database, 'equipment');
    const snapshot = await get(equipmentRef);
    if (!snapshot.exists()) return [];

    const equipment: Equipment[] = [];
    snapshot.forEach((childSnapshot) => {
      try {
        const equipmentData = EquipmentSchema.parse(childSnapshot.val());
        if (equipmentData.status.current === EquipmentStatusEnum.Enum.IN_USE) {
          equipment.push(equipmentData);
        }
      } catch (error) {
        console.error(`Validation error parsing in-use equipment: ${childSnapshot.key}`, error);
      }
    });
    return equipment;
  }
} 