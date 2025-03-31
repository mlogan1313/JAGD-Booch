import { BaseRepository } from './baseRepository';
import { 
  Container, 
  ContainerSchema,
  ContainerStatusSchema
} from '../schemas/batch';
import { ref, get, set, update } from 'firebase/database';
import { database } from '../services/firebase';

type ContainerStatus = 'empty' | 'filled' | 'cleaning';

export class ContainerRepository extends BaseRepository<Container, typeof ContainerSchema> {
  constructor() {
    super('containers', ContainerSchema);
  }

  async updateStatus(
    containerId: string,
    status: ContainerStatus,
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
        currentBatchId,
        fillDate: status === 'filled' ? Date.now() : null,
        emptyDate: status === 'empty' ? Date.now() : null
      };
      await update(containerRef, { status: updatedStatus });
    } catch (error) {
      console.error(`Error updating status for container ${containerId}:`, error);
      throw error;
    }
  }

  async getEmptyContainers(): Promise<Container[]> {
    const containerRef = ref(database, 'containers');
    const snapshot = await get(containerRef);
    if (!snapshot.exists()) return [];

    const containers: Container[] = [];
    snapshot.forEach((childSnapshot) => {
      try {
        const containerData = childSnapshot.val();
        if (containerData.status.current === 'empty') {
          containers.push(ContainerSchema.parse(containerData));
        }
      } catch (error) {
        console.error(`Validation error for container:`, error);
      }
    });
    return containers;
  }

  async getFilledContainers(): Promise<Container[]> {
    const containerRef = ref(database, 'containers');
    const snapshot = await get(containerRef);
    if (!snapshot.exists()) return [];

    const containers: Container[] = [];
    snapshot.forEach((childSnapshot) => {
      try {
        const containerData = childSnapshot.val();
        if (containerData.status.current === 'filled') {
          containers.push(ContainerSchema.parse(containerData));
        }
      } catch (error) {
        console.error(`Validation error for container:`, error);
      }
    });
    return containers;
  }

  async getContainersByBatch(batchId: string): Promise<Container[]> {
    const containerRef = ref(database, 'containers');
    const snapshot = await get(containerRef);
    if (!snapshot.exists()) return [];

    const containers: Container[] = [];
    snapshot.forEach((childSnapshot) => {
      try {
        const containerData = childSnapshot.val();
        if (containerData.status.currentBatchId === batchId) {
          containers.push(ContainerSchema.parse(containerData));
        }
      } catch (error) {
        console.error(`Validation error for container:`, error);
      }
    });
    return containers;
  }
} 