import React, { createContext, useContext, useState, useEffect, ReactNode, PropsWithChildren } from 'react';
import { User, LoginResponse } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: Partial<User> & { password?: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => void;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  toggleFavorite: (eventId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: PropsWithChildren<{}>) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false); 

  const saveSession = (data: LoginResponse) => {
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('uniparty_token', data.token);
    localStorage.setItem('uniparty_user', JSON.stringify(data.user));
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('uniparty_token');
    const storedUser = localStorage.getItem('uniparty_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const response = await api.auth.login(email, pass);
      saveSession(response);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: Partial<User> & { password?: string }) => {
    setIsLoading(true);
    try {
      const response = await api.auth.register(data);
      saveSession(response);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('uniparty_token');
    localStorage.removeItem('uniparty_user');
  };

  const refreshUser = async () => {
     // In a real app, this would fetch /api/auth/me
     // For now we just rely on local state or re-fetching login logic if needed
     if(user) {
         // Placeholder for more complex refresh logic if needed
     }
  };

  const updateUserProfile = async (data: Partial<User>) => {
      if (!user) return;
      setIsLoading(true);
      try {
          const updatedUser = await api.auth.updateUser(user._id, data);
          setUser(updatedUser);
          localStorage.setItem('uniparty_user', JSON.stringify(updatedUser));
      } finally {
          setIsLoading(false);
      }
  };

  const toggleFavorite = async (eventId: string) => {
      if (!user) return;
      
      // Optimistic update
      const oldFavorites = user.favorites || [];
      const index = oldFavorites.indexOf(eventId);
      let newFavorites;
      if (index === -1) {
          newFavorites = [...oldFavorites, eventId];
      } else {
          newFavorites = oldFavorites.filter(id => id !== eventId);
      }
      
      const updatedUser = { ...user, favorites: newFavorites };
      setUser(updatedUser);
      localStorage.setItem('uniparty_user', JSON.stringify(updatedUser));

      try {
          // Sync with API
          const syncedFavorites = await api.auth.toggleFavorite(user._id, eventId);
          // Update again with confirmed data
          const confirmedUser = { ...user, favorites: syncedFavorites };
          setUser(confirmedUser);
          localStorage.setItem('uniparty_user', JSON.stringify(confirmedUser));
      } catch (error) {
          // Revert on error
          console.error("Failed to toggle favorite", error);
          setUser(user);
          localStorage.setItem('uniparty_user', JSON.stringify(user));
      }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, refreshUser, updateUserProfile, toggleFavorite }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};