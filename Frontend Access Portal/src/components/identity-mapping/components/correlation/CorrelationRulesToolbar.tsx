import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Play, Save } from "lucide-react";

interface CorrelationRulesToolbarProps {
  isTestRunning: boolean;
  isSaving?: boolean;
  hasUnsavedChanges?: boolean;
  onTestRules: () => void;
  onAddRule: () => void;
  onSaveRules?: () => void;
}

export const CorrelationRulesToolbar: React.FC<
  CorrelationRulesToolbarProps
> = ({ isTestRunning, isSaving = false, hasUnsavedChanges = false, onTestRules, onAddRule, onSaveRules }) => {
  return (
    <div className="flex items-center space-x-2">
      <Button
        onClick={onTestRules}
        disabled={isTestRunning}
        variant="outline"
        className="flex items-center space-x-2"
      >
        <Play className="h-4 w-4" />
        <span>{isTestRunning ? "Testing..." : "Test Rules"}</span>
      </Button>
      <Button onClick={onAddRule} variant="outline" className="flex items-center space-x-2">
        <Plus className="h-4 w-4" />
        <span>Add Rule</span>
      </Button>
      {onSaveRules && (
        <Button
          onClick={onSaveRules}
          disabled={isSaving || !hasUnsavedChanges}
          className="flex items-center space-x-2"
        >
          <Save className="h-4 w-4" />
          <span>{isSaving ? "Saving..." : "Save Rules"}</span>
        </Button>
      )}
    </div>
  );
};
