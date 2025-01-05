'use client';

import { createContext, useContext } from 'react';
import { useAuthStore } from '@/store/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  token: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refreshToken: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { token, isAuthenticated, login, register, logout } = useAuthStore();

  const value = {
    isAuthenticated,
    token,
    login,
    register,
    logout,
    refreshToken: async () => {},
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 