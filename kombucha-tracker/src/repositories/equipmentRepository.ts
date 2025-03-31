import { BaseRepository } from './baseRepository';
import { 
  Equipment, 
  EquipmentSchema,
  EquipmentMaintenanceSchema
} from '../schemas/batch';
import { ref, get, set, update } from 'firebase/database';
import { database } from '../services/firebase';

type EquipmentStatus = 'available' | 'in_use' | 'maintenance' | 'cleaning';

export class EquipmentRepository extends BaseRepository<Equipment, typeof EquipmentSchema> {
  constructor() {
    super('equipment', EquipmentSchema);
  }

  async updateStatus(
    equipmentId: string,
    status: EquipmentStatus,
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
      cleaned?: boolean;
      sanitized?: boolean;
      notes?: string;
    }
  ): Promise<void> {
    const equipmentRef = ref(database, `equipment/${equipmentId}`);
    const currentEquipment = await get(equipmentRef);
    
    if (!currentEquipment.exists()) {
      throw new Error(`Equipment ${equipmentId} not found`);
    }

    try {
      const currentMaintenance = currentEquipment.val().maintenance;
      const updatedMaintenance = {
        lastCleaned: maintenance.cleaned ? Date.now() : currentMaintenance.lastCleaned,
        lastSanitized: maintenance.sanitized ? Date.now() : currentMaintenance.lastSanitized,
        notes: maintenance.notes || currentMaintenance.notes
      };
      await update(equipmentRef, { maintenance: updatedMaintenance });
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
        const equipmentData = childSnapshot.val();
        if (equipmentData.status.current === 'available') {
          equipment.push(EquipmentSchema.parse(equipmentData));
        }
      } catch (error) {
        console.error(`Validation error for equipment:`, error);
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
        const equipmentData = childSnapshot.val();
        if (equipmentData.status.current === 'in_use') {
          equipment.push(EquipmentSchema.parse(equipmentData));
        }
      } catch (error) {
        console.error(`Validation error for equipment:`, error);
      }
    });
    return equipment;
  }
} 