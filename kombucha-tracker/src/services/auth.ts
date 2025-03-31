import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { create } from 'zustand';
import { auth } from './firebase';
import { BatchService } from './batchService';
import { useBatchStore } from '../stores/batchStore';

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
onAuthStateChanged(auth, (user) => {
  if (user) {
    useAuth.setState({
      user,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });

    // Initialize batch service
    const batchService = BatchService.getInstance();
    batchService.setUserId(user.uid);
    useBatchStore.getState().setBatchService(batchService);
    useBatchStore.getState().fetchBatches();
  } else {
    useAuth.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });

    // Clear batch service
    const batchService = BatchService.getInstance();
    batchService.setUserId('');
    useBatchStore.getState().setBatchService(null);
    useBatchStore.getState().batches = [];
  }
});

export class AuthService {
  private static instance: AuthService;

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async signInWithGoogle(): Promise<void> {
    try {
      useAuth.setState({ isLoading: true, error: null });
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Google sign in error:', error);
      useAuth.setState({ error: 'Failed to sign in with Google' });
      throw error;
    } finally {
      useAuth.setState({ isLoading: false });
    }
  }

  async signOut(): Promise<void> {
    try {
      useAuth.setState({ isLoading: true, error: null });
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
      useAuth.setState({ error: 'Failed to sign out' });
      throw error;
    } finally {
      useAuth.setState({ isLoading: false });
    }
  }

  getCurrentUser() {
    return auth.currentUser;
  }
} 