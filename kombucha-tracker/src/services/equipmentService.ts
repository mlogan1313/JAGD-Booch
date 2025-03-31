/**
 * Service for managing brewing equipment and containers
 */

import { ref, get, set, push, update, query, orderByChild, equalTo } from 'firebase/database';
import { database } from './firebase';
import { Equipment, Container, EquipmentSchedule } from '../types/equipment';

export class EquipmentService {
  private static instance: EquipmentService;
  private userId: string | null = null;

  private constructor() {}

  /**
   * Get the singleton instance of EquipmentService
   */
  public static getInstance(): EquipmentService {
    if (!EquipmentService.instance) {
      EquipmentService.instance = new EquipmentService();
    }
    return EquipmentService.instance;
  }

  /**
   * Initialize the service with the current user's ID
   */
  public initialize(userId: string): void {
    this.userId = userId;
  }

  /**
   * Get all equipment for the current user
   */
  public async getEquipment(): Promise<Equipment[]> {
    if (!this.userId) throw new Error('EquipmentService not initialized');
    
    const equipmentRef = ref(database, `users/${this.userId}/equipment`);
    const snapshot = await get(equipmentRef);
    
    if (!snapshot.exists()) return [];
    
    return Object.entries(snapshot.val()).map(([id, data]) => ({
      id,
      name: (data as any).name,
      type: (data as any).type,
      capacity: (data as any).capacity,
      status: (data as any).status,
      notes: (data as any).notes,
      createdAt: (data as any).createdAt,
      updatedAt: (data as any).updatedAt
    }));
  }

  /**
   * Get equipment by ID
   */
  public async getEquipmentById(id: string): Promise<Equipment | null> {
    if (!this.userId) throw new Error('EquipmentService not initialized');
    
    const equipmentRef = ref(database, `users/${this.userId}/equipment/${id}`);
    const snapshot = await get(equipmentRef);
    
    if (!snapshot.exists()) return null;
    
    const data = snapshot.val() as any;
    return {
      id,
      name: data.name,
      type: data.type,
      capacity: data.capacity,
      status: data.status,
      notes: data.notes,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    };
  }

