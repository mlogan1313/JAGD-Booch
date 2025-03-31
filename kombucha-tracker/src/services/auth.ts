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
      // Exchange the code for an access token
      const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          client_id: GITHUB_CLIENT_ID,
          client_secret: import.meta.env.VITE_GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: REDIRECT_URI,
        }),
      });

      if (!tokenResponse.ok) throw new Error('Failed to exchange code for token');

      const { access_token } = await tokenResponse.json();

      // Fetch user data with the access token
      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      if (!userResponse.ok) throw new Error('Failed to fetch user');

      const user = await userResponse.json();
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