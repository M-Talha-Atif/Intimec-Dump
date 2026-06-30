'use client';

import React, { createContext, useContext, useEffect } from 'react';
import useAuth from '@/hooks/useAuth';
import { startAutoRefresh, stopAutoRefresh } from '@/lib/auth-client';
import { useSessionValidation } from '@/hooks/useSessionValidation';

interface AuthContextType {
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  isLoggingIn: boolean;
  login: (credentials: any) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const authState = useAuth();

  // Validate session once when user is authenticated
  useSessionValidation(authState.isAuthenticated && !authState.isLoading);

  // Handle automatic refresh based on authentication state
  useEffect(() => {
    if (authState.isAuthenticated && !authState.isLoading) {
      // Start auto-refresh when user becomes authenticated
      startAutoRefresh();
    } else {
      // Stop auto-refresh when user is not authenticated
      stopAutoRefresh();
    }

    // Cleanup on unmount
    return () => {
      stopAutoRefresh();
    };
  }, [authState.isAuthenticated, authState.isLoading]);

  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
};