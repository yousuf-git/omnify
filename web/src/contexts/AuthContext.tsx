import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authAPI } from '../api/api';
import { isSandbox, getSandboxUser, disableSandbox } from '../sandbox/sandboxMode';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  tenantId?: string | null;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    // Sandbox: synthesize a user from the gate form, never call the backend.
    if (isSandbox()) {
      const su = getSandboxUser();
      if (su) {
        setUser({ id: 'sandbox-user', name: su.name, email: su.email, role: su.role, tenantId: 'sandbox' });
        setLoading(false);
        return;
      }
    }
    try {
      const response = await authAPI.verify();
      setUser(response.data.user);
    } catch (error) {
      console.error('Token verification failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      setUser(response.data.user);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const logout = async () => {
    if (isSandbox()) {
      disableSandbox();
      setUser(null);
      return;
    }
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  const refreshToken = async () => {
    try {
      const response = await authAPI.refresh();
      setUser(response.data.user);
    } catch (error) {
      console.error('Token refresh failed:', error);
      setUser(null);
      throw error;
    }
  };

  const value = {
    user,
    login,
    logout,
    loading,
    refreshToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};