/**
 * Service for managing brewing equipment and containers
 */

import { Equipment, EquipmentSchema, Container, ContainerSchema } from '../schemas/batch';
import { EquipmentRepository } from '../repositories/equipmentRepository';
import { ContainerRepository } from '../repositories/containerRepository';
import { EquipmentType, EquipmentStatus, ContainerType, ContainerStatus } from '../types/enums';

export class EquipmentService {
  private static instance: EquipmentService;
  private userId: string | null = null;
  private equipmentRepository: EquipmentRepository;
  private containerRepository: ContainerRepository;

  private constructor() {
    this.equipmentRepository = new EquipmentRepository();
    this.containerRepository = new ContainerRepository();
  }

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
    return this.equipmentRepository.getAll(this.userId);
  }

  /**
   * Get equipment by ID
   */
  public async getEquipmentById(id: string): Promise<Equipment | null> {
    if (!this.userId) throw new Error('EquipmentService not initialized');
    return this.equipmentRepository.get(id, this.userId);
  }

  /**
   * Add new equipment
   */
  public async addEquipment(equipment: Omit<Equipment, 'id'>): Promise<Equipment> {
    if (!this.userId) throw new Error('EquipmentService not initialized');
    return this.equipmentRepository.create(equipment, this.userId);
  }

  /**
   * Update equipment
   */
  public async updateEquipment(id: string, updates: Partial<Equipment>): Promise<void> {
    if (!this.userId) throw new Error('EquipmentService not initialized');
    await this.equipmentRepository.update(id, updates, this.userId);
  }

  /**
   * Delete equipment
   */
  public async deleteEquipment(id: string): Promise<void> {
    if (!this.userId) throw new Error('EquipmentService not initialized');
    await this.equipmentRepository.delete(id, this.userId);
  }

  /**
   * Get available equipment of a specific type
   */
  public async getAvailableEquipment(type: EquipmentType, minCapacity: number): Promise<Equipment[]> {
    if (!this.userId) throw new Error('EquipmentService not initialized');
    const allEquipment = await this.equipmentRepository.getAll(this.userId);
    return allEquipment.filter(equipment => 
      equipment.metadata.type === type && 
      equipment.metadata.capacity >= minCapacity &&
      equipment.status.current === EquipmentStatus.AVAILABLE
    );
  }

  /**
   * Get all containers
   */
  public async getContainers(): Promise<Container[]> {
    if (!this.userId) throw new Error('EquipmentService not initialized');
    return this.containerRepository.getAll(this.userId);
  }

  /**
   * Add new container
   */
  public async addContainer(container: Omit<Container, 'id'>): Promise<Container> {
    if (!this.userId) throw new Error('EquipmentService not initialized');
    return this.containerRepository.create(container, this.userId);
  }

  /**
   * Update container status
   */
  public async updateContainerStatus(
    containerId: string,
    status: ContainerStatus,
    batchId?: string
  ): Promise<void> {
    if (!this.userId) throw new Error('EquipmentService not initialized');
    await this.containerRepository.updateStatus(containerId, status, batchId);
  }

  /**
   * Clear all equipment data
   */
  public async clearAllData(): Promise<void> {
    if (!this.userId) {
      throw new Error('EquipmentService not initialized');
    }
    
    const equipment = await this.equipmentRepository.getAll(this.userId);
    const containers = await this.containerRepository.getAll(this.userId);
    
    await Promise.all([
      ...equipment.map(eq => this.equipmentRepository.delete(eq.id, this.userId!)),
      ...containers.map(container => this.containerRepository.delete(container.id, this.userId!))
    ]);
  }

  async seedSampleData(userId: string): Promise<void> {
    if (!this.userId) {
      throw new Error('EquipmentService not initialized');
    }

    const equipmentTypes = Object.values(EquipmentType);
    const equipmentStatuses = Object.values(EquipmentStatus);
    const containerTypes = Object.values(ContainerType);
    const containerStatuses = Object.values(ContainerStatus);

    const generateRandomDate = (daysAgo: number) => {
      return new Date(Date.now() - Math.random() * daysAgo * 24 * 60 * 60 * 1000).toISOString();
    };

    const sampleEquipment = Array.from({ length: 8 }, (_, index) => {
      const type = equipmentTypes[Math.floor(Math.random() * equipmentTypes.length)];
      const status = equipmentStatuses[Math.floor(Math.random() * equipmentStatuses.length)];
      const capacity = type === EquipmentType.FERMENTER ? 5 : 
                      type === EquipmentType.KEG ? 5 :
                      type === EquipmentType.BOTTLE ? 0.5 :
                      Math.floor(Math.random() * 10) + 1;

      return {
        metadata: {
          name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${index + 1}`,
          type,
          capacity,
          description: `Sample ${type} equipment ${index + 1}`,
          createdBy: this.userId!,
          createdAt: Date.now(),
          updatedAt: Date.now()
        },
        status: {
          current: status,
          lastUpdated: Date.now(),
          currentBatchId: null
        },
        maintenance: {
          lastCleaned: null,
          lastMaintained: null,
          nextMaintenance: null,
          notes: 'New equipment'
        }
      };
    });

    const sampleContainers = Array.from({ length: 12 }, (_, index) => {
      const type = containerTypes[Math.floor(Math.random() * containerTypes.length)];
      const status = containerStatuses[Math.floor(Math.random() * containerStatuses.length)];
      const capacity = type === ContainerType.BOTTLE ? 0.5 : 5;

      return {
        metadata: {
          name: `${type.charAt(0).toUpperCase() + type.slice(1)} Set ${index + 1}`,
          type,
          capacity,
          description: `Sample ${type} container set ${index + 1}`,
          createdBy: this.userId!,
          createdAt: Date.now(),
          updatedAt: Date.now()
        },
        status: {
          current: status,
          lastUpdated: Date.now(),
          currentBatchId: null,
          fillDate: status === ContainerStatus.FILLED ? Date.now() : null,
          emptyDate: status === ContainerStatus.EMPTY ? Date.now() : null
        }
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