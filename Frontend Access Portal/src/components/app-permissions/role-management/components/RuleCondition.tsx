import React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import { RuleCondition as RuleConditionType } from "@/types/dynamicRules";
import { USER_ATTRIBUTES, RULE_OPERATORS } from "../data/ruleBuilderData";
import { useRuleBuilderContext } from "../contexts/RuleBuilderContext";

interface RuleConditionProps {
  condition: RuleConditionType;
  groupId: string;
}

export const RuleCondition: React.FC<RuleConditionProps> = ({
  condition,
  groupId,
}) => {
  const { handleFieldChange, updateCondition, removeCondition } =
    useRuleBuilderContext();

  const attribute = USER_ATTRIBUTES.find(
    (attr) => attr.field === condition.field
  );
  const operators = attribute ? RULE_OPERATORS[attribute.type] || [] : [];

  return (
    <div
      key={condition.id}
      className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border"
    >
      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
        <Select
          value={condition.field}
          onValueChange={(value) =>
            handleFieldChange(groupId, condition.id, value)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select field" />
          </SelectTrigger>
          <SelectContent className="bg-popover border border-border">
            {USER_ATTRIBUTES.map((attr) => (
              <SelectItem key={attr.field} value={attr.field}>
                {attr.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={condition.operator}
          onValueChange={(value) =>
            updateCondition(groupId, condition.id, {
              operator: value as RuleConditionType["operator"],
            })
          }
          disabled={!condition.field}
        >
          <SelectTrigger>
            <SelectValue placeholder="Operator" />
          </SelectTrigger>
          <SelectContent className="bg-popover border border-border">
            {operators.map((op) => (
              <SelectItem key={op.value} value={op.value}>
                {op.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {condition.valueType === "list" && attribute?.options ? (
          <Select
            value={
              Array.isArray(condition.value)
                ? condition.value[0]
                : (condition.value as string)
            }
            onValueChange={(value) =>
              updateCondition(groupId, condition.id, { value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select value" />
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border">
              {attribute.options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            placeholder="Enter value"
            value={condition.value as string}
            onChange={(e) =>
              updateCondition(groupId, condition.id, {
                value: e.target.value,
              })
            }
            type={condition.valueType === "number" ? "number" : "text"}
          />
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => removeCondition(groupId, condition.id)}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
