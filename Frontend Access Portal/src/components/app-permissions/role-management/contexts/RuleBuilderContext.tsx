import React, { createContext, useContext, ReactNode } from "react";
import { DynamicAssignmentRule } from "@/types/dynamicRules";
import {
  useRuleBuilder,
  UseRuleBuilderReturn,
  TestResults,
} from "../hooks/useRuleBuilder";

export interface RuleBuilderContextType extends UseRuleBuilderReturn {
  rule?: DynamicAssignmentRule;
  roleId: string;
  onSave: (rule: DynamicAssignmentRule) => void;
  onTest?: (rule: DynamicAssignmentRule) => Promise<TestResults>;
}

const RuleBuilderContext = createContext<RuleBuilderContextType | null>(null);

export interface RuleBuilderProviderProps {
  children: ReactNode;
  rule?: DynamicAssignmentRule;
  roleId: string;
  onSave: (rule: DynamicAssignmentRule) => void;
  onTest?: (rule: DynamicAssignmentRule) => Promise<TestResults>;
}

export const RuleBuilderProvider: React.FC<RuleBuilderProviderProps> = ({
  children,
  rule,
  roleId,
  onSave,
  onTest,
}) => {
  const ruleBuilder = useRuleBuilder(rule, roleId);

  const contextValue: RuleBuilderContextType = {
    ...ruleBuilder,
    rule,
    roleId,
    onSave,
    onTest,
  };

  return (
    <RuleBuilderContext.Provider value={contextValue}>
      {children}
    </RuleBuilderContext.Provider>
  );
};

export const useRuleBuilderContext = (): RuleBuilderContextType => {
  const context = useContext(RuleBuilderContext);
  if (!context) {
    throw new Error(
      "useRuleBuilderContext must be used within a RuleBuilderProvider"
    );
  }
  return context;
};
