"use client";
import * as React from "react";
import { useAIAssistant } from "@/contexts/AIAssistantContext";
import { Button } from "@/components/ui/button";
import { Sparkles, X } from "lucide-react";
import { usePathname } from "next/navigation";
import ChatInterface from "./ChatInterface";

export const AIAssistantPanel = () => {
  const { setIsAssistantOpen } = useAIAssistant();
  const pathname = usePathname();

  if (pathname === "/ai-chat") {
    setIsAssistantOpen(false);
    return null;
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-4 border-b border-border flex justify-between items-center flex-shrink-0 bg-card">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-card-foreground">
          <Sparkles className="h-5 w-5 text-primary" />
          <span>AI Assistant</span>
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsAssistantOpen(false)}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <ChatInterface />
    </div>
  );
};

export const AIAssistantButton = () => {
  const { isAssistantOpen, setIsAssistantOpen } = useAIAssistant();
  const pathname = usePathname();

  // Hide the button when on the full-screen chat page
  if (isAssistantOpen || pathname === "/ai-chat") return null;

  return (
    <Button
      variant="default"
      className="fixed bottom-6 right-6 z-50 rounded-full p-3 shadow-lg hover:shadow-xl transition"
      onClick={() => setIsAssistantOpen(true)}
      aria-label="Open AI Assistant"
    >
      <Sparkles className="h-6 w-6" />
    </Button>
  );
};
