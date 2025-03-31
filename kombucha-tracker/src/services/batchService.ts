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

  private get userBatchesRef() {
    if (!this.userId) throw new Error('User ID not set');
    return ref(database, `users/${this.userId}/batches`);
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

  // Subscribe to batch updates
  subscribeToBatches(callback: (batches: Batch[]) => void): () => void {
    const batchesRef = this.batchRef;
    onValue(batchesRef, (snapshot) => {
      const batches: Batch[] = [];
      snapshot.forEach((childSnapshot) => {
        batches.push(childSnapshot.val());
      });
      callback(batches);
    });

    // Return unsubscribe function
    return () => off(batchesRef);
  }

  // Add a measurement to a batch
  async addMeasurement(
    batchId: string,
    type: 'ph' | 'temperature' | 'gravity',
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
} 