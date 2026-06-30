import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { DynamicAssignmentRule } from "@/types/dynamicRules";
import { useRuleBuilderContext } from "../contexts/RuleBuilderContext";

export const RuleActionsSection: React.FC = () => {
  const { actions, setActions } = useRuleBuilderContext();

  const updateAction = (
    field: keyof DynamicAssignmentRule["actions"],
    value: boolean
  ) => {
    setActions({ ...actions, [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={actions.sendNotification || false}
              onCheckedChange={(checked) =>
                updateAction("sendNotification", checked)
              }
            />
            <Label>Send notification on assignment</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={actions.requireApproval || false}
              onCheckedChange={(checked) =>
                updateAction("requireApproval", checked)
              }
            />
            <Label>Require approval before assignment</Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
