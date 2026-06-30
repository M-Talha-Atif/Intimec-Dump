import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Trash2 } from "lucide-react";
import { useRuleBuilderContext } from "../contexts/RuleBuilderContext";
import { USER_ATTRIBUTES, RULE_OPERATORS } from "../data/ruleBuilderData";
import { RuleCondition as RuleConditionType } from "@/types/dynamicRules";

interface ConditionWithOperator extends RuleConditionType {
  logicalOperator?: "AND" | "OR";
}

export const SimpleVisualBuilder: React.FC = () => {
  const {
    conditions,
    addCondition,
    removeCondition,
    updateCondition,
    handleFieldChange,
  } = useRuleBuilderContext();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [conditionToDelete, setConditionToDelete] = useState<string | null>(null);

  const rootGroupId = conditions.id;
  const conditionsList = conditions.conditions as ConditionWithOperator[];

  const updateLogicalOperator = (conditionId: string, operator: "AND" | "OR") => {
    updateCondition(rootGroupId, conditionId, {
      logicalOperator: operator,
    } as any);
  };

  const handleDeleteClick = (conditionId: string) => {
    setConditionToDelete(conditionId);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (conditionToDelete) {
      removeCondition(rootGroupId, conditionToDelete);
      setConditionToDelete(null);
    }
    setShowDeleteConfirm(false);
  };

  return (
    <div className="space-y-4">
      {/* Conditions List */}
      <div className="space-y-3">
        {conditionsList.map((condition, index) => {
          const attribute = USER_ATTRIBUTES.find(
            (attr) => attr.field === condition.field
          );
          const operators = attribute ? RULE_OPERATORS[attribute.type] || [] : [];

          return (
            <React.Fragment key={condition.id}>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    {/* Condition Number Badge */}
                    <div className="flex items-center justify-center w-8 h-10 bg-primary/10 text-primary rounded-md text-sm font-medium">
                      {index + 1}
                    </div>

                  {/* Condition Fields */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Field Selector */}
                    <Select
                      value={condition.field}
                      onValueChange={(value) =>
                        handleFieldChange(rootGroupId, condition.id, value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select field" />
                      </SelectTrigger>
                      <SelectContent className="max-h-80">
                        {USER_ATTRIBUTES.map((attr) => (
                          <SelectItem key={attr.field} value={attr.field}>
                            {attr.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Operator Selector */}
                    <Select
                      value={condition.operator}
                      onValueChange={(value) =>
                        updateCondition(rootGroupId, condition.id, {
                          operator: value as RuleConditionType["operator"],
                        })
                      }
                      disabled={!condition.field}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Operator" />
                      </SelectTrigger>
                      <SelectContent>
                        {operators.map((op) => (
                          <SelectItem key={op.value} value={op.value}>
                            {op.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Value Input */}
                    {condition.valueType === "list" && attribute?.options ? (
                      <Select
                        value={
                          Array.isArray(condition.value)
                            ? condition.value[0]
                            : (condition.value as string)
                        }
                        onValueChange={(value) =>
                          updateCondition(rootGroupId, condition.id, { value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select value" />
                        </SelectTrigger>
                        <SelectContent>
                          {attribute.options.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : condition.valueType === "boolean" ? (
                      <Select
                        value={String(condition.value)}
                        onValueChange={(value) =>
                          updateCondition(rootGroupId, condition.id, {
                            value: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select value" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">True</SelectItem>
                          <SelectItem value="false">False</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        placeholder="Enter value"
                        value={condition.value as string}
                        onChange={(e) =>
                          updateCondition(rootGroupId, condition.id, {
                            value: e.target.value,
                          })
                        }
                        type={
                          condition.valueType === "number"
                            ? "number"
                            : condition.valueType === "date"
                            ? "date"
                            : "text"
                        }
                      />
                    )}
                  </div>

                    {/* Delete Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(condition.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Logical Operator Between Conditions - Outside cards, aligned with inputs */}
              {index < conditionsList.length - 1 && (
                <div className="flex items-center gap-3 my-2">
                  {/* Spacer for badge alignment */}
                  <div className="w-8"></div>
                  
                  {/* AND/OR selector aligned with the operator field */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3 ml-3">
                    <div></div>
                    <Select
                      value={condition.logicalOperator || "AND"}
                      onValueChange={(value: "AND" | "OR") =>
                        updateLogicalOperator(condition.id, value)
                      }
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AND">AND</SelectItem>
                        <SelectItem value="OR">OR</SelectItem>
                      </SelectContent>
                    </Select>
                    <div></div>
                  </div>

                  {/* Spacer for delete button alignment */}
                  <div className="w-10"></div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Add Condition Button */}
      <Button
        type="button"
        variant="outline"
        onClick={() => addCondition(rootGroupId)}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Condition
      </Button>

      {/* Empty State */}
      {conditionsList.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              No conditions defined yet
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => addCondition(rootGroupId)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Condition
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Condition?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this condition? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
