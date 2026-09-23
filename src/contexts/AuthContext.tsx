import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { dataStore } from '../services/storage/dataStore';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isWorker: boolean;
  login: (email: string, role?: UserRole) => Promise<boolean>;
  quickLogin: (profileId: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_KEY = 'nexgenai_auth_user_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(AUTH_USER_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Refresh profile from dataStore in case active state or name changed
        const fresh = dataStore.getProfileById(parsed.id);
        if (fresh && fresh.isActive) {
          setUser(fresh);
        } else if (parsed && parsed.isActive) {
          setUser(parsed);
        } else {
          localStorage.removeItem(AUTH_USER_KEY);
        }
      }
    } catch (e) {
      console.error('Error loading stored auth user:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, expectedRole?: UserRole): Promise<boolean> => {
    const cleanEmail = email.trim().toLowerCase();
    const profiles = dataStore.getProfiles();
    const match = profiles.find((p) => p.email.toLowerCase() === cleanEmail && p.isActive);

    if (!match) {
      return false;
    }

    if (expectedRole && match.role !== expectedRole) {
      return false;
    }

    setUser(match);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(match));
    return true;
  };

  const quickLogin = (profileId: string) => {
    const profile = dataStore.getProfileById(profileId);
    if (profile) {
      setUser(profile);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(profile));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_USER_KEY);
  };

  const value: AuthContextType = {
    user,
    role: user?.role || null,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    isWorker: user?.role === 'WORKER',
    login,
    quickLogin,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
