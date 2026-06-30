import { useEffect } from 'react';

const APP_NAME = 'IdentityIQ';

/**
 * Sets the document title for the current page.
 * Format: "Page Name | AppName" or just "AppName" if no title provided.
 */
export const useDocumentTitle = (title?: string) => {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title ? `${title} | ${APP_NAME}` : APP_NAME;
    
    return () => {
      document.title = previousTitle;
    };
  }, [title]);
};
