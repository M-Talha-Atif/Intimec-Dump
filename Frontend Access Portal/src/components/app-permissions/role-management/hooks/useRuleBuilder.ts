import { useState, useCallback, useEffect } from "react";
import {
  DynamicAssignmentRule,
  RuleGroup,
  RuleCondition,
} from "@/types/dynamicRules";
import { User } from "@/types/user";
import {
  createEmptyRule,
  createEmptyCondition,
  createEmptyGroup,
  addConditionToGroup,
  removeConditionFromGroup,
  updateConditionInGroup,
  addGroupToParent,
  updateGroupOperator,
  handleFieldChange as handleFieldChangeUtil,
  validateRule,
  buildTestRule,
} from "../utils/ruleBuilderUtils";
import { CreateDynamicRuleRequest } from "../types";
import { convertVisualConditionsToScript } from "../utils/conditionScriptConverter";

export interface TestResults {
  matches: number;
  preview: User[];
}

export interface UseRuleBuilderReturn {
  // Form state
  ruleName: string;
  ruleDescription: string;
  isActive: boolean;
  priority: number;
  conditions: RuleGroup;
  schedule: DynamicAssignmentRule["schedule"];
  actions: DynamicAssignmentRule["actions"];
  testResults: TestResults | null;
  isTesting: boolean;
  conditionMode: "visual" | "script";
  scriptConditions: string;
  scriptLang: "typescript" | "python" | "shell" | "groovy" | "beanshell";

  // Form setters
  setRuleName: (name: string) => void;
  setRuleDescription: (description: string) => void;
  setIsActive: (active: boolean) => void;
  setPriority: (priority: number) => void;
  setSchedule: (
    schedule: NonNullable<DynamicAssignmentRule["schedule"]>
  ) => void;
  setActions: (actions: DynamicAssignmentRule["actions"]) => void;
  setConditionMode: (mode: "visual" | "script") => void;
  setScriptConditions: (script: string) => void;
  setScriptLang: (
    lang: "typescript" | "python" | "shell" | "groovy" | "beanshell"
  ) => void;
  loadScriptConditions: (script: string) => void;

  // Condition management
  addCondition: (groupId: string) => void;
  removeCondition: (groupId: string, conditionId: string) => void;
  updateCondition: (
    groupId: string,
    conditionId: string,
    updates: Partial<RuleCondition>
  ) => void;
  handleFieldChange: (
    groupId: string,
    conditionId: string,
    field: string
  ) => void;

  // Group management
  addGroup: (parentGroupId: string) => void;
  updateGroupOperator: (groupId: string, operator: "AND" | "OR") => void;

  // Actions
  handleTest: (
    onTest?: (rule: DynamicAssignmentRule) => Promise<TestResults>
  ) => Promise<void>;
  handleSave: (
    onSave: (rule: CreateDynamicRuleRequest) => void,
    roleId: string
  ) => void;
  resetForm: () => void;

  // Validation
  isValid: boolean;
  validationErrors: string[];
}

