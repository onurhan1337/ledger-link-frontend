import { create } from 'zustand';
import { config } from '@/config';

interface User {
  id: number;
  email: string;
  username: string;
  role: string;
  balance?: {
    amount: string;
    lastUpdatedAt: string;
    updatedAt: string;
    createdAt: string;
  };
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const setCookie = (name: string, value: string) => {
  document.cookie = `${name}=${value}; path=/`;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    const response = await fetch(`${config.apiBaseUrl}${config.endpoints.auth.login}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to login');
    }

    const { token } = await response.json();
    
    const userResponse = await fetch(`${config.apiBaseUrl}/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!userResponse.ok) {
      throw new Error('Failed to get user details');
    }

    const user = await userResponse.json();
    
    set({
      token,
      user,
      isAuthenticated: true,
    });

    localStorage.setItem('token', token);
    setCookie('token', token);
  },

  register: async (email: string, password: string, username: string) => {
    console.log('Starting registration...');
    try {
      const response = await fetch(`${config.apiBaseUrl}${config.endpoints.auth.register}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email,
          password,
          username
        })
      });

      console.log('Registration response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
        console.error('Registration error:', errorData);
        throw new Error(errorData.error || `Registration failed with status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Registration response:', data);

      const { token } = data;

      const userResponse = await fetch(`${config.apiBaseUrl}${config.endpoints.users.me}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        credentials: 'include'
      });

      if (!userResponse.ok) {
        throw new Error('Failed to get user details');
      }

      const user = await userResponse.json();

      set({ 
        token, 
        user,
        isAuthenticated: true 
      });

      localStorage.setItem('token', token);
      setCookie('token', token);
    } catch (error) {
      console.error('Registration error details:', error);
      throw error;
    }
  },

  refreshToken: async () => {
    const currentToken = localStorage.getItem('token');
    if (!currentToken) return;

    try {
      const response = await fetch(`${config.apiBaseUrl}${config.endpoints.auth.refresh}`, {
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      });

      if (!response.ok) throw new Error('Failed to refresh token');

      const { token } = await response.json();
      localStorage.setItem('token', token);
      set(state => ({ ...state, token }));
    } catch (error) {
      console.error('Token refresh error:', error);
    }
  },

  logout: async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await fetch(`${config.apiBaseUrl}${config.endpoints.auth.logout}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    
    localStorage.removeItem('token');
    setCookie('token', '');
    set({
      token: null,
      user: null,
      isAuthenticated: false,
    });
  },
})); 