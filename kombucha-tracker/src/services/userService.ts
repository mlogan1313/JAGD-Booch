import { ref, get, set, update } from 'firebase/database';
import { database } from './firebase';

interface UserData {
  batches: Record<string, any>;
  equipment: Record<string, any>;
  containers: Record<string, any>;
  createdAt: number;
  lastLogin: number;
  role: 'admin' | 'brewer' | 'viewer';
}

export class UserService {
  private static instance: UserService;
  private userId: string | null = null;

  private constructor() {}

  static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  private get userRef() {
    if (!this.userId) throw new Error('User ID not set');
    return ref(database, `users/${this.userId}`);
  }

  async getUser(): Promise<UserData | null> {
    const snapshot = await get(this.userRef);
    return snapshot.val();
  }

  async createUserIfNotExists(): Promise<void> {
    const snapshot = await get(this.userRef);
    if (!snapshot.exists()) {
      const userData: UserData = {
        batches: {},
        equipment: {},
        containers: {},
        createdAt: Date.now(),
        lastLogin: Date.now(),
        role: 'brewer' // Default role
      };
      await set(this.userRef, userData);
    } else {
      // Update last login even if user exists
      await update(this.userRef, {
        lastLogin: Date.now()
      });
    }
  }

  async updateUserRole(role: UserData['role']): Promise<void> {
    await update(this.userRef, {
      role
    });
  }

  async getUserRole(): Promise<UserData['role'] | null> {
    const user = await this.getUser();
    return user?.role || null;
  }
} 