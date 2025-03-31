import { ref, get, set, push, update, remove, onValue, off } from 'firebase/database';
import { database } from './firebase';
import { Batch, FirebaseBatchData } from '../types/batch';
import { BatchRepository } from '../repositories/batchRepository';
import { Batch as BatchSchema } from '../schemas/batch';

export class BatchService {
  private static instance: BatchService;
  private batchRepository: BatchRepository;
  private userId: string | null = null;

  private constructor() {
    this.batchRepository = new BatchRepository();
  }

  static getInstance(): BatchService {
    if (!BatchService.instance) {
      BatchService.instance = new BatchService();
    }
    return BatchService.instance;
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  private get batchRef() {
    if (!this.userId) throw new Error('User ID not set');
    return ref(database, `users/${this.userId}/batches`);
  }

  // Create a new batch
  async createBatch(batch: Omit<Batch, 'id' | 'createdAt' | 'updatedAt'>): Promise<Batch> {
    const newBatchRef = push(this.batchRef);
    const newBatch: Batch = {
      ...batch,
      id: newBatchRef.key!,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await set(newBatchRef, newBatch);
    return newBatch;
  }

  // Get a single batch by ID
  async getBatch(batchId: string): Promise<Batch | null> {
    const batchRef = ref(database, `users/${this.userId}/batches/${batchId}`);
    const snapshot = await get(batchRef);
    return snapshot.val();
  }

  // Get all batches
  async getAllBatches(): Promise<Batch[]> {
    const snapshot = await get(this.batchRef);
    const batches: Batch[] = [];
    snapshot.forEach((childSnapshot) => {
      batches.push(childSnapshot.val());
    });
    return batches;
  }

  // Update a batch
  async updateBatch(batchId: string, updates: Partial<Batch>): Promise<void> {
    const batchRef = ref(database, `users/${this.userId}/batches/${batchId}`);
    await update(batchRef, {
      ...updates,
      updatedAt: Date.now(),
    });
  }

  // Delete a batch
  async deleteBatch(batchId: string): Promise<void> {
    const batchRef = ref(database, `users/${this.userId}/batches/${batchId}`);
    await remove(batchRef);
  }

  /**
   * Clear all batch data for the current user
   */
  public async clearAllData(): Promise<void> {
    if (!this.userId) {
      throw new Error('BatchService not initialized');
    }

    // Only clear batches, not the entire user structure
    await set(this.batchRef, {});
  }

  // Subscribe to batch updates
  subscribeToBatches(callback: (batches: Batch[]) => void): () => void {
    onValue(this.batchRef, (snapshot) => {
      const batches: Batch[] = [];
      snapshot.forEach((childSnapshot) => {
        batches.push(childSnapshot.val());
      });
      callback(batches);
    });

    // Return unsubscribe function
    return () => off(this.batchRef);
  }

  // Add a measurement to a batch
  async addMeasurement(
    batchId: string,
    type: 'ph' | 'temperature',
    value: number,
    notes?: string
  ): Promise<void> {
    const measurement = {
      timestamp: Date.now(),
      value,
      notes,
    };

    const batchRef = ref(database, `users/${this.userId}/batches/${batchId}`);
    const snapshot = await get(batchRef);
    const batch = snapshot.val() as Batch;

    const measurements = batch.measurements[type] || [];
    measurements.push(measurement);

    await update(batchRef, {
      [`measurements.${type}`]: measurements,
      updatedAt: Date.now(),
    });
  }

  // Update a task in a checklist
  async updateTask(
    batchId: string,
    checklistId: string,
    taskId: string,
    updates: Partial<Batch['checklists'][0]['tasks'][0]>
  ): Promise<void> {
    const batchRef = ref(database, `users/${this.userId}/batches/${batchId}`);
    const snapshot = await get(batchRef);
    const batch = snapshot.val() as Batch;

    const checklist = batch.checklists.find(c => c.id === checklistId);
    if (!checklist) throw new Error('Checklist not found');

    const taskIndex = checklist.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) throw new Error('Task not found');

    checklist.tasks[taskIndex] = {
      ...checklist.tasks[taskIndex],
      ...updates,
    };

    await update(batchRef, {
      [`checklists.${batch.checklists.findIndex(c => c.id === checklistId)}`]: checklist,
      updatedAt: Date.now(),
    });
  }

  /**
   * Seed sample data for testing
   */
  async seedSampleData(userId: string): Promise<void> {
    if (!this.userId) {
      throw new Error('BatchService not initialized');
    }

    const teaTypes = ['green', 'black', 'oolong', 'white', 'pu-erh'] as const;
    const stages = ['1F', '2F', 'KEGGED', 'BOTTLED', 'COMPLETED'] as const;
    const flavors = ['LimeAid', 'POG', 'Ginger', 'Blueberry', 'Mango', 'Strawberry', 'Lemon', 'Raspberry'] as const;
    const equipmentIds = ['EQ-001', 'EQ-002', 'EQ-003', 'EQ-004', 'EQ-005'];

    const generateRandomDate = (daysAgo: number) => {
      return Date.now() - Math.random() * daysAgo * 24 * 60 * 60 * 1000;
    };

    const generateRandomBatchCode = (index: number) => {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
      return `${year}${month}${day}-${String(index + 1).padStart(4, '0')}-${random}`;
    };

    const sampleBatches = Array.from({ length: 10 }, (_, index) => {
      const stage = stages[Math.floor(Math.random() * stages.length)];
      const flavor = flavors[Math.floor(Math.random() * flavors.length)];
      const teaType = teaTypes[Math.floor(Math.random() * teaTypes.length)];
      const equipmentId = equipmentIds[Math.floor(Math.random() * equipmentIds.length)];
      const batchDate = generateRandomDate(30);
      
      const batch: Omit<BatchSchema, 'id'> = {
        metadata: {
          id: `BATCH-${index + 1}`,
          name: `${flavor} ${stage}`,
          description: `Sample batch ${index + 1} with ${teaType} tea and ${flavor} flavoring`,
          batchNumber: index + 1,
          batchDate,
          createdBy: userId,
          createdAt: batchDate,
          updatedAt: Date.now()
        },
        recipe: {
          teaType,
          sugarAmount: 1,
          starterAmount: 2,
          volume: 5
        },
        currentStage: {
          stage,
          startTime: batchDate,
          equipmentId,
          notes: `Started ${stage} fermentation`
        },
        batchCode: {
          code: generateRandomBatchCode(index),
          parentCode: null,
          lineage: []
        },
        qualityChecks: []
      };

      // Add quality checks for completed batches
      if (stage === 'COMPLETED') {
        batch.qualityChecks = [
          {
            id: `QC-${index}-1`,
            type: 'ph',
            timestamp: batchDate + 14 * 24 * 60 * 60 * 1000,
            passed: Math.random() > 0.2,
            notes: 'Final pH check',
            performedBy: userId,
            measurements: [
              {
                type: 'ph',
                value: 3.2 + Math.random() * 0.3,
                unit: 'pH'
              }
            ]
          },
          {
            id: `QC-${index}-2`,
            type: 'taste',
            timestamp: batchDate + 14 * 24 * 60 * 60 * 1000,
            passed: Math.random() > 0.1,
            notes: 'Final taste test',
            performedBy: userId,
            measurements: []
          }
        ];
      }

      return batch;
    });

    for (const batch of sampleBatches) {
      await this.batchRepository.create(batch);
    }
  }
} 