import { useEffect, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface NotificationAction {
  type: string;
  label: string;
  variant: 'success' | 'danger' | 'secondary' | 'default';
  endpoint: string;
  method: string;
  requiresComment: boolean;
}

export interface WorkflowNotification {
  id: string;
  type: string;
  description: string;
  details: string;
  operation: string;
  createdAt: number;
  createdBy: string;
  isViewed: boolean;
  userNotificationId: string;
  actions?: NotificationAction[];
}

interface UseNotificationStreamOptions {
  onNotification?: (notification: WorkflowNotification) => void;
  autoConnect?: boolean;
}

/**
 * Hook to subscribe to Server-Sent Events (SSE) notification stream from core-service
 * 
 * Usage:
 * ```tsx
 * const { notifications, isConnected, clearNotification } = useNotificationStream({
 *   onNotification: (notif) => console.log('New notification:', notif),
 *   autoConnect: true
 * });
 * ```
 */
export function useNotificationStream(options: UseNotificationStreamOptions = {}) {
  const { onNotification, autoConnect = true } = options;
  const [notifications, setNotifications] = useState<WorkflowNotification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);
  const { toast } = useToast();

  const connect = useCallback(() => {
    // Get JWT token from localStorage
    const jwt = localStorage.getItem('jwt');
    if (!jwt) {
      console.error('No JWT token found for SSE connection');
      toast({
        title: 'Authentication Error',
        description: 'Please log in to receive notifications',
        variant: 'destructive'
      });
      return;
    }

    // Create SSE connection to core-service
    const url = `http://localhost:8080/api/v1/notifications/stream`;
    const es = new EventSource(url);

    es.onopen = () => {
      console.log('SSE connection established');
      setIsConnected(true);
    };

    es.onmessage = (event) => {
      try {
        const notification: WorkflowNotification = JSON.parse(event.data);
        console.log('Received notification:', notification);

        // Add to notifications list
        setNotifications(prev => [notification, ...prev]);

        // Call custom handler if provided
        if (onNotification) {
          onNotification(notification);
        }

        // Show toast for new notifications
        if (notification.actions && notification.actions.length > 0) {
          toast({
            title: notification.description,
            description: notification.details,
            duration: 10000 // Keep approval notifications longer
          });
        }
      } catch (error) {
        console.error('Failed to parse SSE notification:', error);
      }
    };

    es.onerror = (error) => {
      console.error('SSE connection error:', error);
      setIsConnected(false);
      
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        console.log('Attempting to reconnect SSE...');
        connect();
      }, 5000);
    };

    setEventSource(es);
  }, [onNotification, toast]);

  const disconnect = useCallback(() => {
    if (eventSource) {
      console.log('Closing SSE connection');
      eventSource.close();
      setEventSource(null);
      setIsConnected(false);
    }
  }, [eventSource]);

  const clearNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [autoConnect]); // Only run on mount

  return {
    notifications,
    isConnected,
    connect,
    disconnect,
    clearNotification,
    clearAllNotifications
  };
}
