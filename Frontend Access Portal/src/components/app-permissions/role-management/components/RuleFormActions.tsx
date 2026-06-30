import React from "react";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { useRuleBuilderContext } from "../contexts/RuleBuilderContext";

export const RuleFormActions: React.FC = () => {
  const {
    handleTest,
    handleSave,
    isTesting,
    isValid,
    ruleName,
    roleId,
    onSave,
    onTest,
  } = useRuleBuilderContext();

  console.log("roleId in RuleFormActions:", roleId);

  const onTestClick = () => {
    handleTest(onTest);
  };

  const onSaveClick = () => {
    handleSave(onSave, roleId);
  };

  return (
    <div className="flex items-center justify-between pt-4 border-t">
      <div className="flex items-center gap-3">
        {onTest && (
          <Button
            variant="outline"
            onClick={onTestClick}
            disabled={isTesting || !ruleName.trim()}
          >
            <Play className="h-4 w-4 mr-2" />
            {isTesting ? "Testing..." : "Test Rule"}
          </Button>
        )}
      </div>
      <div className="flex items-center gap-3">
        <Button onClick={onSaveClick}>Save Rule</Button>
      </div>
    </div>
  );
};
