import { create } from 'zustand';

interface User {
  id: string;
  login: string;
  avatar_url: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  handleCallback: (code: string) => Promise<void>;
}

const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_GITHUB_REDIRECT_URI;

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: () => {
    const scope = 'read:user';
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${scope}`;
    window.location.href = githubAuthUrl;
  },

  logout: () => {
    localStorage.removeItem('user');
    set({ user: null, isAuthenticated: false });
  },

  handleCallback: async (code: string) => {
    try {
      // In a real app, you'd exchange the code for a token on your backend
      // For this demo, we'll use the code directly
      const response = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${code}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch user');

      const user = await response.json();
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      console.error('Authentication error:', error);
      set({ isLoading: false });
    }
  },
}));

// Initialize auth state from localStorage
const storedUser = localStorage.getItem('user');
if (storedUser) {
  useAuth.setState({
    user: JSON.parse(storedUser),
    isAuthenticated: true,
    isLoading: false,
  });
} else {
  useAuth.setState({ isLoading: false });
} 