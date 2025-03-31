import { BaseRepository } from './baseRepository';
import { 
  UserProfile, 
  UserProfileSchema,
  UserRoleSchema
} from '../schemas/batch';
import { ref, get, set, update } from 'firebase/database';
import { database } from '../services/firebase';

type UserRole = 'admin' | 'brewer' | 'viewer';

export class UserRepository extends BaseRepository<UserProfile, typeof UserProfileSchema> {
  constructor() {
    super('users', UserProfileSchema);
  }

  async updateRole(userId: string, role: UserRole): Promise<void> {
    const userRef = ref(database, `users/${userId}`);
    const currentUser = await get(userRef);
    
    if (!currentUser.exists()) {
      throw new Error(`User ${userId} not found`);
    }

    try {
      const validatedRole = UserRoleSchema.parse(role);
      await update(userRef, { role: validatedRole });
    } catch (error) {
      console.error(`Error updating role for user ${userId}:`, error);
      throw error;
    }
  }

  async updateLastLogin(userId: string): Promise<void> {
    const userRef = ref(database, `users/${userId}`);
    await update(userRef, { lastLogin: Date.now() });
  }

  async getUsersByRole(role: UserRole): Promise<UserProfile[]> {
    const usersRef = ref(database, 'users');
    const snapshot = await get(usersRef);
    if (!snapshot.exists()) return [];

    const users: UserProfile[] = [];
    snapshot.forEach((childSnapshot) => {
      try {
        const userData = childSnapshot.val();
        if (userData.role === role) {
          users.push(UserProfileSchema.parse(userData));
        }
      } catch (error) {
        console.error(`Validation error for user:`, error);
      }
    });
    return users;
  }

  async deactivateUser(userId: string): Promise<void> {
    const userRef = ref(database, `users/${userId}`);
    await update(userRef, { 
      isActive: false,
      deactivatedAt: Date.now()
    });
  }

  async reactivateUser(userId: string): Promise<void> {
    const userRef = ref(database, `users/${userId}`);
    await update(userRef, { 
      isActive: true,
      deactivatedAt: null
    });
  }
} 