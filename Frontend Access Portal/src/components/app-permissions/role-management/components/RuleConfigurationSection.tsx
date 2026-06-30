import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Settings } from "lucide-react";
import { useRuleBuilderContext } from "../contexts/RuleBuilderContext";

export const RuleConfigurationSection: React.FC = () => {
  const {
    ruleName,
    setRuleName,
    ruleDescription,
    setRuleDescription,
    isActive,
    setIsActive,
  } = useRuleBuilderContext();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Rule Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="ruleName">Rule Name *</Label>
            <Input
              className="mt-1"
              id="ruleName"
              placeholder="e.g., Auto-assign IT Department Roles"
              value={ruleName}
              onChange={(e) => setRuleName(e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            className="mt-1"
            id="description"
            placeholder="Describe when and why this rule should apply..."
            value={ruleDescription}
            onChange={(e) => setRuleDescription(e.target.value)}
            rows={3}
          />
        </div> */}

        <div className="flex items-center space-x-2">
          <Switch
            id="isActive"
            checked={isActive}
            onCheckedChange={setIsActive}
          />
          <Label htmlFor="isActive">Rule is active</Label>
        </div>
      </CardContent>
    </Card>
  );
};
