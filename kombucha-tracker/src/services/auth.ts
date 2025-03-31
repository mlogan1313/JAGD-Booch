import { signInWithPopup, GoogleAuthProvider, GithubAuthProvider, signOut, onAuthStateChanged, User, signInWithEmailAndPassword } from 'firebase/auth';
import { create } from 'zustand';
import { auth } from './firebase';
import { UserService } from './userService';
import { UserCredential } from "firebase/auth";
import { z } from 'zod';
import { UserRoleSchema } from '../schemas/user';

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
        console.log('AuthService Listener: User detected', user.uid);
        this.userService.setUserId(user.uid);
        try {
           await this.userService.createUserIfNotExists(user);
           console.log('AuthService Listener: User profile check complete');
           useAuth.setState({ user, isAuthenticated: true, isLoading: false, error: null });
        } catch (error: any) {
           console.error('AuthService Listener: Error ensuring user profile:', error);
           useAuth.setState({ user, isAuthenticated: true, isLoading: false, error: error.message });
        }
      } else {
        console.log('AuthService Listener: No user detected');
        useAuth.setState({ user: null, isAuthenticated: false, isLoading: false, error: null });
      }
    }, (error) => {
        console.error('Auth State Error:', error);
        useAuth.setState({ user: null, isAuthenticated: false, isLoading: false, error: error.message });
    });
  }

  async signIn(email: string, password: string): Promise<User> {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  }

  async signInWithGoogle(): Promise<UserCredential> {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("Google Sign-In successful:", result.user.uid);
      return result;
    } catch (error: any) {
      const errorCode = error.code;
      const errorMessage = error.message;
      const email = error.customData?.email;
      const credential = GoogleAuthProvider.credentialFromError(error);
      console.error("Google Sign-In Error:", errorCode, errorMessage, email, credential);
      throw error;
    }
  }

  async signInWithGitHub(): Promise<UserCredential> {
    const provider = new GithubAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("GitHub Sign-In successful:", result.user.uid);
      return result;
    } catch (error: any) {
      const errorCode = error.code;
      const errorMessage = error.message;
      const email = error.customData?.email;
      const credential = GithubAuthProvider.credentialFromError(error);
      console.error("GitHub Sign-In Error:", errorCode, errorMessage, email, credential);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    await signOut(auth);
    console.log("Sign out successful");
  }

  getCurrentUser(): User | null {
    return auth.currentUser;
  }

  async getUserRole(): Promise<z.infer<typeof UserRoleSchema> | null> {
    return this.userService.getUserRole();
  }
} 