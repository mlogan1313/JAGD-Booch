import { BaseRepository } from './baseRepository';
import { Container, ContainerSchema, ContainerStatusEnum } from '../schemas/container';
import { ref, get, set, update } from 'firebase/database';
import { database } from '../services/firebase';
import { z } from 'zod';

export class ContainerRepository extends BaseRepository<Container, typeof ContainerSchema> {
  constructor() {
    super('containers', ContainerSchema);
  }

  async updateStatus(
    containerId: string,
    status: z.infer<typeof ContainerStatusEnum>,
    currentBatchId: string | null = null
  ): Promise<void> {
    const containerRef = ref(database, `containers/${containerId}`);
    const currentContainer = await get(containerRef);
    
    if (!currentContainer.exists()) {
      throw new Error(`Container ${containerId} not found`);
    }

    try {
      const updatedStatus = {
        current: status,
        lastUpdated: Date.now(),
        currentBatchId
      };
      await update(containerRef, { status: updatedStatus });
    } catch (error) {
      console.error(`Error updating status for container ${containerId}:`, error);
      throw error;
    }
  }

  async getContainersByStatus(status: z.infer<typeof ContainerStatusEnum>): Promise<Container[]> {
    const containersRef = ref(database, 'containers');
    const snapshot = await get(containersRef);
    if (!snapshot.exists()) return [];

    const containers: Container[] = [];
    snapshot.forEach((childSnapshot) => {
      try {
        const containerData = ContainerSchema.parse(childSnapshot.val());
        if (containerData.status.current === status) {
          containers.push(containerData);
        }
      } catch (error) {
        console.error(`Validation error parsing container: ${childSnapshot.key}`, error);
      }
    });
    return containers;
  }

  async getEmptyContainers(): Promise<Container[]> {
    return this.getContainersByStatus(ContainerStatusEnum.Enum.EMPTY);
  }

  async getFilledContainers(): Promise<Container[]> {
    return this.getContainersByStatus(ContainerStatusEnum.Enum.FILLED);
  }

  async getDirtyContainers(): Promise<Container[]> {
    return this.getContainersByStatus(ContainerStatusEnum.Enum.DIRTY);
  }
} 