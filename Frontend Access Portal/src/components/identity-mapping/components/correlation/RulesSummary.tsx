import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

interface RulesSummaryProps {
  activeRulesCount: number;
  validRulesCount: number;
  invalidRulesCount: number;
}

export const RulesSummary: React.FC<RulesSummaryProps> = ({
  activeRulesCount,
  validRulesCount,
  invalidRulesCount,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span>Rule Summary</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-brand-teal">
              {activeRulesCount}
            </div>
            <div className="text-sm text-muted-foreground">Total Rules</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {validRulesCount}
            </div>
            <div className="text-sm text-muted-foreground">Valid Rules</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {invalidRulesCount}
            </div>
            <div className="text-sm text-muted-foreground">Invalid Rules</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
