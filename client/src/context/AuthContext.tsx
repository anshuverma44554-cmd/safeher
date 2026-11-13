import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Guardian, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  guardian: Guardian | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  demoLogin: (role: UserRole) => Promise<void>;
  register: (payload: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  setGuardian: React.Dispatch<React.SetStateAction<Guardian | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [guardian, setGuardian] = useState<Guardian | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('safeher_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    if (!localStorage.getItem('safeher_token')) {
      setUser(null);
      setGuardian(null);
      setIsLoading(false);
      return;
    }
    try {
      const data = await api.getMe();
      if (data.success && data.user) {
        setUser(data.user);
        setGuardian(data.guardian || null);
      }
    } catch (err) {
      console.warn('Session expired or invalid, logging out.');
      api.removeToken();
      setUser(null);
      setGuardian(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const res = await api.login(credentials);
      setUser(res.user);
      setGuardian(res.guardian || null);
      setToken(res.token);
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async (role: UserRole) => {
    const demoAccounts: Record<UserRole, { email: string; password: string }> = {
      traveller: { email: 'traveller@safeher.org', password: 'SafeHer@2026' },
      guardian: { email: 'guardian@safeher.org', password: 'SafeHer@2026' },
      admin: { email: 'admin@safeher.org', password: 'SafeHer@2026' },
    };

    const creds = demoAccounts[role];
    await login(creds);
  };

  const register = async (payload: any) => {
    setIsLoading(true);
    try {
      const res = await api.register(payload);
      setUser(res.user);
      setGuardian(res.guardian || null);
      setToken(res.token);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    api.removeToken();
    setUser(null);
    setGuardian(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        guardian,
        token,
        isLoading,
        isAuthenticated: Boolean(user),
        login,
        demoLogin,
        register,
        logout,
        refreshUser,
        setGuardian,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

