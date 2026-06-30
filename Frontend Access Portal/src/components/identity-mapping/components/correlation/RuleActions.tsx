import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { CorrelationRule } from "../../types/index";

interface RuleActionsProps {
  rule: CorrelationRule;
  onMovePriority: (direction: "up" | "down") => void;
  onDelete: () => void;
}

export const RuleActions: React.FC<RuleActionsProps> = ({
  rule,
  onMovePriority,
  onDelete,
}) => {
  return (
    <div className="flex items-center space-x-2">
      <Button variant="ghost" size="sm" onClick={() => onMovePriority("up")}>
        <ArrowUp className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={() => onMovePriority("down")}>
        <ArrowDown className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={onDelete}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};
