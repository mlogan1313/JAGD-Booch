import { create } from 'zustand';
import { Batch } from '../types/batch';
import { BatchService } from '../services/batchService';

interface BatchState {
  batches: Batch[];
  isLoading: boolean;
  error: string | null;
  batchService: BatchService | null;
  setBatchService: (service: BatchService | null) => void;
  fetchBatches: () => Promise<void>;
  getBatch: (id: string) => Batch | undefined;
  createBatch: (batch: Omit<Batch, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Batch>;
  updateBatch: (id: string, updates: Partial<Batch>) => Promise<void>;
  deleteBatch: (id: string) => Promise<void>;
  addMeasurement: (batchId: string, type: 'ph' | 'temperature' | 'gravity', value: number, notes?: string) => Promise<void>;
  updateTask: (batchId: string, checklistId: string, taskId: string, updates: Partial<Batch['checklists'][0]['tasks'][0]>) => Promise<void>;
}

export const useBatchStore = create<BatchState>((set, get) => ({
  batches: [],
  isLoading: false,
  error: null,
  batchService: null,

  setBatchService: (service: BatchService | null) => {
    set({ batchService: service });
  },

  fetchBatches: async () => {
    const { batchService } = get();
    if (!batchService) {
      set({ error: 'Batch service not initialized' });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const batches = await batchService.getAllBatches();
      set({ batches });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch batches' });
    } finally {
      set({ isLoading: false });
    }
  },

  getBatch: (id: string) => {
    const { batches } = get();
    return batches.find(batch => batch.id === id);
  },

  createBatch: async (batch) => {
    const { batchService } = get();
    if (!batchService) {
      throw new Error('Batch service not initialized');
    }

    set({ isLoading: true, error: null });
    try {
      const newBatch = await batchService.createBatch(batch);
      set(state => ({ batches: [...state.batches, newBatch] }));
      return newBatch;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to create batch' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateBatch: async (id, updates) => {
    const { batchService } = get();
    if (!batchService) {
      throw new Error('Batch service not initialized');
    }

    set({ isLoading: true, error: null });
    try {
      await batchService.updateBatch(id, updates);
      set(state => ({
        batches: state.batches.map(batch =>
          batch.id === id ? { ...batch, ...updates } : batch
        ),
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update batch' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteBatch: async (id) => {
    const { batchService } = get();
    if (!batchService) {
      throw new Error('Batch service not initialized');
    }

    set({ isLoading: true, error: null });
    try {
      await batchService.deleteBatch(id);
      set(state => ({
        batches: state.batches.filter(batch => batch.id !== id),
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete batch' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  addMeasurement: async (batchId, type, value, notes) => {
    const { batchService } = get();
    if (!batchService) {
      throw new Error('Batch service not initialized');
    }

    set({ isLoading: true, error: null });
    try {
      await batchService.addMeasurement(batchId, type, value, notes);
      await get().fetchBatches(); // Refresh batches to get updated measurements
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to add measurement' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateTask: async (batchId, checklistId, taskId, updates) => {
    const { batchService } = get();
    if (!batchService) {
      throw new Error('Batch service not initialized');
    }

    set({ isLoading: true, error: null });
    try {
      await batchService.updateTask(batchId, checklistId, taskId, updates);
      await get().fetchBatches(); // Refresh batches to get updated tasks
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update task' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
})); 