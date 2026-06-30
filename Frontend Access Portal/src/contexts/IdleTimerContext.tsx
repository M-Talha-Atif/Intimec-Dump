// /context/IdleTimerContext.tsx
"use client";

import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useIdleTimer } from "react-idle-timer";
import { _logout } from "@/lib/auth";
import SessionTimeoutModal from "@/components/SessionTimeoutModal";
import { useRouter } from "next/navigation";

const TOTAL_IDLE_TIMEOUT = 1000 * 60 * 5; // 5 minutes total session time
const PROMPT_DURATION = 1000 * 60; // Show prompt 60 seconds before final timeout

interface IdleContextType {
  isPrompted: boolean;
  remainingTime: number;
}

const IdleContext = createContext<IdleContextType>({
  isPrompted: false,
  remainingTime: 0,
});

export function IdleTimerProvider({ children }: PropsWithChildren) {
  const [isPrompted, setIsPrompted] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [jwtTimeout, setJwtTimeout] = useState(TOTAL_IDLE_TIMEOUT);
  const router = useRouter();

  useEffect(() => {
    const fetchJwtTimeout = async () => {
      try {
        // Call your existing API endpoint that matches your auth.ts pattern
        const response = await fetch("/api/session-expiration-times");
        if (response.ok) {
          const data = await response.json();
          setJwtTimeout(data.jwtExpirationMs);
        }
      } catch (error) {
        console.warn("Failed to fetch JWT timeout, using default");
      }
    };
    fetchJwtTimeout();
  }, []);
  const onPrompt = useCallback(() => {
    setIsPrompted(true);
  }, []);

  const onIdle = useCallback(async () => {
    setIsPrompted(false); // Hide the modal
    await _logout();
    // Force full page reload to clear all client-side state including SWR cache
    if (typeof window !== "undefined") {
      window.location.href = "/";
    } else {
      router.push("/");
    }
  }, [router]);

  const onActive = useCallback(() => {
    setIsPrompted(false); // Hide the modal
  }, []);

  const { getRemainingTime, activate } = useIdleTimer({
    onPrompt,
    onIdle,
    onActive,
    timeout: jwtTimeout,
    promptBeforeIdle: PROMPT_DURATION,
    throttle: 500,
    crossTab: true,
    syncTimers: 50,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingTime(Math.ceil(getRemainingTime() / 1000));
    }, 500);

    return () => {
      clearInterval(interval);
    };
  }, [getRemainingTime]);

  const stayActive = () => {
    activate(); // This resets the timer and calls onActive
  };

  const manualLogout = useCallback(async () => {
    setIsPrompted(false);
    await _logout();
    // Force full page reload to clear all client-side state including SWR cache
    if (typeof window !== "undefined") {
      window.location.href = "/";
    } else {
      router.push("/");
    }
  }, [router]);

  return (
    <IdleContext.Provider value={{ isPrompted, remainingTime }}>
      {children}
      {isPrompted && (
        <SessionTimeoutModal
          remainingTime={remainingTime}
          onLogout={manualLogout}
          onStayActive={stayActive}
          totalTime={PROMPT_DURATION / 1000}
        />
      )}
    </IdleContext.Provider>
  );
}

// 4. Create a custom hook for easy access to the context
export const useIdlePrompt = (): IdleContextType => {
  const context = useContext(IdleContext);
  if (context === undefined) {
    throw new Error("useIdlePrompt must be used within an IdleTimerProvider");
  }
  return context;
};
