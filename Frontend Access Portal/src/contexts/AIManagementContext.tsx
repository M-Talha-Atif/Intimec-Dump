"use client";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
} from "react";
import { AIConnectionConfig, AIBehaviorConfig } from "@/types/ai-management";
import { AIManagementContextType } from "@/types/ai-management";

const DEFAULT_CONFIG: AIConnectionConfig = {
  provider: "GOOGLE_AI_STUDIO",
  baseUrl: "https://api.google.com/v1",
  temperature: 0.2,
  maxTokens: 1000,
  systemPrompt:
    "You are an AI assistant for an identity and access management platform. Be precise and concise.",
  isConnected: false,
  lastTested: undefined,
};

const DEFAULT_BEHAVIOR: AIBehaviorConfig = {
  enabledFeatures: [
    "ai-assistant",
    "log-analysis",
    "pattern-analysis",
    "role-ai-assistant",
  ],
  responseMode: "streaming",
  defaultLanguage: "en",
  autoRetryCount: 3,
  fallbackToMock: true,
  confidenceThreshold: 0.7,
  showInputPrompts: true,
  backgroundProcessing: false,
};

const AIManagementContext = createContext<AIManagementContextType | undefined>(
  undefined
);

interface AIManagementProviderProps {
  children: ReactNode;
}

export const AIManagementProvider: React.FC<AIManagementProviderProps> = ({
  children,
}) => {
  const [config, setConfig] = useState<AIConnectionConfig>(DEFAULT_CONFIG);
  const [savedConfig, setSavedConfig] =
    useState<AIConnectionConfig>(DEFAULT_CONFIG);
  const [behavior, setBehavior] = useState<AIBehaviorConfig>(DEFAULT_BEHAVIOR);
  const [savedBehavior, setSavedBehavior] =
    useState<AIBehaviorConfig>(DEFAULT_BEHAVIOR);

  const hasConnectionChanges = useMemo(() => {
    return (
      config.provider !== savedConfig.provider ||
      config.baseUrl !== savedConfig.baseUrl ||
      config.temperature !== savedConfig.temperature ||
      config.maxTokens !== savedConfig.maxTokens ||
      config.systemPrompt !== savedConfig.systemPrompt
    );
  }, [config, savedConfig]);

  const hasBehaviorChanges = useMemo(() => {
    return JSON.stringify(behavior) !== JSON.stringify(savedBehavior);
  }, [behavior, savedBehavior]);

  const hasUnsavedChanges = hasConnectionChanges || hasBehaviorChanges;

  const updateConfig = (updates: Partial<AIConnectionConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  const updateBehavior = (updates: Partial<AIBehaviorConfig>) => {
    setBehavior((prev) => ({ ...prev, ...updates }));
  };

  const saveConfig = () => {
    setSavedConfig(config);
  };

  const saveBehavior = () => {
    setSavedBehavior(behavior);
  };

  const resetConfig = () => {
    setConfig(savedConfig);
  };

  const resetBehavior = () => {
    setBehavior(savedBehavior);
  };

  const resetBehaviorToDefaults = () => {
    setBehavior(DEFAULT_BEHAVIOR);
  };

  const resetToDefaults = () => {
    setConfig((prev) => ({
      ...DEFAULT_CONFIG,
      isConnected: prev.isConnected,
      lastTested: prev.lastTested,
    }));
  };

  const value: AIManagementContextType = {
    config,
    savedConfig,
    setConfig,
    updateConfig,
    saveConfig,
    resetConfig,
    resetToDefaults,
    hasUnsavedChanges,
    hasConnectionChanges,
    hasBehaviorChanges,
    behavior,
    savedBehavior,
    setBehavior,
    updateBehavior,
    saveBehavior,
    resetBehavior,
    resetBehaviorToDefaults,
  };

  return (
    <AIManagementContext.Provider value={value}>
      {children}
    </AIManagementContext.Provider>
  );
};

// Custom hook to use the context
export const useAIManagement = (): AIManagementContextType => {
  const context = useContext(AIManagementContext);
  if (!context) {
    throw new Error(
      "useAIManagement must be used within an AIManagementProvider"
    );
  }
  return context;
};

export default AIManagementContext;
