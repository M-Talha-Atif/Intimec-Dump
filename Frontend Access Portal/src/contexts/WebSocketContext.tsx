"use client";

import { createContext, useContext, ReactNode } from 'react';
import { useSessionWebSocket } from '@/hooks/useSessionWebSocket';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

interface WebSocketContextType {
  isConnected: boolean;
  disconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function useWebSocketContext() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within WebSocketProvider');
  }
  return context;
}

interface WebSocketProviderProps {
  children: ReactNode;
}

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    // Read sessionId and authToken from cookies
    const sessionIdFromCookie = Cookies.get('session_id');
    const tokenFromCookie = Cookies.get('auth_token'); // Use auth_token for WebSocket

    setSessionId(sessionIdFromCookie || null);
    setAccessToken(tokenFromCookie || null);
  }, []);

  const { isConnected, disconnect } = useSessionWebSocket(sessionId, accessToken);

  return (
    <WebSocketContext.Provider value={{ isConnected, disconnect }}>
      {children}
    </WebSocketContext.Provider>
  );
}
