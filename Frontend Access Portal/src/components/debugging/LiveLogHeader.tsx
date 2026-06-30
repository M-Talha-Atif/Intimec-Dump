"use client";

import { useDebugging } from "@/contexts/debugging-context";
import type React from "react";

export function HeaderStats({ className = "" }: { className?: string }) {
  // Consume only the connection status from the context.
  const { connectionStatus } = useDebugging();

  return (
    <div
      className={`flex items-center space-x-3 text-xs text-muted-foreground pl-4 border-gray-200 ${className}`}
    >
      {/* Rate and Total metrics have been removed. */}
      <span className="inline-flex items-center">
        <span
          className={`w-2 h-2 rounded-full mr-1 ${
            connectionStatus === "connected"
              ? "bg-[#438D98] animate-pulse"
              : connectionStatus === "connecting"
              ? "bg-yellow-400 animate-pulse"
              : "bg-gray-400"
          }`}
        />
        {connectionStatus === "connected"
          ? "Live"
          : connectionStatus === "connecting"
          ? "Connecting"
          : "Offline"}
      </span>
    </div>
  );
}