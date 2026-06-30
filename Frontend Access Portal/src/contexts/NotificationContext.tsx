'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';

export interface NotificationData {
  id: string;
  notificationId?: string;
  type: 'NOTIFICATIONS' | 'ANNOUNCEMENTS' | 'ALERTS';
  description: string;
  details?: string;
  operation?: string;
  isViewed: boolean;
  isPinned: boolean;
  createdAt?: string;
  createdBy?: string;
}

interface NotificationCounts {
  notifications: number;
  announcements: number;
  alerts: number;
  total: number;
}

interface NotificationContextType {
  notifications: NotificationData[];
  counts: NotificationCounts;
  isConnected: boolean;
  connectionError: string | null;
  markAsViewed: (notificationId: string) => Promise<void>;
  togglePin: (notificationId: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
  connectSSE: () => void;
  disconnectSSE: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  // Get authentication status
  const authState = useAuthContext();
  const { isAuthenticated, isLoading } = authState;

  // Track if we've already fetched to prevent infinite loops
  const [hasInitialized, setHasInitialized] = useState(false);

  // Calculate counts from notifications
  const counts: NotificationCounts = {
    notifications: notifications.filter(n => n.type === 'NOTIFICATIONS' && !n.isViewed).length,
    announcements: notifications.filter(n => n.type === 'ANNOUNCEMENTS' && !n.isViewed).length,
    alerts: notifications.filter(n => n.type === 'ALERTS' && !n.isViewed).length,
    total: notifications.filter(n => !n.isViewed).length,
  };

  // Fetch initial notifications using API route
  const refreshNotifications = useCallback(async () => {
    // Don't attempt to fetch if not authenticated
    if (!isAuthenticated) {
      return;
    }

    try {
      const response = await fetch('/api/notifications');
      if (!response.ok) {
        // If unauthorized, don't show error - user probably logged out
        if (response.status === 401) {
          return;
        }
        throw new Error(`Failed to fetch notifications: ${response.statusText}`);
      }

      const data = await response.json();
      const allNotifications = data.data || [];

      // Convert server data to client data format
      const clientNotifications: NotificationData[] = allNotifications.map((serverNotification: any) => ({
        ...serverNotification,
        isPinned: serverNotification.isPinned || false, // Default to false if not provided
        // Add any additional client-side fields if needed
      }));

      setNotifications(clientNotifications);
    } catch (error) {
      setConnectionError('Failed to fetch notifications');
    }
  }, [isAuthenticated]);

  // Mark notification as viewed using API route
  const markAsViewed = useCallback(async (notificationId: string) => {
    // Don't attempt to mark as viewed if not authenticated
    if (!isAuthenticated) {
      return;
    }

    try {

      // Find the notification to get the correct notificationId for the API call
      const notification = notifications.find(n => n.id === notificationId);

      const apiNotificationId = notification?.notificationId || notificationId;

      // Update local state optimistically first
      setNotifications(prev => {
        const updated = prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, isViewed: true }
            : notification
        );
        return updated;
      });

      // Call the Next.js API route instead of direct backend call

      const response = await fetch('/api/notifications/mark-viewed', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationId: apiNotificationId
        }),
      });

      if (!response.ok) {
        // If unauthorized, don't show error - user probably logged out
        if (response.status === 401) {
          return;
        }
        const errorData = await response.json();
        console.error('Failed to mark notification as viewed:', errorData);
        throw new Error(`Failed to mark notification as viewed: ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log('Successfully marked notification as viewed:', responseData);

      // Refresh notifications from backend to ensure we're in sync
      await refreshNotifications();

    } catch (error) {
      console.error('Error in markAsViewed:', error);
      // Revert the optimistic update if the API call failed
      setNotifications(prev => {
        const reverted = prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, isViewed: false }
            : notification
        );
        return reverted;
      });
      // Rethrow so caller can handle the error
      throw error;
    }
  }, [notifications, isAuthenticated]);

  const togglePin = useCallback(async (notificationId: string) => {
    // Don't attempt to toggle pin if not authenticated
    if (!isAuthenticated) {
      return;
    }

    try {

      // Find the notification to get current pin state
      const notification = notifications.find(n => n.id === notificationId);

      if (!notification) {
        return;
      }

      const newPinState = !notification.isPinned;
      const apiNotificationId = notification?.notificationId || notificationId;

      // Update local state optimistically first
      setNotifications(prev => {
        const updated = prev.map(n =>
          n.id === notificationId
            ? { ...n, isPinned: newPinState }
            : n
        );
        return updated;
      });

      // Call the pin/unpin API

      const response = await fetch(`/api/notifications/${apiNotificationId}/${newPinState}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // If unauthorized, don't show error - user probably logged out
        if (response.status === 401) {
          return;
        }
        const errorData = await response.json();
        console.error('Failed to toggle pin:', errorData);
        throw new Error(`Failed to ${newPinState ? 'pin' : 'unpin'} notification: ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log('Successfully toggled pin:', responseData);

      // Refresh notifications from backend to ensure we're in sync
      await refreshNotifications();

    } catch (error) {
      console.error('Error in togglePin:', error);
      // Revert the optimistic update if the API call failed
      setNotifications(prev => {
        const reverted = prev.map(n =>
          n.id === notificationId
            ? { ...n, isPinned: !n.isPinned }
            : n
        );
        return reverted;
      });
      // Rethrow so caller can handle the error
      throw error;
    }
  }, [notifications, isAuthenticated, refreshNotifications]);

  // Start real-time polling instead of SSE
  const startPolling = useCallback(() => {
    // Don't start if not authenticated
    if (!isAuthenticated) {
      return;
    }

    // Don't start if already polling
    if (pollingInterval) {
      return;
    }

    setIsConnected(true);
    setConnectionError(null);

    // Initial fetch
    refreshNotifications();

    // Set up polling every 5 seconds for real-time feel
    const interval = setInterval(() => {
      // Check if still authenticated before each poll
      if (isAuthenticated) {
        refreshNotifications();
      } else {
        clearInterval(interval);
        setPollingInterval(null);
        setIsConnected(false);
      }
    }, 5000);

    setPollingInterval(interval);
  }, [pollingInterval, refreshNotifications, isAuthenticated]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
      setIsConnected(false);
    }
  }, [pollingInterval]);

  // Initialize on mount and handle auth changes
  useEffect(() => {

    // Only proceed when loading is complete
    if (isLoading) {
      return;
    }

    // Handle authentication state changes
    if (isAuthenticated) {
      // User is authenticated - initialize if not already done
      if (!hasInitialized) {
        setHasInitialized(true);
        setConnectionError(null);
        setIsConnected(true); // Set connected immediately
        // Start initialization
        refreshNotifications();
        startPolling();
      }
    } else {
      // User is not authenticated and loading is complete - reset everything
      setHasInitialized(false);
      setNotifications([]);
      setConnectionError(null);
      setIsConnected(false);
      stopPolling();
    }
  }, [isAuthenticated, isLoading]); // Simple dependencies only

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, []);

  const value = {
    notifications,
    counts,
    isConnected,
    connectionError,
    markAsViewed,
    togglePin,
    refreshNotifications,
    connectSSE: startPolling,
    disconnectSSE: stopPolling,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
