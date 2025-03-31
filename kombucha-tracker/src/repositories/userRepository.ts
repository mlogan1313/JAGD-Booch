import { BaseRepository } from './baseRepository';
import { UserProfile, UserProfileSchema, UserRoleSchema } from '../schemas/user';
import { ref, get, set, push, update, remove } from 'firebase/database';
import { database } from '../services/firebase';
import { z } from 'zod';

export class UserRepository extends BaseRepository<UserProfile, typeof UserProfileSchema> {

  constructor() {
    // Call the BaseRepository constructor
    super('users', UserProfileSchema);
  }

  // Override BaseRepository.get to remove isUserOwned check for /users path
  async get(id: string): Promise<UserProfile | null> {
    const userRef = this.getRef(id);
    const snapshot = await get(userRef);
    if (!snapshot.exists()) return null;
    const rawData = snapshot.val();
    try {
      const parsedData = this.schema.parse(rawData);
      return parsedData;
    } catch (error) {
      console.error(`Validation error for user ${id}:`, error);
      return null;
    }
  }

  // --- REMOVE Redundant BaseRepository method overrides ---
  // getRef, get, getAll, create, update, delete are now inherited

  // --- KEEP User specific methods ---

  async updateRole(userId: string, role: z.infer<typeof UserRoleSchema>): Promise<void> {
    const validatedRole = UserRoleSchema.parse(role);
    // Pass userId as the third argument to inherited update
    await this.update(userId, { role: validatedRole }, userId);
  }

  async updateLastLogin(userId: string): Promise<void> {
    // Pass userId as the third argument to inherited update
    await this.update(userId, { lastLogin: Date.now() }, userId);
  }

  async getUsersByRole(role: z.infer<typeof UserRoleSchema>): Promise<UserProfile[]> {
    const validatedRole = UserRoleSchema.parse(role);
    // Cannot use inherited getAll(userId) as it filters by creator.
    // Implement direct fetch for all users for this specific need.
    const snapshot = await get(this.getRef()); // Use inherited getRef()
    if (!snapshot.exists()) return [];

    const items: UserProfile[] = [];
    snapshot.forEach((childSnapshot) => {
      try {
        const item = this.schema.parse(childSnapshot.val());
        if (item.role === validatedRole) { // Filter here
          items.push(item);
        }
      } catch (error) {
        console.error(`Validation error parsing user ${childSnapshot.key} in getUsersByRole:`, error);
      }
    });
    return items;
  }

  async deactivateUser(userId: string): Promise<void> {
    // Pass userId as the third argument to inherited update
    await this.update(userId, {
      isActive: false,
      deactivatedAt: Date.now()
    }, userId);
  }

  async reactivateUser(userId: string): Promise<void> {
    // Pass userId as the third argument to inherited update
    await this.update(userId, {
      isActive: true,
      deactivatedAt: null // Set back to null
    }, userId);
  }

  // Override BaseRepository.create to use userId as the key, not a push ID
  async create(data: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<UserProfile> {
    const userRef = this.getRef(userId); // Get ref to /users/{userId}
    const currentTime = Date.now();

    const newUserProfileData = {
      ...data,
      id: userId,
      createdAt: currentTime,
      updatedAt: currentTime,
    };

    try {
      let validatedData = this.schema.parse(newUserProfileData);

      for (const key in validatedData) {
        if (validatedData[key as keyof UserProfile] === null) {
          delete validatedData[key as keyof UserProfile];
        }
      }
      
      await set(userRef, validatedData);
      return validatedData;
    } catch (error) {
      console.error(`Validation error for user ${userId}:`, error);
      throw error;
    }
  }
} 