"use client";
import React from "react";
import { DynamicAssignmentRule } from "@/types/dynamicRules";
import { User } from "@/types/user";
import { RuleBuilderProvider } from "./contexts/RuleBuilderContext";
import {
  RuleConfigurationSection,
  RuleConditionsSection,
  RuleActionsSection,
  RuleScheduleSection,
  TestResultsSection,
  RuleFormActions,
} from "./components";

interface RuleBuilderProps {
  rule?: DynamicAssignmentRule;
  roleId?: string;
  onSave: (rule: DynamicAssignmentRule) => void;
  onTest?: (rule: DynamicAssignmentRule) => Promise<{ matches: number; preview: User[] }>;
}

const RuleBuilderContent: React.FC = () => {
  return (
    <div className="space-y-6">
      <RuleConfigurationSection />
      <RuleConditionsSection />
      <RuleActionsSection />
      <RuleScheduleSection />
      <TestResultsSection />
      <RuleFormActions />
    </div>
  );
};

export const RuleBuilder: React.FC<RuleBuilderProps> = ({
  rule,
  roleId = "",
  onSave,
  onTest,
}) => {
  return (
    <RuleBuilderProvider
      rule={rule}
      roleId={roleId}
      onSave={onSave}
      onTest={onTest}
    >
      <RuleBuilderContent />
    </RuleBuilderProvider>
  );
};
