import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { CorrelationRule } from "../../types/index";

interface RuleValidationErrorsProps {
  rule: CorrelationRule;
}

export const RuleValidationErrors: React.FC<RuleValidationErrorsProps> = ({
  rule,
}) => {
  if (!rule.validationErrors || rule.validationErrors.length === 0) {
    return null;
  }

  return (
    <Alert className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <ul className="list-disc list-inside text-sm">
          {rule.validationErrors.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
};
