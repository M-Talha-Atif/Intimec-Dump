"use client";

import React, { createContext, useState, useContext, ReactNode } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface FeatureMessages {
  [feature: string]: Message[];
}

interface AIAssistantContextType {
  isAssistantOpen: boolean;
  setIsAssistantOpen: (open: boolean) => void;
  currentFeature: string;
  setCurrentFeature: (feature: string) => void;
  messages: Message[];
  allMessages: FeatureMessages;
  addMessage: (content: string, role: "user" | "assistant") => void;
  clearMessages: (feature?: string) => void;
  openAssistantWithPrompt: (feature: string, promptContent: string) => void;
  availableFeatures: string[];
}

const AVAILABLE_FEATURES = [
  "AI Assistant (Global)",
  "Debugging Assistant",
  "Audit Log Analyzer",
  "Security Policy Advisor",
  "Compliance Reporter",
  "Role AI Assistant",
  "Pattern Analysis",
];

const createInitialMessage = (feature: string): Message => ({
  id: `initial-${feature}`,
  role: "assistant",
  content: `Hello! I'm your ${feature}. How can I help you today?`,
  timestamp: Date.now(),
});

const AIAssistantContext = createContext<AIAssistantContextType | undefined>(
  undefined
);

export const AIAssistantProvider = ({ children }: { children: ReactNode }) => {
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [currentFeature, setCurrentFeatureState] = useState<string>(
    AVAILABLE_FEATURES[0]
  );

  // Store messages per feature
  const [allMessages, setAllMessages] = useState<FeatureMessages>({
    [AVAILABLE_FEATURES[0]]: [createInitialMessage(AVAILABLE_FEATURES[0])],
  });

  // Get messages for current feature
  const messages = allMessages[currentFeature] || [
    createInitialMessage(currentFeature),
  ];

  const setCurrentFeature = (feature: string) => {
    setCurrentFeatureState(feature);

    // Initialize messages for feature if not exists
    if (!allMessages[feature]) {
      setAllMessages((prev) => ({
        ...prev,
        [feature]: [createInitialMessage(feature)],
      }));
    }
  };

  const addMessage = (content: string, role: "user" | "assistant") => {
    const newMessage: Message = {
      id: `${Date.now()}-${Math.random()}`,
      role,
      content,
      timestamp: Date.now(),
    };

    setAllMessages((prev) => ({
      ...prev,
      [currentFeature]: [...(prev[currentFeature] || []), newMessage],
    }));
  };

  const clearMessages = (feature?: string) => {
    const targetFeature = feature || currentFeature;

    setAllMessages((prev) => ({
      ...prev,
      [targetFeature]: [createInitialMessage(targetFeature)],
    }));
  };

  const openAssistantWithPrompt = (feature: string, promptContent: string) => {
    setCurrentFeature(feature);
    setIsAssistantOpen(true);

    // Add user message to the feature's conversation
    const newMessage: Message = {
      id: `${Date.now()}-${Math.random()}`,
      role: "user",
      content: promptContent,
      timestamp: Date.now(),
    };

    setAllMessages((prev) => ({
      ...prev,
      [feature]: [
        ...(prev[feature] || [createInitialMessage(feature)]),
        newMessage,
      ],
    }));
  };

  return (
    <AIAssistantContext.Provider
      value={{
        isAssistantOpen,
        setIsAssistantOpen,
        currentFeature,
        setCurrentFeature,
        messages,
        allMessages,
        addMessage,
        clearMessages,
        openAssistantWithPrompt,
        availableFeatures: AVAILABLE_FEATURES,
      }}
    >
      {children}
    </AIAssistantContext.Provider>
  );
};

export const useAIAssistant = () => {
  const context = useContext(AIAssistantContext);
  if (context === undefined) {
    throw new Error("useAIAssistant must be used within AIAssistantProvider");
  }
  return context;
};
