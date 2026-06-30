import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import BadgeEditor from "@/components/applications/add-application/ComplianceBadgeEditor";
import VisualRuleBuilder, { RuleCondition } from "@/components/shared/VisualRuleBuilder";
import { RoleFormState } from "../types";

interface RiskComplianceTabProps {
  form: RoleFormState;
  update: (key: string, value: any) => void;
  ruleConditions: RuleCondition[];
  onRuleConditionsChange: (conditions: RuleCondition[]) => void;
  ruleLogic: "AND" | "OR";
  onRuleLogicChange: (logic: "AND" | "OR") => void;
  ruleScript: string;
  onRuleScriptChange: (script: string) => void;
}

const getTagColor = (tag: string): string => {
  const colors: Record<string, string> = {
    SOX: "border-red-300 text-red-700 bg-red-50",
    GDPR: "border-blue-300 text-blue-700 bg-blue-50",
    "PII Access": "border-purple-300 text-purple-700 bg-purple-50",
    HIPAA: "border-green-300 text-green-700 bg-green-50",
    "ISO 27001": "border-yellow-300 text-yellow-700 bg-yellow-50",
  };
  return colors[tag] || "border-gray-300 text-gray-700 bg-gray-50";
};

const RiskComplianceTab: React.FC<RiskComplianceTabProps> = ({
  form,
  update,
  ruleConditions,
  onRuleConditionsChange,
  ruleLogic,
  onRuleLogicChange,
  ruleScript,
  onRuleScriptChange,
}) => {
  const removeComplianceTag = (tag: string) => {
    update("complianceTags", form.complianceTags.filter((t) => t !== tag));
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Risk Level</Label>
        <Select value={form.riskLevel} onValueChange={(v) => update("riskLevel", v)}>
          <SelectTrigger className="mt-1 w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover border shadow-md">
            <SelectItem value="Low">Low</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="High">High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="mb-2 block">Compliance Tags</Label>
        <p className="text-xs text-muted-foreground mb-2">
          Add applicable compliance frameworks.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {form.complianceTags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className={`flex items-center gap-1 px-3 py-1 text-xs uppercase ${getTagColor(tag)}`}
            >
              {tag}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1 hover:bg-transparent"
                onClick={() => removeComplianceTag(tag)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          <BadgeEditor
            complianceTags={form.complianceTags}
            setComplianceTags={(tags) => update("complianceTags", tags)}
            placeholder="Add compliance tag"
            maxLength={30}
            className="w-full max-w-60"
          />
        </div>
        {form.complianceTags.length === 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            No compliance tags assigned.
          </p>
        )}
      </div>

      {/* <VisualRuleBuilder
        conditions={ruleConditions}
        onChange={onRuleConditionsChange}
        logicOperator={ruleLogic}
        onLogicChange={onRuleLogicChange}
        scriptValue={ruleScript}
        onScriptChange={onRuleScriptChange}
        label="Membership Rule (Optional)"
        description="Define dynamic membership criteria for automatic role assignment."
      /> */}
    </div>
  );
};

export default RiskComplianceTab;