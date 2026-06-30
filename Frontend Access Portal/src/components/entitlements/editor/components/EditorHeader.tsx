import * as React from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Entitlement } from "../../data/mock-entitlements";
import { calculateHealthScore } from "../utils/editor-utils";

interface EditorHeaderProps {
  entitlement: Entitlement;
  hasChanges: boolean;
  children?: React.ReactNode;
}

const EditorHeader: React.FC<EditorHeaderProps> = ({
  entitlement,
  hasChanges,
  children,
}) => {
  const healthScore = calculateHealthScore(entitlement);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <CardTitle className="text-2xl">
                {entitlement.displayName}
              </CardTitle>
              <div className="flex items-center space-x-2 mt-2">
                <Badge
                  variant="outline"
                  className="border-orange-300 bg-orange-50 text-orange-700"
                >
                  <Zap className="h-3 w-3 mr-1" />
                  Editing
                </Badge>
                <Badge
                  variant="outline"
                  className={cn(
                    entitlement.lifecycle === "Active"
                      ? "border-green-300 bg-green-50 text-green-700"
                      : "border-gray-300 bg-gray-50 text-gray-600"
                  )}
                >
                  {entitlement.lifecycle}
                </Badge>
                <Badge variant="secondary">Health: {healthScore}%</Badge>
                {hasChanges && (
                  <Badge
                    variant="outline"
                    className="border-red-300 bg-red-50 text-red-700"
                  >
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Unsaved Changes
                  </Badge>
                )}
              </div>
            </div>
          </div>
          {children}
        </div>
      </CardHeader>
    </Card>
  );
};

export default EditorHeader;
