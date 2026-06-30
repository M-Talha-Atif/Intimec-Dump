"use client";

import React from "react";
import { useAIAssistant } from "@/contexts/AIAssistantContext";
import { AIAssistantPanel } from "@/components/ai/AIAssistant";
import { WebSocketProvider } from "@/contexts/WebSocketContext";

export default function DashboardClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAssistantOpen } = useAIAssistant();

  return (
    <WebSocketProvider>
      <div
        className={`h-full transition-all duration-300 ease-in-out ${
          isAssistantOpen ? "mr-[500px]" : "mr-0"
        }`}
      >
        {children}
      </div>

      {isAssistantOpen && (
        <div
          className="fixed right-0 w-[500px] bg-background border-l border-border shadow-xl z-40 overflow-hidden"
          style={{
            top: "var(--header-height, 56px)",
            height: "calc(100vh - var(--header-height, 56px))",
          }}
        >
          <AIAssistantPanel />
        </div>
      )}
    </WebSocketProvider>
  );
}
