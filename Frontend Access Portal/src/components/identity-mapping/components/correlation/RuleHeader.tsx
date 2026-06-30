import React from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CorrelationRule } from "../../types/index";
import { RuleValidationBadge } from "./RuleValidationBadge";

interface RuleHeaderProps {
  rule: CorrelationRule;
  sourceName?: string;
  onUpdateName: (name: string) => void;
}

export const RuleHeader: React.FC<RuleHeaderProps> = ({
  rule,
  sourceName,
  onUpdateName,
}) => {
  return (
    <div className="flex items-center gap-2 flex-wrap min-w-0">
      <Input
        value={rule.name}
        onChange={(e) => onUpdateName(e.target.value)}
        className="font-medium text-base w-48 shrink-0"
      />
      {sourceName && (
        <Badge variant="outline" className="shrink-0 whitespace-nowrap max-w-[200px] truncate" title={sourceName}>
          {sourceName}
        </Badge>
      )}
      <Badge variant={rule.type === "primary" ? "default" : "secondary"} className="shrink-0 whitespace-nowrap">
        {rule.type}
      </Badge>
      <Badge variant="outline" className="shrink-0 whitespace-nowrap">
        #{rule.priority}
      </Badge>
      <RuleValidationBadge rule={rule} />
    </div>
  );
};
