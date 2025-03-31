import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User, signInWithEmailAndPassword } from 'firebase/auth';
import { create } from 'zustand';
import { auth, database } from './firebase';
import { ref, get, set } from 'firebase/database';
import { BatchService } from './batchService';
import { EquipmentService } from './equipmentService';
import { useBatchStore } from '../stores/batchStore';
import { useEquipmentStore } from '../stores/equipmentStore';
import { UserService } from './userService';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
}));

// Initialize auth state
onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      // Check if user structure exists
      const userRef = ref(database, `users/${user.uid}`);
      const userSnapshot = await get(userRef);
      
      if (!userSnapshot.exists()) {
        console.log('Creating user structure for:', user.uid);
        // Create user structure if it doesn't exist
        await set(userRef, {
          batches: {},
          equipment: {},
          containers: {},
          createdAt: Date.now(),
          lastLogin: Date.now(),
          role: 'brewer' // Default role
        });
      } else {
        // Update last login time
        await set(ref(database, `users/${user.uid}/lastLogin`), Date.now());
      }

      useAuth.setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      // Initialize services
      const batchService = BatchService.getInstance();
      batchService.setUserId(user.uid);
      useBatchStore.getState().setBatchService(batchService);
      useBatchStore.getState().fetchBatches();

      const equipmentService = EquipmentService.getInstance();
      equipmentService.initialize(user.uid);
      useEquipmentStore.getState().fetchEquipment();
      useEquipmentStore.getState().fetchContainers();
    } catch (error) {
      console.error('Error initializing user:', error);
      useAuth.setState({
        error: 'Failed to initialize user data',
        isLoading: false
      });
    }
  } else {
    useAuth.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });

    // Clear services
    const batchService = BatchService.getInstance();
    batchService.setUserId('');
    useBatchStore.getState().setBatchService(null);
    useBatchStore.getState().batches = [];

    const equipmentService = EquipmentService.getInstance();
    equipmentService.initialize('');
    useEquipmentStore.getState().equipment = [];
    useEquipmentStore.getState().containers = [];
  }
});

export class AuthService {
  private static instance: AuthService;
  private userService: UserService;

  private constructor() {
    this.userService = UserService.getInstance();
    this.setupAuthStateListener();
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private setupAuthStateListener() {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        this.userService.setUserId(user.uid);
        await this.userService.createUserIfNotExists();
      } else {
        this.userService.setUserId('');
      }
    });
  }

  async signIn(email: string, password: string): Promise<User> {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  }

  async signOut(): Promise<void> {
    await signOut(auth);
  }

  getCurrentUser(): User | null {
    return auth.currentUser;
  }

  async getUserRole(): Promise<'admin' | 'brewer' | 'viewer' | null> {
    return this.userService.getUserRole();
  }
} 