/**
 * Global fetch wrapper with automatic 403 and 400 handling
 * Shows user-friendly toast notifications for access denied and validation errors
 */

// Custom events
export const ACCESS_DENIED_EVENT = 'access-denied';
export const VALIDATION_ERROR_EVENT = 'validation-error';

// Store original fetch
const originalFetch = global.fetch;

/**
 * Enhanced fetch that intercepts 403 and 400 responses and emits events for toast display
 */
export async function fetchWithToast(...args: Parameters<typeof fetch>): Promise<Response> {
  const response = await originalFetch(...args);
  
  console.log('[Fetch Interceptor] Response status:', response.status, 'URL:', args[0]);
  
  // Handle 403 Forbidden globally
  if (response.status === 403) {
    console.log('[Fetch Interceptor] 403 detected, preparing to show toast');
    const clonedResponse = response.clone();
    
    try {
      const errorData = await clonedResponse.json();
      const errorMessage = errorData.message || "You don't have permission to perform this action. Please contact your administrator.";
      
      console.log('[Fetch Interceptor] Emitting access denied event with message:', errorMessage);
      
      // Emit custom event that React component will listen for
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(ACCESS_DENIED_EVENT, {
          detail: { message: errorMessage }
        }));
      }
    } catch (error) {
      console.log('[Fetch Interceptor] Error parsing 403 response:', error, 'using default message');
      // If response is not JSON, show generic message
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(ACCESS_DENIED_EVENT, {
          detail: { message: "You don't have permission to perform this action. Please contact your administrator." }
        }));
      }
    }
  }
  
  // Handle 400 Validation Errors globally
  if (response.status === 400) {
    console.log('[Fetch Interceptor] 400 detected, checking for validation errors');
    const clonedResponse = response.clone();
    
    try {
      const errorData = await clonedResponse.json();
      
      if (errorData.message && errorData.message.toLowerCase().includes('validation')) {
        let errorMessage = errorData.message;
        
        // Extract specific field errors if available
        if (errorData.errors) {
          const validationErrors: string[] = [];
          if (typeof errorData.errors === 'object' && !Array.isArray(errorData.errors)) {
            Object.entries(errorData.errors).forEach(([field, msg]) => {
              validationErrors.push(`${msg}`);
            });
          }
          
          if (validationErrors.length > 0) {
            errorMessage = validationErrors.join(', ');
          }
        }
        
        console.log('[Fetch Interceptor] Emitting validation error event with message:', errorMessage);
        
        // Emit custom event that React component will listen for
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent(VALIDATION_ERROR_EVENT, {
            detail: { message: errorMessage }
          }));
        }
      }
    } catch (error) {
      console.log('[Fetch Interceptor] Error parsing 400 response:', error);
    }
  }
  
  return response;
}

/**
 * Install global fetch interceptor
 * Call this once in your app initialization (e.g., layout.tsx)
 */
export function installFetchInterceptor() {
  if (typeof window !== 'undefined') {
    // @ts-ignore
    global.fetch = fetchWithToast;
    console.log('[Fetch Interceptor] Installed global 403 handler');
  }
}

/**
 * Restore original fetch (for cleanup/testing)
 */
export function uninstallFetchInterceptor() {
  if (typeof window !== 'undefined') {
    global.fetch = originalFetch;
    console.log('[Fetch Interceptor] Restored original fetch');
  }
}
