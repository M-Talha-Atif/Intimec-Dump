import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { CorrelationRule } from "../../types/index";

interface RuleValidationBadgeProps {
  rule: CorrelationRule;
}

export const RuleValidationBadge: React.FC<RuleValidationBadgeProps> = ({
  rule,
}) => {
  if (rule.isValid) {
    return (
      <Badge variant="default" className="bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3 mr-1" />
        Valid
      </Badge>
    );
  } else {
    return (
      <Badge variant="destructive">
        <AlertTriangle className="h-3 w-3 mr-1" />
        Invalid
      </Badge>
    );
  }
};
