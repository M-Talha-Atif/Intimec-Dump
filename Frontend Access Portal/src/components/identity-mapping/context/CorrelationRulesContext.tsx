import React, { createContext, useContext } from "react";
import { CorrelationRule, SchemaAttribute, IdentityType } from "../types/index";
import { CorrelationRuleApiResponse } from "../utils/correlationUtils";
import type { AvailableSource } from "../hooks/useCorrelationRules";

export interface IdentityAttribute {
  systemKey: string;
  displayName: string;
}

interface CorrelationRulesContextValue {
  // State
  rules: CorrelationRule[];
  isTestRunning: boolean;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  isLoading: boolean;
  error: string | null;
  apiRules: CorrelationRuleApiResponse[];
  availableSources: AvailableSource[];

  // Schema attributes state (account/connector side)
  schemaAttributes: Record<string, SchemaAttribute[]>;
  isLoadingSchemaAttributes: Record<string, boolean>;
  schemaAttributesError: Record<string, string | null>;

  // Identity attributes state (identity schema side)
  identityAttributes: IdentityAttribute[];
  isLoadingIdentityAttributes: boolean;

  // Actions
  addRule: () => void;
  setRuleSource: (ruleId: string, sourceId: string) => Promise<void>;
  updateApiRule: (cardId: string, ruleGroup: { combinator: string; rules: { field: string; operator: string; valueSource: string; value: string }[] }) => void;
  updateRule: (id: string, updates: Partial<CorrelationRule>) => void;
  deleteRule: (
    id: string,
    onConfirm?: () => void
  ) => void | { rule: CorrelationRule; performDeletion: () => void };
  movePriority: (id: string, direction: "up" | "down") => void;
  testRules: () => Promise<void>;
  saveRules: () => Promise<void>;
  discardChanges: () => Promise<void>;
  toggleRuleSource: (ruleId: string, source: string) => void;
  refreshRules: () => Promise<void>;

  // Computed values
  activeRulesCount: number;
  validRulesCount: number;
  invalidRulesCount: number;
}

const CorrelationRulesContext = createContext<
  CorrelationRulesContextValue | undefined
>(undefined);

export const useCorrelationRulesContext = () => {
  const context = useContext(CorrelationRulesContext);
  if (context === undefined) {
    throw new Error(
      "useCorrelationRulesContext must be used within a CorrelationRulesProvider"
    );
  }
  return context;
};

interface CorrelationRulesProviderProps {
  children: React.ReactNode;
  value: CorrelationRulesContextValue;
}

export const CorrelationRulesProvider: React.FC<
  CorrelationRulesProviderProps
> = ({ children, value }) => {
  return (
    <CorrelationRulesContext.Provider value={value}>
      {children}
    </CorrelationRulesContext.Provider>
  );
};