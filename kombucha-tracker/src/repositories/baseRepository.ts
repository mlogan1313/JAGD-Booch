import { ref, get, set, push, update, remove } from 'firebase/database';
import { database } from '../services/firebase';
import { z } from 'zod';

export class BaseRepository<T, Schema extends z.ZodType<T>> {
  constructor(
    protected readonly path: string,
    protected readonly schema: Schema
  ) {}

  protected getRef(id?: string) {
    return ref(database, id ? `${this.path}/${id}` : this.path);
  }

  async get(id: string): Promise<T | null> {
    const snapshot = await get(this.getRef(id));
    if (!snapshot.exists()) return null;
    
    try {
      return this.schema.parse(snapshot.val());
    } catch (error) {
      console.error(`Validation error for ${this.path}/${id}:`, error);
      return null;
    }
  }

  async getAll(): Promise<T[]> {
    const snapshot = await get(this.getRef());
    if (!snapshot.exists()) return [];

    const results: T[] = [];
    snapshot.forEach((childSnapshot) => {
      try {
        results.push(this.schema.parse(childSnapshot.val()));
      } catch (error) {
        console.error(`Validation error for ${this.path}/${childSnapshot.key}:`, error);
      }
    });
    return results;
  }

  async create(data: Omit<T, 'id'>): Promise<T> {
    const newRef = push(this.getRef());
    const newData = {
      ...data,
      id: newRef.key!
    } as T;

    try {
      const validatedData = this.schema.parse(newData);
      await set(newRef, validatedData);
      return validatedData;
    } catch (error) {
      console.error(`Validation error creating ${this.path}:`, error);
      throw error;
    }
  }

  async update(id: string, data: Partial<T>): Promise<void> {
    try {
      const currentData = await this.get(id);
      if (!currentData) throw new Error(`No data found at ${this.path}/${id}`);

      const updatedData = {
        ...currentData,
        ...data,
        updatedAt: Date.now()
      };

      const validatedData = this.schema.parse(updatedData);
      await update(this.getRef(id), validatedData);
    } catch (error) {
      console.error(`Validation error updating ${this.path}/${id}:`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    await remove(this.getRef(id));
  }

  async validate(data: unknown): Promise<T> {
    return this.schema.parse(data);
  }
} 