export const useRuleBuilder = (
  initialRule?: DynamicAssignmentRule,
  roleId?: string
): UseRuleBuilderReturn => {
  // Initialize form state
  const emptyRule = createEmptyRule(roleId || "");
  const [ruleName, setRuleName] = useState(initialRule?.name || "");
  const [ruleDescription, setRuleDescription] = useState(
    initialRule?.description || ""
  );
  const [isActive, setIsActive] = useState(initialRule?.isActive ?? true);
  const [priority, setPriority] = useState(initialRule?.priority || 1);
  const [conditions, setConditions] = useState<RuleGroup>(
    initialRule?.conditions || emptyRule.conditions!
  );
  const [schedule, setSchedule] = useState(
    initialRule?.schedule || emptyRule.schedule!
  );
  const [actions, setActions] = useState(
    initialRule?.actions || emptyRule.actions!
  );
  const [testResults, setTestResults] = useState<TestResults | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [conditionMode, setConditionMode] = useState<"visual" | "script">(
    "visual"
  );
  const [scriptConditions, setScriptConditions] = useState("");
  const [scriptLang, setScriptLang] = useState<
    "typescript" | "python" | "shell" | "groovy" | "beanshell"
  >("typescript");

  // Auto-sync visual conditions to script when in visual mode
  useEffect(() => {
    if (conditionMode === "visual") {
      const generatedScript = convertVisualConditionsToScript(conditions);
      setScriptConditions(generatedScript);
    }
  }, [conditions, conditionMode]);

  // Condition management
  const addCondition = useCallback((groupId: string) => {
    const newCondition = createEmptyCondition();
    setConditions((prev) => addConditionToGroup(prev, groupId, newCondition));
  }, []);

  const removeCondition = useCallback(
    (groupId: string, conditionId: string) => {
      setConditions((prev) =>
        removeConditionFromGroup(prev, groupId, conditionId)
      );
    },
    []
  );

  const updateCondition = useCallback(
    (groupId: string, conditionId: string, updates: Partial<RuleCondition>) => {
      setConditions((prev) =>
        updateConditionInGroup(prev, groupId, conditionId, updates)
      );
    },
    []
  );

  const handleFieldChange = useCallback(
    (groupId: string, conditionId: string, field: string) => {
      setConditions((prev) =>
        handleFieldChangeUtil(prev, groupId, conditionId, field)
      );
    },
    []
  );

  // Group management
  const addGroup = useCallback((parentGroupId: string) => {
    const newGroup = createEmptyGroup();
    setConditions((prev) => addGroupToParent(prev, parentGroupId, newGroup));
  }, []);

  const updateGroupOperatorCallback = useCallback(
    (groupId: string, operator: "AND" | "OR") => {
      setConditions((prev) => updateGroupOperator(prev, groupId, operator));
    },
    []
  );

  // Actions
  const handleTest = useCallback(
    async (onTest?: (rule: DynamicAssignmentRule) => Promise<TestResults>) => {
      if (!onTest) return;

      setIsTesting(true);
      try {
        const currentRule = {
          name: ruleName,
          description: ruleDescription,
          isActive,
          priority,
          conditions,
          actions,
          schedule,
        };

        const testRule = buildTestRule(currentRule, roleId || "test-role");
        const results = await onTest(testRule);
        setTestResults(results);
      } catch (error) {
        console.error("Rule test failed:", error);
      } finally {
        setIsTesting(false);
      }
    },
    [
      ruleName,
      ruleDescription,
      isActive,
      priority,
      conditions,
      actions,
      schedule,
      roleId,
    ]
  );

  const handleSave = useCallback(
    (
      onSave: (rule: CreateDynamicRuleRequest) => void,
      currentRoleId: string
    ) => {
      const currentRule = {
        roleId: currentRoleId,
        ruleIsActive: isActive,
        ruleConditionScript: scriptConditions,
        sendNotificationOnAssignment: actions.sendNotification ?? false,
        requireApprovalBeforeAssignment: actions.requireApproval ?? false,
        scheduleType: schedule?.type.toUpperCase() || "IMMEDIATE",
        time: schedule?.time || "12:00",
      };
      console.log("Saving rule:", currentRule);

      onSave(currentRule);
    },
    [isActive, actions, schedule, scriptConditions]
  );

  const resetForm = useCallback(() => {
    const emptyRule = createEmptyRule(roleId || "");
    setRuleName("");
    setRuleDescription("");
    setIsActive(true);
    setPriority(1);
    setConditions(emptyRule.conditions!);
    setSchedule(emptyRule.schedule!);
    setActions(emptyRule.actions!);
    setTestResults(null);
    setConditionMode("visual");
    setScriptConditions("");
    setScriptLang("typescript");
  }, [roleId]);

  const loadScriptConditions = useCallback((script: string) => {
    // Set the script
    setScriptConditions(script);
    
    // Parse script to visual conditions
    const { parseScriptToConditions } = require("../utils/scriptToConditionsParser");
    const parsedConditions = parseScriptToConditions(script);
    
    if (parsedConditions && parsedConditions.length > 0) {
      // Create a new root group with parsed conditions
      setConditions((prev) => ({
        ...prev,
        conditions: parsedConditions,
      }));
    }
  }, []);

  // Validation
  const currentRule = {
    name: ruleName,
    description: ruleDescription,
    isActive,
    priority,
    conditions,
    actions,
    schedule,
  };

  const validationErrors = validateRule(currentRule);
  const isValid = validationErrors.length === 0;

  return {
    // Form state
    ruleName,
    ruleDescription,
    isActive,
    priority,
    conditions,
    schedule,
    actions,
    testResults,
    isTesting,
    conditionMode,
    scriptConditions,
    scriptLang,

    // Form setters
    setRuleName,
    setRuleDescription,
    setIsActive,
    setPriority,
    setSchedule,
    setActions,
    setConditionMode,
    setScriptConditions,
    setScriptLang,
    loadScriptConditions,

    // Condition management
    addCondition,
    removeCondition,
    updateCondition,
    handleFieldChange,

    // Group management
    addGroup,
    updateGroupOperator: updateGroupOperatorCallback,

    // Actions
    handleTest,
    handleSave,
    resetForm,

    // Validation
    isValid,
    validationErrors,
  };
};
