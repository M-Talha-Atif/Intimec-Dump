import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { CorrelationRule, IdentityType } from "../../types/index";
import { useCorrelationRulesContext } from "../../context/CorrelationRulesContext";
import { RuleHeader } from "./RuleHeader";
import { RuleActions } from "./RuleActions";
import { RuleValidationErrors } from "./RuleValidationErrors";
import AttributeMatchingUI from "./AttributeMatchingUI";

interface CorrelationRuleCardProps {
  rule: CorrelationRule;
  identityType: IdentityType;
}

export const CorrelationRuleCard: React.FC<CorrelationRuleCardProps> = ({
  rule,
}) => {
  const { updateRule, deleteRule, movePriority, availableSources, setRuleSource, updateApiRule, rules } = useCorrelationRulesContext();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [pendingDeletion, setPendingDeletion] = useState<{
    rule: CorrelationRule;
    performDeletion: () => void;
  } | null>(null);

  const selectedSourceId = rule.sources[0] || "";

  // All available sources are selectable — multiple rules can reference the same source
  const selectableSources = availableSources;

  // Resolve the display name for the selected source
  const selectedSourceName = availableSources.find((s) => s.id === selectedSourceId)?.name;

  const handleUpdateRule = (updates: Partial<CorrelationRule>) => {
    updateRule(rule.id, updates);
  };

  const handleSourceChange = (sourceId: string) => {
    setRuleSource(rule.id, sourceId);
  };

  const handleRuleGroupChange = (ruleGroup: { combinator: string; rules: { field: string; operator: string; valueSource: string; value: string }[] }) => {
    // Key update by rule.id (=_cardId) so two cards sharing the same source don't overwrite each other.
    updateApiRule(rule.id, ruleGroup);
  };

  const handleDeleteClick = () => {
    const result = deleteRule(rule.id, () => {
      setIsDeleteDialogOpen(false);
      setPendingDeletion(null);
    });

    if (result && typeof result === "object" && "rule" in result) {
      setPendingDeletion(result);
      setIsDeleteDialogOpen(true);
    }
  };

  const confirmDeletion = () => {
    if (pendingDeletion) {
      pendingDeletion.performDeletion();
    }
  };

  return (
    <>
      <Card
        className={`border-l-4 ${
          rule.isValid ? "border-l-brand-teal" : "border-l-red-500"
        }`}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <RuleHeader
              rule={rule}
              sourceName={selectedSourceName}
              onUpdateName={(name) => handleUpdateRule({ name })}
            />
            <RuleActions
              rule={rule}
              onMovePriority={(direction) => movePriority(rule.id, direction)}
              onDelete={handleDeleteClick}
            />
          </div>

          <RuleValidationErrors rule={rule} />

          {/* Source application selector */}
          {!selectedSourceId ? (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <label className="block text-sm font-medium text-amber-800 mb-2">
                Select Source Application
              </label>
              <p className="text-xs text-amber-600 mb-3">
                Choose which application this correlation rule applies to. Each rule defines
                how accounts from a specific source system are matched to identities.
              </p>
              <Select onValueChange={handleSourceChange}>
                <SelectTrigger className="w-full max-w-md">
                  <SelectValue placeholder="Select an application..." />
                </SelectTrigger>
                <SelectContent>
                  {selectableSources.map((source) => (
                    <SelectItem key={source.id} value={source.id}>
                      {source.name}
                    </SelectItem>
                  ))}
                  {selectableSources.length === 0 && (
                    <div className="px-2 py-1 text-sm text-gray-500">
                      No available applications
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="mt-4">
              <AttributeMatchingUI resourceId={selectedSourceId} cardRuleId={rule.id} onChange={handleRuleGroupChange} />
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Correlation Rule</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the rule &quot;
              {pendingDeletion?.rule?.name}&quot;? This action cannot be undone
              and will affect the correlation configuration.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeletion}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Rule
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};