"use client";

import { useEffect, useRef, useCallback } from 'react';
import { Client, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { _logout } from '@/lib/auth';

interface SessionTerminationMessage {
  type: string;
  message: string;
  reason: string;
  timestamp: number;
}

export function useSessionWebSocket(sessionId: string | null, accessToken: string | null) {
  const clientRef = useRef<Client | null>(null);
  const subscriptionRef = useRef<StompSubscription | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleSessionTermination = useCallback(async (message: SessionTerminationMessage) => {
    
    // Disconnect WebSocket immediately
    if (clientRef.current) {
      try {
        clientRef.current.deactivate();
      } catch (error) {
      }
    }

    // Call logout to clear httpOnly cookies server-side
    try {
      await _logout();
    } catch (error) {
    }

    // Show toast notification
    toast({
      title: "Session Terminated",
      description: message.message || "Your session has been terminated by an administrator.",
      variant: "destructive",
      duration: 3000,
    });

    // Force immediate redirect to login page
    setTimeout(() => {
      window.location.href = '/';
    }, 500);
  }, [toast]);

  const connect = useCallback(() => {
    if (!sessionId || !accessToken) {
      return;
    }

    // Disconnect existing client if any
    if (clientRef.current?.connected) {
      return;
    }

    let API_URL = process.env.NEXT_PUBLIC_API_URL;

    // NEXT_PUBLIC_API_URL must point to an API gateway that has CORS configured
    // for the frontend origin. Direct service URLs (e.g. localhost:8090) will be
    // blocked by the browser. If the var is not set, skip the connection silently
    // — session-termination push notifications simply won't fire in that environment.
    if (!API_URL) {
      return;
    }

    // If page is loaded over HTTPS, ensure WebSocket URL uses HTTPS too
    if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
      API_URL = API_URL.replace(/^http:/, 'https:');
    }
    
    const wsUrl = `${API_URL}/auth/ws`;

    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl) as any,
      connectHeaders: {
        Authorization: `Bearer ${accessToken}`,
        'X-Session-Id': sessionId,
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        
        // Subscribe to session-specific termination queue
        const destination = `/user/queue/session-termination`;
        
        subscriptionRef.current = client.subscribe(destination, (message) => {
          try {
            const data: SessionTerminationMessage = JSON.parse(message.body);
            handleSessionTermination(data);
          } catch (error) {
            console.error('[WebSocket] Error parsing message:', error);
          }
        });
        console.log('[WebSocket] Subscription active');
      },
      onStompError: (frame) => {
        console.error('[WebSocket] STOMP error:', frame);
      },
      onWebSocketError: (event) => {
        console.error('[WebSocket] WebSocket error:', event);
      },
      onDisconnect: () => {
        console.log('[WebSocket] Disconnected from:', wsUrl);
      },
    });

    client.activate();
    clientRef.current = client;
  }, [sessionId, accessToken, handleSessionTermination]);

  const disconnect = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }

    if (clientRef.current) {
      clientRef.current.deactivate();
      clientRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected: clientRef.current?.connected || false,
    disconnect,
  };
}
