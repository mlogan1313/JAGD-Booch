import { ref, get, set, push, update, remove } from 'firebase/database';
import { database } from '../services/firebase';
import { z } from 'zod';

// Helper type to check if an object has specific metadata fields
type HasMetadata = {
  metadata?: {
    createdBy?: string;
    createdAt?: number;
    updatedAt?: number;
  };
  createdBy?: string; // Also check for top-level createdBy
};

export class BaseRepository<T extends HasMetadata, Schema extends z.ZodType<T>> {
  constructor(
    protected readonly path: string,
    protected readonly schema: Schema
  ) {}

  protected getRef(id?: string) {
    return ref(database, id ? `${this.path}/${id}` : this.path);
  }

  // Check if item belongs to the user (handles nested metadata or top-level createdBy)
  protected isUserOwned(item: T, userId: string): boolean {
    if (item.metadata && typeof item.metadata === 'object') {
      return item.metadata.createdBy === userId;
    }
    return item.createdBy === userId;
  }

  async get(id: string, userId: string): Promise<T | null> {
    const snapshot = await get(this.getRef(id));
    if (!snapshot.exists()) return null;

    try {
      const item = this.schema.parse(snapshot.val());
      // Use the helper function to check ownership
      if (this.isUserOwned(item, userId)) {
        return item;
      }
      console.warn(`Access denied or item not found for user ${userId} at ${this.path}/${id}`);
      return null;
    } catch (error) {
      console.error(`Validation error for ${this.path}/${id}:`, error);
      return null;
    }
  }

  async getAll(userId: string): Promise<T[]> {
    const snapshot = await get(this.getRef());
    if (!snapshot.exists()) return [];

    const items: T[] = [];
    snapshot.forEach((childSnapshot) => {
      try {
        const item = this.schema.parse(childSnapshot.val());
        // Use the helper function to check ownership
        if (this.isUserOwned(item, userId)) {
          items.push(item);
        }
      } catch (error) {
        console.error(`Validation error for ${this.path}/${childSnapshot.key}:`, error);
      }
    });
    return items;
  }

  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<T> {
    const newRef = push(this.getRef());
    const newId = newRef.key!;
    const currentTime = Date.now();

    let newData: any = { ...data, id: newId };

    // Check if the target type T expects a nested metadata object
    // We infer this by checking if the provided data *doesn't* have createdBy/createdAt etc.
    // but the schema *might* include a BaseMetadataSchema extension.
    // This is heuristic - a more robust way might involve inspecting the schema structure.
    if ('metadata' in data && typeof (data as any).metadata === 'object') {
        // Assume it has nested metadata structure (like Equipment, Container)
        newData.metadata = {
            ...(data as any).metadata,
            createdBy: userId,
            createdAt: currentTime,
            updatedAt: currentTime,
        };
        // Ensure top-level fields aren't also set if metadata exists
        delete newData.createdBy;
        delete newData.createdAt;
        delete newData.updatedAt;
    } else {
        // Assume it has flat structure (like Batch)
        newData.createdBy = userId;
        newData.createdAt = currentTime;
        newData.updatedAt = currentTime;
    }

    try {
      // Ensure the final structure conforms to the schema before setting
      let validatedData = this.schema.parse(newData);

      // Remove null AND undefined properties before sending to Firebase
      for (const key in validatedData) {
        const value = validatedData[key as keyof T];
        if (value === null || value === undefined) {
          delete validatedData[key as keyof T];
        }
      }
      
      await set(newRef, validatedData);
      return validatedData;
    } catch (error) {
      console.error(`Validation error creating ${this.path}:`, error);
      throw error;
    }
  }

  async update(id: string, data: Partial<T>, userId: string): Promise<void> {
    const currentData = await this.get(id, userId);
    if (!currentData) throw new Error(`No data found at ${this.path}/${id} or access denied`);

    const currentTime = Date.now();
    let updatedData: any = { ...currentData, ...data };

    // Update logic similar to create
    if ('metadata' in currentData && typeof (currentData as any).metadata === 'object') {
        // Handle nested metadata update
        updatedData.metadata = {
            ...(currentData as any).metadata,
            ...(data as any).metadata, // Apply partial updates to metadata too
            updatedAt: currentTime,
        };
        // Ensure flat fields aren't lingering if metadata exists
        delete updatedData.updatedAt; // Only keep the one in metadata
        // Ensure createdBy/createdAt from metadata are preserved if not in partial update `data`
        if (!(data as any).metadata?.createdBy) updatedData.metadata.createdBy = (currentData as any).metadata.createdBy;
        if (!(data as any).metadata?.createdAt) updatedData.metadata.createdAt = (currentData as any).metadata.createdAt;

    } else if ('updatedAt' in currentData) {
        // Handle flat structure update
        updatedData.updatedAt = currentTime;
        // Ensure createdBy/createdAt are preserved if not in partial update `data`
        if (!data.createdBy) updatedData.createdBy = currentData.createdBy;
        if (!(data as any).createdAt) updatedData.createdAt = (currentData as any).createdAt;
    }

    try {
      // Ensure the final structure conforms to the schema before updating
      let validatedData = this.schema.parse(updatedData);

      // Remove null AND undefined properties before sending to Firebase update
      for (const key in validatedData) {
        const value = validatedData[key as keyof T];
        if (value === null || value === undefined) {
          // For update, specifically remove fields that were explicitly set to null/undefined in the input 'data'
          // Don't accidentally remove existing fields from currentData that happen to be null/undefined 
          // unless they were part of the partial 'data' update.
          if (key in data) { // Check if the key was part of the partial update data
             delete validatedData[key as keyof T];
          }
        }
      }

      await update(this.getRef(id), validatedData);
    } catch (error) {
      console.error(`Validation error updating ${this.path}/${id}:`, error);
      throw error;
    }
  }

  async delete(id: string, userId: string): Promise<void> {
    const item = await this.get(id, userId);
    if (!item) throw new Error(`No data found at ${this.path}/${id} or access denied`);
    await remove(this.getRef(id));
  }

  /**
   * Clear all data in the collection (USE WITH CAUTION)
   */
  async clearAll(): Promise<void> {
    console.warn(`Clearing all data at path: ${this.path}`);
    await set(this.getRef(), {});
  }

  // Use safeParse for external validation needs to avoid throwing
  async validate(data: unknown): Promise<{ success: true; data: T } | { success: false; error: z.ZodError }> {
    return this.schema.safeParseAsync(data);
  }
} 