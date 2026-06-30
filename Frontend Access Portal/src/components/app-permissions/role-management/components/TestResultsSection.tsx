import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRuleBuilderContext } from "../contexts/RuleBuilderContext";
import { getInitials } from "../utils/ruleBuilderUtils";

export const TestResultsSection: React.FC = () => {
  const { testResults } = useRuleBuilderContext();

  if (!testResults) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test Results</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
          <Badge variant="outline" className="text-lg px-3 py-1">
            {testResults.matches} users match
          </Badge>
        </div>
        {testResults.preview.length > 0 && (
          <div className="space-y-2">
            <Label>Preview of matching users:</Label>
            <div className="flex flex-wrap gap-2">
              {testResults.preview.slice(0, 10).map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-2 p-2 border rounded-lg"
                >
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{user.name}</span>
                </div>
              ))}
              {testResults.preview.length > 10 && (
                <div className="flex items-center justify-center p-2 border rounded-lg text-sm text-muted-foreground">
                  +{testResults.preview.length - 10} more
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
