"use client";

import { useEffect, useRef } from 'react';
import { _logout } from '@/lib/auth';

/**
 * Hook to validate session once when user is authenticated.
 * Checks if the session_id cookie exists in the backend.
 * If session is invalid, logs out the user.
 * 
 * @param isAuthenticated - Whether the user is currently authenticated
 */
export function useSessionValidation(isAuthenticated: boolean) {
  const hasValidated = useRef(false);

  useEffect(() => {
    // Only run once when user is authenticated and hasn't been validated yet
    if (isAuthenticated && !hasValidated.current) {
      hasValidated.current = true;

      const validateSession = async () => {
        try {
          const response = await fetch('/api/validate-session');
          const result = await response.json();
          
          if (!result.valid) {
            // Session does not exist in the backend
            
            // Logout user and redirect to login
            await _logout();
            window.location.href = '/';
          }
        } catch (error) {
          // On error, log out for security
          await _logout();
          window.location.href = '/';
        }
      };

      validateSession();
    }

    // Reset validation flag when user logs out
    if (!isAuthenticated) {
      hasValidated.current = false;
    }
  }, [isAuthenticated]);
}
