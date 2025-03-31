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
    console.log('Redirecting to GitHub:', githubAuthUrl);
    window.location.href = githubAuthUrl;
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    set({ user: null, isAuthenticated: false });
  },

  handleCallback: async (code: string) => {
    try {
      set({ isLoading: true });
      console.log('Exchanging code for token...');
      
      // Exchange the code for an access token using the proxy
      const tokenResponse = await fetch('/api/oauth/login/oauth/access_token', {
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

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('Token exchange failed:', errorText);
        throw new Error('Failed to exchange code for token');
      }

      const { access_token } = await tokenResponse.json();
      console.log('Token exchange successful');

      // Store the access token
      localStorage.setItem('access_token', access_token);

      // Fetch user data with the access token using the proxy
      const userResponse = await fetch('/api/github/user', {
        headers: {
          Authorization: `Bearer ${access_token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (!userResponse.ok) {
        const errorText = await userResponse.text();
        console.error('User fetch failed:', errorText);
        throw new Error('Failed to fetch user');
      }

      const user = await userResponse.json();
      
      // Store user data and update state
      localStorage.setItem('user', JSON.stringify(user));
      set({ 
        user, 
        isAuthenticated: true, 
        isLoading: false 
      });
      
      console.log('Auth state updated:', { user, isAuthenticated: true });
    } catch (error) {
      console.error('Authentication error:', error);
      set({ isLoading: false });
      throw error;
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