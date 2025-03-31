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
      ...data
    } as Equipment));
  }

  /**
   * Get equipment by ID
   */
  public async getEquipmentById(id: string): Promise<Equipment | null> {
    if (!this.userId) throw new Error('EquipmentService not initialized');
    
    const equipmentRef = ref(database, `users/${this.userId}/equipment/${id}`);
    const snapshot = await get(equipmentRef);
    
    if (!snapshot.exists()) return null;
    
    return {
      id,
      ...snapshot.val()
    } as Equipment;
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
        ...data
      } as Equipment))
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
        ...data
      } as EquipmentSchedule))
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
      ...data
    } as Container));
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
} 