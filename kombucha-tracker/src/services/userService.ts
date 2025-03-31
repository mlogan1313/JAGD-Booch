import { ref, get, set, update } from 'firebase/database';
import { database } from './firebase';
import { UserProfile, UserRoleSchema } from '../schemas/user';
import { UserRepository } from '../repositories/userRepository';
import { z } from 'zod';
import { User } from 'firebase/auth';

export class UserService {
  private static instance: UserService;
  private userId: string | null = null;
  private userRepository: UserRepository;

  private constructor() {
    this.userRepository = new UserRepository();
  }

  static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  private ensureUserId(): string {
    if (!this.userId) throw new Error('UserService: User ID not set');
    return this.userId;
  }

  async getUser(): Promise<UserProfile | null> {
    const userId = this.ensureUserId();
    return this.userRepository.get(userId);
  }

  async createUserIfNotExists(firebaseUser: User): Promise<UserProfile> {
    const userId = this.ensureUserId();
    if (userId !== firebaseUser.uid) {
      throw new Error(`Mismatched user IDs in UserService: ${userId} vs ${firebaseUser.uid}`);
    }

    let userProfile = await this.userRepository.get(userId);
    if (!userProfile) {
      console.log(`Creating user profile for ${userId}...`);
      const currentTime = Date.now();
      const newUserProfileData: Pick<UserProfile, 'displayName' | 'email' | 'role' | 'isActive' | 'lastLogin' | 'deactivatedAt' | 'createdBy'> = {
        displayName: firebaseUser.displayName || 'Unnamed User',
        email: firebaseUser.email || 'no-email@example.com',
        role: UserRoleSchema.Enum.brewer,
        isActive: true,
        lastLogin: currentTime,
        deactivatedAt: null,
        createdBy: userId
      };
      userProfile = await this.userRepository.create(newUserProfileData, userId);
    } else {
      const newLastLogin = Date.now();
      await this.userRepository.update(userId, { lastLogin: newLastLogin }, userId);
      userProfile.lastLogin = newLastLogin;
    }
    return userProfile;
  }

  async updateUserRole(role: z.infer<typeof UserRoleSchema>): Promise<void> {
    const userId = this.ensureUserId();
    await this.userRepository.updateRole(userId, role);
  }

  async getUserRole(): Promise<z.infer<typeof UserRoleSchema> | null> {
    const user = await this.getUser();
    return user?.role || null;
  }
} 