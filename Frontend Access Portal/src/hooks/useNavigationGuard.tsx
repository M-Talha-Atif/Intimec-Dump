"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface SimpleNavigationGuardOptions {
  hasUnsavedChanges: boolean;
  message?: string;
}

export function useSimpleNavigationGuard({
  hasUnsavedChanges,
  message = "You have unsaved changes. Are you sure you want to leave?",
}: SimpleNavigationGuardOptions) {
  const [showDialog, setShowDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const allowNavigationRef = useRef(false);
  const historyGuardAddedRef = useRef(false);
  const router = useRouter();

  useEffect(() => {
    // Add a dummy history entry only once when we first have unsaved changes
    if (hasUnsavedChanges && !historyGuardAddedRef.current) {
      window.history.pushState(null, '', window.location.pathname + window.location.search);
      historyGuardAddedRef.current = true;
    }

    // Reset the flag when no more unsaved changes
    if (!hasUnsavedChanges && historyGuardAddedRef.current) {
      historyGuardAddedRef.current = false;
    }

    const handleClick = (event: MouseEvent) => {
      if (allowNavigationRef.current || !hasUnsavedChanges) return;

      const target = event.target as HTMLElement;
      const clickableElement = target.closest('a[href], button[data-href], [role="button"][data-href]');

      if (clickableElement) {
        const href = clickableElement.getAttribute('href') || clickableElement.getAttribute('data-href');

        if (href &&
          href !== '#' &&
          !href.startsWith('#') &&
          href !== window.location.pathname &&
          !href.startsWith('http://') &&
          !href.startsWith('https://') &&
          !href.startsWith('mailto:') &&
          !href.startsWith('tel:')) {

          console.log('🛡️ Navigation guard: Intercepting click on', href);
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();

          setPendingAction(() => () => {
            console.log('✅ Navigation guard: Executing navigation to', href);
            allowNavigationRef.current = true;

            setTimeout(() => {
              router.push(href);
              setTimeout(() => {
                allowNavigationRef.current = false;
              }, 100);
            }, 50);
          });

          setShowDialog(true);
        }
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && !allowNavigationRef.current) {
        e.preventDefault();
        // Modern browsers ignore the returnValue and show their own message
        return message;
      }
    };

    const handlePopstate = (e: PopStateEvent) => {
      if (allowNavigationRef.current || !hasUnsavedChanges) {
        return;
      }

      console.log('🛡️ Navigation guard: Intercepting back button');

      // Push the current state back to "cancel" the back navigation
      window.history.pushState(null, '', window.location.pathname + window.location.search);

      setPendingAction(() => () => {
        console.log('✅ Navigation guard: Executing back navigation');
        allowNavigationRef.current = true;

        // Go back two steps to bypass our guard entry and actually navigate
        setTimeout(() => {
          window.history.go(-2);
          setTimeout(() => {
            allowNavigationRef.current = false;
            historyGuardAddedRef.current = false; // Reset flag since we're leaving
          }, 100);
        }, 50);
      });

      setShowDialog(true);
    };

    document.addEventListener('click', handleClick, true);
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopstate);

    return () => {
      document.removeEventListener('click', handleClick, true);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopstate);
    };
  }, [hasUnsavedChanges, message, router]);

  const handleIgnoreChanges = () => {
    console.log('🚀 Navigation guard: User clicked Ignore Changes');
    setShowDialog(false);
    if (pendingAction) {
      try {
        pendingAction();
        setPendingAction(null);
      } catch (error) {
        console.error('❌ Navigation guard: Error executing pending action:', error);
        setPendingAction(null);
      }
    }
  };

  const handleCancel = () => {
    console.log('🚫 Navigation guard: User clicked Cancel');
    setShowDialog(false);
    setPendingAction(null);
  };

  return {
    showDialog,
    message,
    onIgnoreChanges: handleIgnoreChanges,
    onCancel: handleCancel,
  };
}