  /**
   * Add new equipment
   */
  public async addEquipment(equipment: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Equipment> {
    if (!this.userId) throw new Error('EquipmentService not initialized');
    
    const equipmentRef = ref(database, `users/${this.userId}/equipment`);
    const newEquipmentRef = push(equipmentRef);
    
    const now = Date.now();
    const newEquipment: Equipment = {
      ...equipment,
      id: newEquipmentRef.key!,
      createdAt: now,
      updatedAt: now
    };
    
    await set(newEquipmentRef, newEquipment);
    return newEquipment;
  }

  /**
   * Update equipment
   */
  public async updateEquipment(id: string, updates: Partial<Equipment>): Promise<void> {
    if (!this.userId) throw new Error('EquipmentService not initialized');
    
    const equipmentRef = ref(database, `users/${this.userId}/equipment/${id}`);
    const snapshot = await get(equipmentRef);
    
    if (!snapshot.exists()) {
      throw new Error(`Equipment with ID ${id} not found`);
    }
    
    await update(equipmentRef, {
      ...updates,
      updatedAt: Date.now()
    });
  }

  /**
   * Delete equipment
   */
  public async deleteEquipment(id: string): Promise<void> {
    if (!this.userId) throw new Error('EquipmentService not initialized');
    
    const equipmentRef = ref(database, `users/${this.userId}/equipment/${id}`);
    await set(equipmentRef, null);
  }

  /**
   * Get available equipment of a specific type
   */
  public async getAvailableEquipment(type: Equipment['type'], minCapacity: number): Promise<Equipment[]> {
    if (!this.userId) throw new Error('EquipmentService not initialized');
    
    const equipmentRef = ref(database, `users/${this.userId}/equipment`);
    const typeQuery = query(
      equipmentRef,
      orderByChild('type'),
      equalTo(type)
    );
    
    const snapshot = await get(typeQuery);
    if (!snapshot.exists()) return [];
    
    return Object.entries(snapshot.val())
      .map(([id, data]) => ({
        id,
        name: (data as any).name,
        type: (data as any).type,
        capacity: (data as any).capacity,
        status: (data as any).status,
        notes: (data as any).notes,
        createdAt: (data as any).createdAt,
        updatedAt: (data as any).updatedAt
      }))
      .filter(eq => 
        eq.status === 'AVAILABLE' && 
        eq.capacity >= minCapacity
      );
  }

  /**
   * Get equipment schedule
   */
  public async getEquipmentSchedule(
    equipmentId: string,
    startDate: number,
    endDate: number
  ): Promise<EquipmentSchedule[]> {
    if (!this.userId) throw new Error('EquipmentService not initialized');
    
    const scheduleRef = ref(database, `users/${this.userId}/equipment/${equipmentId}/schedule`);
    const scheduleQuery = query(
      scheduleRef,
      orderByChild('startTime'),
      equalTo(startDate)
    );
    
    const snapshot = await get(scheduleQuery);
    if (!snapshot.exists()) return [];
    
    return Object.entries(snapshot.val())
      .map(([id, data]) => ({
        id,
        equipmentId: (data as any).equipmentId,
        startTime: (data as any).startTime,
        endTime: (data as any).endTime,
        batchId: (data as any).batchId,
        status: (data as any).status,
        notes: (data as any).notes,
        createdAt: (data as any).createdAt,
        updatedAt: (data as any).updatedAt
      }))
      .filter(schedule => 
        schedule.startTime >= startDate && 
        schedule.endTime <= endDate
      );
  }

  /**
   * Schedule equipment usage
   */
  public async scheduleEquipment(
    equipmentId: string,
    schedule: Omit<EquipmentSchedule, 'id'>
  ): Promise<EquipmentSchedule> {
    if (!this.userId) throw new Error('EquipmentService not initialized');
    
    const scheduleRef = ref(database, `users/${this.userId}/equipment/${equipmentId}/schedule`);
    const newScheduleRef = push(scheduleRef);
    
    const newSchedule: EquipmentSchedule = {
      ...schedule,
      id: newScheduleRef.key!
    };
    
    await set(newScheduleRef, newSchedule);
    return newSchedule;
  }

  /**
   * Update equipment status
   */
  public async updateEquipmentStatus(
    equipmentId: string,
    status: Equipment['status']
  ): Promise<void> {
    if (!this.userId) throw new Error('EquipmentService not initialized');
    
    const equipmentRef = ref(database, `users/${this.userId}/equipment/${equipmentId}`);
    await update(equipmentRef, {
      status,
      updatedAt: Date.now()
    });
  }

  /**
   * Get all containers
   */
  public async getContainers(): Promise<Container[]> {
    if (!this.userId) throw new Error('EquipmentService not initialized');
    
    const containersRef = ref(database, `users/${this.userId}/containers`);
    const snapshot = await get(containersRef);
    
    if (!snapshot.exists()) return [];
    
    return Object.entries(snapshot.val()).map(([id, data]) => ({
      id,
      name: (data as any).name,
      type: (data as any).type,
      capacity: (data as any).capacity,
      status: (data as any).status,
      currentBatchId: (data as any).currentBatchId,
      notes: (data as any).notes,
      fillDate: (data as any).fillDate,
      emptyDate: (data as any).emptyDate,
      createdAt: (data as any).createdAt,
      updatedAt: (data as any).updatedAt
    }));
  }

  /**
   * Add new container
   */
  public async addContainer(container: Omit<Container, 'id' | 'createdAt' | 'updatedAt'>): Promise<Container> {
    if (!this.userId) throw new Error('EquipmentService not initialized');
    
    const containersRef = ref(database, `users/${this.userId}/containers`);
    const newContainerRef = push(containersRef);
    
    const now = Date.now();
    const newContainer: Container = {
      ...container,
      id: newContainerRef.key!,
      createdAt: now,
      updatedAt: now
    };
    
    await set(newContainerRef, newContainer);
    return newContainer;
  }

  /**
   * Update container status
   */
  public async updateContainerStatus(
    containerId: string,
    status: Container['status'],
    batchId?: string
  ): Promise<void> {
    if (!this.userId) throw new Error('EquipmentService not initialized');
    
    const containerRef = ref(database, `users/${this.userId}/containers/${containerId}`);
    const updates: Partial<Container> = {
      status,
      updatedAt: Date.now()
    };
    
    if (status === 'FILLED' && batchId) {
      updates.currentBatchId = batchId;
      updates.fillDate = Date.now();
    } else if (status === 'EMPTY') {
      updates.currentBatchId = undefined;
      updates.emptyDate = Date.now();
    }
    
    await update(containerRef, updates);
  }

  /**
   * Clear all equipment and container data
   */
  public async clearAllData(): Promise<void> {
    if (!this.userId) {
      throw new Error('EquipmentService not initialized');
    }
    
    const equipmentRef = ref(database, `users/${this.userId}/equipment`);
    const containersRef = ref(database, `users/${this.userId}/containers`);
    
    await Promise.all([
      set(equipmentRef, {}),
      set(containersRef, {})
    ]);
  }

  async seedSampleData(userId: string): Promise<void> {
    if (!this.userId) {
      throw new Error('EquipmentService not initialized');
    }

    const equipmentTypes = ['FERMENTER', 'BOTTLING', 'OTHER'] as const;
    const equipmentStatuses = ['AVAILABLE', 'IN_USE', 'MAINTENANCE'] as const;
    const containerTypes = ['BOTTLE', 'JAR', 'OTHER'] as const;
    const containerStatuses = ['EMPTY', 'FILLED', 'CLEANING'] as const;

    const generateRandomDate = (daysAgo: number) => {
      return new Date(Date.now() - Math.random() * daysAgo * 24 * 60 * 60 * 1000).toISOString();
    };

    const sampleEquipment = Array.from({ length: 8 }, (_, index) => {
      const type = equipmentTypes[Math.floor(Math.random() * equipmentTypes.length)];
      const status = equipmentStatuses[Math.floor(Math.random() * equipmentStatuses.length)];
      const capacity = type === 'FERMENTER' ? 5 : 
                      type === 'BOTTLING' ? 20 : 
                      Math.floor(Math.random() * 10) + 1;

      return {
        name: `${type.charAt(0) + type.slice(1).toLowerCase()} ${index + 1}`,
        type,
        capacity,
        status,
        notes: `Sample ${type.toLowerCase()} equipment ${index + 1}`
      };
    });

    const sampleContainers = Array.from({ length: 12 }, (_, index) => {
      const type = containerTypes[Math.floor(Math.random() * containerTypes.length)];
      const status = containerStatuses[Math.floor(Math.random() * containerStatuses.length)];
      const capacity = type === 'BOTTLE' ? 0.5 : 
                      type === 'JAR' ? 1 : 
                      0.5;

      return {
        name: `${type.charAt(0) + type.slice(1).toLowerCase()} Set ${index + 1}`,
        type,
        capacity,
        status,
        notes: `Sample ${type.toLowerCase()} container set ${index + 1}`
      };
    });

    for (const equipment of sampleEquipment) {
      await this.addEquipment(equipment);
    }

    for (const container of sampleContainers) {
      await this.addContainer(container);
    }
  }
} 