import { BaseRepository } from './baseRepository';
import { 
  Batch, 
  BatchSchema, 
  Stage, 
  StageSchema,
  MeasurementSchema,
  Measurement
} from '../schemas/batch';
import { ref, get, set, push, update } from 'firebase/database';
import { database } from '../services/firebase';

export class BatchRepository extends BaseRepository<Batch, typeof BatchSchema> {
  constructor() {
    super('batches', BatchSchema);
  }

  async addStage(batchId: string, stage: Omit<Stage, 'id'>): Promise<void> {
    const stageRef = ref(database, `stages/${batchId}/${push(ref(database)).key}`);
    const newStage = {
      ...stage,
      id: stageRef.key!
    };

    try {
      const validatedStage = StageSchema.parse(newStage);
      await set(stageRef, validatedStage);
    } catch (error) {
      console.error(`Validation error adding stage to batch ${batchId}:`, error);
      throw error;
    }
  }

  async getStages(batchId: string): Promise<Stage[]> {
    const stagesRef = ref(database, `stages/${batchId}`);
    const snapshot = await get(stagesRef);
    if (!snapshot.exists()) return [];

    const stages: Stage[] = [];
    snapshot.forEach((childSnapshot) => {
      try {
        stages.push(StageSchema.parse(childSnapshot.val()));
      } catch (error) {
        console.error(`Validation error for stage in batch ${batchId}:`, error);
      }
    });
    return stages;
  }

  async addMeasurement(
    batchId: string,
    type: 'ph' | 'temperature',
    value: number,
    notes?: string
  ): Promise<void> {
    const measurementRef = ref(database, `measurements/${batchId}/${push(ref(database)).key}`);
    const measurement = {
      type,
      value,
      timestamp: Date.now(),
      notes: notes || '',
      id: measurementRef.key!
    };

    try {
      const validatedMeasurement = MeasurementSchema.parse(measurement);
      await set(measurementRef, validatedMeasurement);
    } catch (error) {
      console.error(`Validation error adding measurement to batch ${batchId}:`, error);
      throw error;
    }
  }

  async getMeasurements(batchId: string): Promise<Measurement[]> {
    const measurementsRef = ref(database, `measurements/${batchId}`);
    const snapshot = await get(measurementsRef);
    if (!snapshot.exists()) return [];

    const measurements: Measurement[] = [];
    snapshot.forEach((childSnapshot) => {
      try {
        measurements.push(MeasurementSchema.parse(childSnapshot.val()));
      } catch (error) {
        console.error(`Validation error for measurement in batch ${batchId}:`, error);
      }
    });
    return measurements;
  }

  async updateStage(batchId: string, stageId: string, updates: Partial<Stage>): Promise<void> {
    const stageRef = ref(database, `stages/${batchId}/${stageId}`);
    const currentStage = await get(stageRef);
    
    if (!currentStage.exists()) {
      throw new Error(`Stage ${stageId} not found in batch ${batchId}`);
    }

    try {
      const updatedStage = {
        ...currentStage.val(),
        ...updates,
        updatedAt: Date.now()
      };
      const validatedStage = StageSchema.parse(updatedStage);
      await update(stageRef, validatedStage);
    } catch (error) {
      console.error(`Validation error updating stage ${stageId} in batch ${batchId}:`, error);
      throw error;
    }
  }
} 