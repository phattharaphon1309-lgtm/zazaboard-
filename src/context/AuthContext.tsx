import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api, getAuthToken, removeAuthToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (loginId: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (data: {
    username: string;
    displayName: string;
    password: string;
    email: string;
    phoneNumber?: string;
    citizenId?: string;
    bio?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  switchDemoUser: (username: string) => Promise<void>;
  updateProfile: (data: { displayName?: string; bio?: string; phoneNumber?: string; avatar?: string }) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.getMe();
      setUser(res.user);
    } catch (err) {
      console.warn('Auth token invalid, logging out', err);
      removeAuthToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (loginId: string, password: string) => {
    const res = await api.login({ loginId, password });
    setUser(res.user);
  };

  const loginWithGoogle = async () => {
    const { signInWithPopup } = await import('firebase/auth');
    const { auth, googleProvider } = await import('../services/firebase');
    const result = await signInWithPopup(auth, googleProvider);
    if (!result.user.email) {
      throw new Error('ไม่พบข้อมูลอีเมลจาก Google');
    }
    const res = await api.loginWithFirebase({
      email: result.user.email,
      displayName: result.user.displayName,
      photoUrl: result.user.photoURL,
      uid: result.user.uid,
    });
    setUser(res.user);
  };

  const register = async (data: {
    username: string;
    displayName: string;
    password: string;
    email: string;
    phoneNumber?: string;
    citizenId?: string;
    bio?: string;
  }) => {
    const res = await api.register(data);
    setUser(res.user);
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  const switchDemoUser = async (target: string) => {
    setLoading(true);
    try {
      const res = await api.quickSwitch(target);
      setUser(res.user);
    } catch (err: any) {
      console.error('Switch error:', err);
      // Fallback
      const pwd = target.includes('admin') ? 'Admin@123456' : 'User@123456';
      await login(target, pwd);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: { displayName?: string; bio?: string; phoneNumber?: string; avatar?: string }) => {
    const res = await api.updateProfile(data);
    setUser(res.user);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginWithGoogle,
        register,
        logout,
        switchDemoUser,
        updateProfile,
        refreshUser,
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
