'use client';

import { useEffect } from 'react';
import { installFetchInterceptor, ACCESS_DENIED_EVENT, VALIDATION_ERROR_EVENT } from '@/lib/fetch-with-toast';
import { toast } from 'sonner';

/**
 * Client component that installs global fetch interceptor for 403 and 400 handling
 * Place this in root layout to enable global access denied and validation error toast notifications
 */
export function FetchInterceptor() {
  useEffect(() => {
    console.log('[FetchInterceptor] Installing fetch interceptor and event listeners');
    
    // Install fetch interceptor
    installFetchInterceptor();
    
    // Listen for access denied events and show toast
    const handleAccessDenied = (event: Event) => {
      const customEvent = event as CustomEvent;
      const message = customEvent.detail?.message || "You don't have permission to perform this action.";
      
      console.log('[FetchInterceptor] Access denied event received, showing toast:', message);
      
      toast.error('Access Denied', {
        description: message,
        duration: 6000,
      });
    };
    
    // Listen for validation error events and show toast
    const handleValidationError = (event: Event) => {
      const customEvent = event as CustomEvent;
      const message = customEvent.detail?.message || "Please check your input and try again.";
      
      console.log('[FetchInterceptor] Validation error event received, showing toast:', message);
      
      toast.error('Validation Error', {
        description: message,
        duration: 6000,
      });
    };
    
    window.addEventListener(ACCESS_DENIED_EVENT, handleAccessDenied);
    window.addEventListener(VALIDATION_ERROR_EVENT, handleValidationError);
    console.log('[FetchInterceptor] Event listeners registered for:', ACCESS_DENIED_EVENT, VALIDATION_ERROR_EVENT);
    
    return () => {
      window.removeEventListener(ACCESS_DENIED_EVENT, handleAccessDenied);
      window.removeEventListener(VALIDATION_ERROR_EVENT, handleValidationError);
    };
  }, []);
  
  return null;
}
