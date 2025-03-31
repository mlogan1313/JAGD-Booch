import { BaseRepository } from './baseRepository';
import { 
  QualityControl, 
  QualityControlSchema,
  QualityCheckSchema
} from '../schemas/batch';
import { ref, get, set, update } from 'firebase/database';
import { database } from '../services/firebase';

export class QualityRepository extends BaseRepository<QualityControl, typeof QualityControlSchema> {
  constructor() {
    super('quality', QualityControlSchema);
  }

  async addQualityCheck(
    batchId: string,
    check: {
      type: 'ph' | 'temperature' | 'taste' | 'visual';
      value?: number;
      notes?: string;
      passed: boolean;
    }
  ): Promise<void> {
    const qualityRef = ref(database, `quality/${batchId}/${push(ref(database)).key}`);
    const newCheck = {
      ...check,
      timestamp: Date.now(),
      id: qualityRef.key!
    };

    try {
      const validatedCheck = QualityCheckSchema.parse(newCheck);
      await set(qualityRef, validatedCheck);
    } catch (error) {
      console.error(`Validation error adding quality check to batch ${batchId}:`, error);
      throw error;
    }
  }

  async getQualityChecks(batchId: string): Promise<QualityCheck[]> {
    const qualityRef = ref(database, `quality/${batchId}`);
    const snapshot = await get(qualityRef);
    if (!snapshot.exists()) return [];

    const checks: QualityCheck[] = [];
    snapshot.forEach((childSnapshot) => {
      try {
        checks.push(QualityCheckSchema.parse(childSnapshot.val()));
      } catch (error) {
        console.error(`Validation error for quality check in batch ${batchId}:`, error);
      }
    });
    return checks;
  }

  async getFailedChecks(batchId: string): Promise<QualityCheck[]> {
    const qualityRef = ref(database, `quality/${batchId}`);
    const snapshot = await get(qualityRef);
    if (!snapshot.exists()) return [];

    const checks: QualityCheck[] = [];
    snapshot.forEach((childSnapshot) => {
      try {
        const checkData = childSnapshot.val();
        if (!checkData.passed) {
          checks.push(QualityCheckSchema.parse(checkData));
        }
      } catch (error) {
        console.error(`Validation error for quality check in batch ${batchId}:`, error);
      }
    });
    return checks;
  }

  async getQualityChecksByType(
    batchId: string,
    type: 'ph' | 'temperature' | 'taste' | 'visual'
  ): Promise<QualityCheck[]> {
    const qualityRef = ref(database, `quality/${batchId}`);
    const snapshot = await get(qualityRef);
    if (!snapshot.exists()) return [];

    const checks: QualityCheck[] = [];
    snapshot.forEach((childSnapshot) => {
      try {
        const checkData = childSnapshot.val();
        if (checkData.type === type) {
          checks.push(QualityCheckSchema.parse(checkData));
        }
      } catch (error) {
        console.error(`Validation error for quality check in batch ${batchId}:`, error);
      }
    });
    return checks;
  }
} 