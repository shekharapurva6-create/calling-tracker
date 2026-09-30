import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { dataStore } from '../services/storage/dataStore';
import {
  supabase,
  isSupabaseConfigured,
  isAuthorizedAdminEmail,
} from '../services/supabase/supabaseClient';

export interface LoginResult {
  success: boolean;
  error?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  profile: UserProfile | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isWorker: boolean;
  currentWorkerId: string;
  currentWorkerName: string;
  currentAdminId: string;
  currentAdminName: string;
  login: (email: string, password?: string, expectedRole?: UserRole) => Promise<LoginResult>;
  logout: () => Promise<void>;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_KEY = 'nexgenai_auth_user_v3';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Helper to load profile from Supabase or fallback store
  const fetchProfile = async (userId: string, userEmail: string): Promise<UserProfile | null> => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error || !data) {
          console.warn('Could not fetch Supabase profile:', error);
          return dataStore.getProfileByEmail(userEmail) || null;
        }

        const mapped: UserProfile = {
          id: data.id,
          fullName: data.full_name,
          email: data.email,
          phone: data.phone,
          role: data.role as UserRole,
          isActive: data.is_active,
          dailyTarget: data.daily_target || 15,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
        return mapped;
      } catch (e) {
        console.error('Error fetching Supabase profile:', e);
        return dataStore.getProfileByEmail(userEmail) || null;
      }
    } else {
      return dataStore.getProfileById(userId) || dataStore.getProfileByEmail(userEmail) || null;
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    const fresh = await fetchProfile(user.id, user.email);
    if (fresh && fresh.isActive) {
      setUser(fresh);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(fresh));
    } else {
      // Deactivated or removed
      setUser(null);
      localStorage.removeItem(AUTH_USER_KEY);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        if (isSupabaseConfigured()) {
          const { data } = await supabase.auth.getSession();
          if (data.session?.user && isMounted) {
            const prof = await fetchProfile(data.session.user.id, data.session.user.email || '');
            if (prof && prof.isActive) {
              setUser(prof);
              localStorage.setItem(AUTH_USER_KEY, JSON.stringify(prof));
            } else {
              await supabase.auth.signOut();
              setUser(null);
              localStorage.removeItem(AUTH_USER_KEY);
            }
          }
        } else {
          const saved = localStorage.getItem(AUTH_USER_KEY);
          if (saved && isMounted) {
            const parsed = JSON.parse(saved);
            const fresh = dataStore.getProfileById(parsed.id) || dataStore.getProfileByEmail(parsed.email);
            if (fresh && fresh.isActive) {
              setUser(fresh);
            } else {
              localStorage.removeItem(AUTH_USER_KEY);
            }
          }
        }
      } catch (e) {
        console.error('Auth initialization error:', e);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Supabase auth state listener
    let authListenerSubscription: any = null;
    if (isSupabaseConfigured()) {
      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (event === 'SIGNED_IN' && session?.user) {
            const prof = await fetchProfile(session.user.id, session.user.email || '');
            if (prof && prof.isActive) {
              setUser(prof);
              localStorage.setItem(AUTH_USER_KEY, JSON.stringify(prof));
            } else {
              await supabase.auth.signOut();
              setUser(null);
              localStorage.removeItem(AUTH_USER_KEY);
            }
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
            localStorage.removeItem(AUTH_USER_KEY);
          }
        }
      );
      authListenerSubscription = authListener.subscription;
    }

    return () => {
      isMounted = false;
      if (authListenerSubscription) {
        authListenerSubscription.unsubscribe();
      }
    };
  }, []);

  const login = async (
    email: string,
    password = '',
    expectedRole?: UserRole
  ): Promise<LoginResult> => {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Check for Admin Portal Authorization
    if (expectedRole === 'ADMIN') {
      if (!isAuthorizedAdminEmail(cleanEmail)) {
        return {
          success: false,
          error: 'Access denied. This account is not authorized for the NexGenAi Admin Portal.',
        };
      }
    }

    // 2. Perform Supabase Authentication if configured
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: password.trim(),
        });

        if (error || !data.user) {
          const defaultMsg =
            expectedRole === 'ADMIN'
              ? 'Invalid admin credentials or unauthorized account.'
              : 'Invalid worker credentials or unauthorized account.';
          return { success: false, error: defaultMsg };
        }

        const profileData = await fetchProfile(data.user.id, cleanEmail);
        if (!profileData) {
          await supabase.auth.signOut();
          return {
            success: false,
            error:
              expectedRole === 'ADMIN'
                ? 'Access denied. This account is not authorized for the NexGenAi Admin Portal.'
                : 'Invalid worker credentials or unauthorized account.',
          };
        }

        if (expectedRole && profileData.role !== expectedRole) {
          await supabase.auth.signOut();
          return {
            success: false,
            error:
              expectedRole === 'ADMIN'
                ? 'Access denied. This account is not authorized for the NexGenAi Admin Portal.'
                : 'Invalid worker credentials or unauthorized account.',
          };
        }

        if (!profileData.isActive) {
          await supabase.auth.signOut();
          return {
            success: false,
            error: 'Your NexGenAi worker account is inactive. Please contact an administrator.',
          };
        }

        setUser(profileData);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(profileData));
        return { success: true };
      } catch (err: any) {
        return {
          success: false,
          error: err.message || 'Authentication failed. Please check your credentials.',
        };
      }
    }

    // 3. Fallback to Local Verified Store Authentication
    const result = dataStore.verifyLocalCredentials(cleanEmail, password, expectedRole);
    if (!result.user) {
      return {
        success: false,
        error:
          result.error ||
          (expectedRole === 'ADMIN'
            ? 'Invalid admin credentials or unauthorized account.'
            : 'Invalid worker credentials or unauthorized account.'),
      };
    }

    if (expectedRole && result.user.role !== expectedRole) {
      return {
        success: false,
        error:
          expectedRole === 'ADMIN'
            ? 'Access denied. This account is not authorized for the NexGenAi Admin Portal.'
            : 'Invalid worker credentials or unauthorized account.',
      };
    }

    if (!result.user.isActive) {
      return {
        success: false,
        error: 'Your NexGenAi worker account is inactive. Please contact an administrator.',
      };
    }

    setUser(result.user);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(result.user));
    return { success: true };
  };

  const logout = async () => {
    try {
      if (isSupabaseConfigured()) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.warn('Error signing out from Supabase:', e);
    } finally {
      setUser(null);
      localStorage.removeItem(AUTH_USER_KEY);
    }
  };

  const value: AuthContextType = {
    user,
    profile: user,
    role: user?.role || null,
    isAuthenticated: !!user && user.isActive,
    isAdmin: user?.role === 'ADMIN' && user.isActive,
    isWorker: user?.role === 'WORKER' && user.isActive,
    currentWorkerId: user?.role === 'WORKER' ? user.id : '',
    currentWorkerName: user?.role === 'WORKER' ? user.fullName : '',
    currentAdminId: user?.role === 'ADMIN' ? user.id : '',
    currentAdminName: user?.role === 'ADMIN' ? user.fullName : '',
    login,
    logout,
    isLoading,
    refreshProfile,
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
