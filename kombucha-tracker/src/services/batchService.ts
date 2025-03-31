import { ref, get, set, push, update, remove, onValue, off } from 'firebase/database';
import { database } from './firebase';
import { Batch, FirebaseBatchData } from '../types/batch';

export class BatchService {
  private static instance: BatchService;
  private userId: string | null = null;

  private constructor() {}

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
    const batchTypes = ['1F', '2F', 'KEG', 'BOTTLE'] as const;
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
      return {
        code: `${year}${month}${day}-${String(index + 1).padStart(4, '0')}-${random}`,
        childCodes: [],
        lineage: []
      };
    };

    const generateRandomTasks = (stage: typeof stages[number]) => {
      const tasks = [];
      switch (stage) {
        case '1F':
          tasks.push(
            { id: '1', title: 'Steep tea', completed: Math.random() > 0.5, notes: 'Steep for 15 minutes' },
            { id: '2', title: 'Add sugar', completed: Math.random() > 0.5, notes: '2 cups per gallon' },
            { id: '3', title: 'Cool to room temp', completed: Math.random() > 0.5, notes: 'Wait until below 85°F' },
            { id: '4', title: 'Add starter', completed: Math.random() > 0.5, notes: '2 cups per gallon' },
            { id: '5', title: 'Check pH', completed: Math.random() > 0.5, notes: 'Should be around 3.5' }
          );
          break;
        case '2F':
          tasks.push(
            { id: '1', title: 'Transfer to 2F', completed: Math.random() > 0.5, notes: 'Use sanitized equipment' },
            { id: '2', title: 'Add flavoring', completed: Math.random() > 0.5, notes: 'Add fruit or juice' },
            { id: '3', title: 'Check carbonation', completed: Math.random() > 0.5, notes: 'Should be fizzy' },
            { id: '4', title: 'Taste test', completed: Math.random() > 0.5, notes: 'Check flavor balance' }
          );
          break;
        case 'KEGGED':
          tasks.push(
            { id: '1', title: 'Transfer to keg', completed: Math.random() > 0.5, notes: 'Use CO2 to purge' },
            { id: '2', title: 'Pressurize', completed: Math.random() > 0.5, notes: 'Set to 30 PSI' },
            { id: '3', title: 'Check pressure', completed: Math.random() > 0.5, notes: 'Should hold pressure' }
          );
          break;
        case 'BOTTLED':
          tasks.push(
            { id: '1', title: 'Bottle batch', completed: Math.random() > 0.5, notes: 'Fill to 1 inch from top' },
            { id: '2', title: 'Label bottles', completed: Math.random() > 0.5, notes: 'Include batch code' },
            { id: '3', title: 'Store for carbonation', completed: Math.random() > 0.5, notes: 'Room temp for 3-7 days' }
          );
          break;
        case 'COMPLETED':
          tasks.push(
            { id: '1', title: 'Final taste test', completed: true, notes: 'Check flavor and carbonation' },
            { id: '2', title: 'Record final pH', completed: true, notes: 'Should be below 3.5' },
            { id: '3', title: 'Update documentation', completed: true, notes: 'Record all measurements' }
          );
          break;
      }
      return tasks;
    };

    const sampleBatches = Array.from({ length: 10 }, (_, index) => {
      const stage = stages[Math.floor(Math.random() * stages.length)];
      const flavor = flavors[Math.floor(Math.random() * flavors.length)];
      const teaType = teaTypes[Math.floor(Math.random() * teaTypes.length)];
      const batchType = batchTypes[Math.floor(Math.random() * batchTypes.length)];
      const equipmentId = equipmentIds[Math.floor(Math.random() * equipmentIds.length)];
      const batchDate = generateRandomDate(30);
      
      const batchCode = generateRandomBatchCode(index);
      const tasks = generateRandomTasks(stage);
      
      const batch: Omit<Batch, 'id' | 'createdAt' | 'updatedAt'> = {
        name: `${flavor} ${stage}`,
        description: `Sample batch ${index + 1} with ${teaType} tea and ${flavor} flavoring`,
        batchCode,
        batchNumber: index + 1,
        batchDate,
        batchType,
        stage,
        stageHistory: [{
          stage,
          startTime: batchDate,
          equipmentId,
          notes: `Started ${stage} fermentation`
        }],
        currentEquipmentId: equipmentId,
        equipmentHistory: [{
          equipmentId,
          startTime: batchDate,
          notes: `Initial equipment assignment`
        }],
        childBatchIds: [],
        splitPortions: [],
        measurements: {
          ph: Array.from({ length: Math.floor(Math.random() * 5) }, (_, i) => ({
            timestamp: batchDate + i * 24 * 60 * 60 * 1000,
            value: 3.2 + Math.random() * 0.3,
            notes: `pH measurement ${i + 1}`
          })),
          temperature: Array.from({ length: Math.floor(Math.random() * 5) }, (_, i) => ({
            timestamp: batchDate + i * 24 * 60 * 60 * 1000,
            value: 72 + Math.random() * 5,
            notes: `Temperature reading ${i + 1}`
          }))
        },
        checklists: [],
        volume: 5, // Default 5 gallon batch
        teaType,
        sugarAmount: 1, // Default 1 cup
        starterAmount: 2, // Default 2 cups
        createdBy: userId,
        lastModifiedBy: userId,
        notes: `Sample batch ${index + 1}`
      };

      if (stage === 'BOTTLED' || stage === 'COMPLETED') {
        batch.finishingDetails = {
          type: 'BOTTLE',
          containerIds: ['CNT-001', 'CNT-002'],
          date: batchDate + 14 * 24 * 60 * 60 * 1000,
          volume: batch.volume,
          carbonationLevel: 2.5 + Math.random(),
          notes: 'Bottled and stored for carbonation'
        };
      }

      return batch;
    });

    for (const batch of sampleBatches) {
      await this.createBatch(batch);
    }
  }
} 