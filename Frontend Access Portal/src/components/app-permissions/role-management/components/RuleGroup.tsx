import React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Plus, AlertCircle } from "lucide-react";
import { RuleGroup as RuleGroupType } from "@/types/dynamicRules";
import { useRuleBuilderContext } from "../contexts/RuleBuilderContext";
import { RuleCondition } from "./RuleCondition";

interface RuleGroupProps {
  group: RuleGroupType;
  level?: number;
}

export const RuleGroup: React.FC<RuleGroupProps> = ({ group, level = 0 }) => {
  const { addCondition, addGroup, updateGroupOperator } =
    useRuleBuilderContext();

  return (
    <Card
      key={group.id}
      className={`${level > 0 ? "ml-6 border-l-4 border-l-primary/20" : ""}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant={group.operator === "AND" ? "default" : "secondary"}>
              {group.operator}
            </Badge>
            <Select
              value={group.operator}
              onValueChange={(value) =>
                updateGroupOperator(group.id, value as "AND" | "OR")
              }
            >
              <SelectTrigger className="w-20 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border border-border">
                <SelectItem value="AND">AND</SelectItem>
                <SelectItem value="OR">OR</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => addCondition(group.id)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Condition
            </Button>
            {level < 2 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => addGroup(group.id)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Group
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {group.conditions.map((condition) => (
          <RuleCondition
            key={condition.id}
            condition={condition}
            groupId={group.id}
          />
        ))}
        {group.groups?.map((subGroup) => (
          <RuleGroup key={subGroup.id} group={subGroup} level={level + 1} />
        ))}
        {group.conditions.length === 0 &&
          (!group.groups || group.groups.length === 0) && (
            <div className="text-center py-4 text-muted-foreground">
              <AlertCircle className="h-6 w-6 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                No conditions defined. Add conditions or groups above.
              </p>
            </div>
          )}
      </CardContent>
    </Card>
  );
};
