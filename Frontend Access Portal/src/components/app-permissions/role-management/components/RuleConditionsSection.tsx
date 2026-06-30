import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRuleBuilderContext } from "../contexts/RuleBuilderContext";
import { SimpleVisualBuilder } from "./SimpleVisualBuilder";
import { ScriptEditor } from "../ScriptEditor";
import { AlertCircle } from "lucide-react";

interface RuleConditionsSectionProps {
  error?: string;
}

export const RuleConditionsSection: React.FC<RuleConditionsSectionProps> = ({ error }) => {
  const {
    conditionMode,
    setConditionMode,
    scriptConditions,
    setScriptConditions,
  } = useRuleBuilderContext();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rule Conditions</CardTitle>
        <p className="text-sm text-muted-foreground">
          Define the conditions that users must meet to be assigned this role.
          Use the visual builder to create conditions based on User entity fields,
          or write custom scripts directly.
        </p>
        <div className="flex items-center gap-2 mt-4">
          <Button
            variant={conditionMode === "visual" ? "default" : "outline"}
            size="sm"
            onClick={() => setConditionMode("visual")}
          >
            Visual Builder
          </Button>
          <Button
            variant={conditionMode === "script" ? "default" : "outline"}
            size="sm"
            onClick={() => setConditionMode("script")}
          >
            Script Editor
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {conditionMode === "visual" ? (
          <SimpleVisualBuilder />
        ) : (
          <ScriptEditor
            initialScript={scriptConditions}
            onChange={setScriptConditions}
          />
        )}
        {error && (
          <div className="flex items-center gap-2 mt-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
