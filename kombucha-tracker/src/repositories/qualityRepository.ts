import { z } from 'zod';
import {
  QualityCheckSchema,
  QualityCheckTypeEnum,
  QualityCheckStatusEnum
} from '../schemas/quality';
import { ref, get, set, push, query, orderByChild, equalTo } from 'firebase/database';
import { database } from '../services/firebase';

// Define the QualityCheck type derived from the schema
export type QualityCheck = z.infer<typeof QualityCheckSchema>;

// This repository manages individual QualityCheck records
// It does NOT extend BaseRepository as QualityCheck doesn't fit HasMetadata
export class QualityRepository {
  protected readonly path: string = 'qualityChecks'; // Store checks directly under this path
  protected readonly schema = QualityCheckSchema;

  constructor() {}

  protected getRef(id?: string) {
    return ref(database, id ? `${this.path}/${id}` : this.path);
  }

  async addQualityCheck(
    // Omit id as it will be generated
    checkData: Omit<QualityCheck, 'id'>
  ): Promise<QualityCheck> {
    const newCheckRef = push(this.getRef()); // Push to generate ID under /qualityChecks/
    const checkId = newCheckRef.key!;

    const newCheck = {
      ...checkData,
      id: checkId, // Add the generated ID
      // Ensure timestamp is set if not provided?
      timestamp: checkData.timestamp || Date.now(),
    };

    try {
      const validatedCheck = this.schema.parse(newCheck);
      await set(newCheckRef, validatedCheck);
      return validatedCheck;
    } catch (error) {
      console.error(`Validation error adding quality check:`, error);
      throw error;
    }
  }

  async getQualityCheck(id: string): Promise<QualityCheck | null> {
    const snapshot = await get(this.getRef(id));
    if (!snapshot.exists()) return null;
    try {
      return this.schema.parse(snapshot.val());
    } catch (error) {
      console.error(`Validation error getting quality check ${id}:`, error);
      return null;
    }
  }

  async getAllQualityChecks(): Promise<QualityCheck[]> {
      const snapshot = await get(this.getRef());
      if (!snapshot.exists()) return [];
      const checks: QualityCheck[] = [];
      snapshot.forEach((childSnapshot) => {
          try {
              checks.push(this.schema.parse(childSnapshot.val()));
          } catch (error) {
              console.error(`Validation error parsing quality check ${childSnapshot.key}:`, error);
          }
      });
      return checks;
  }

  // --- Query Methods (Example) ---
  // Consider adding indexes in Firebase rules for performance

  async getQualityChecksForBatch(batchId: string): Promise<QualityCheck[]> {
    const checksQuery = query(this.getRef(), orderByChild('batchId'), equalTo(batchId));
    const snapshot = await get(checksQuery);
    if (!snapshot.exists()) return [];
    const checks: QualityCheck[] = [];
    snapshot.forEach((childSnapshot) => {
      try {
        checks.push(this.schema.parse(childSnapshot.val()));
      } catch (error) {
        console.error(`Validation error parsing quality check for batch ${batchId}: ${childSnapshot.key}`, error);
      }
    });
    return checks;
  }

  async getFailedChecksForBatch(batchId: string): Promise<QualityCheck[]> {
    const batchChecks = await this.getQualityChecksForBatch(batchId);
    return batchChecks.filter(check => check.status === QualityCheckStatusEnum.Enum.FAIL);
  }

  async getQualityChecksByTypeForBatch(
    batchId: string,
    type: z.infer<typeof QualityCheckTypeEnum>
  ): Promise<QualityCheck[]> {
     const batchChecks = await this.getQualityChecksForBatch(batchId);
     return batchChecks.filter(check => check.type === type);
  }
} 