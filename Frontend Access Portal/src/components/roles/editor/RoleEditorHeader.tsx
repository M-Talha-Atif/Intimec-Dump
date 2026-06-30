import React from "react";
import { Role } from "@/types/roles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Save, X, Eye, AlertTriangle, Zap, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoleEditorHeaderProps {
  role: Role;
  healthScore: number;
  hasChanges: boolean;
  isSaving: boolean;
  validationErrors: string[];
  onSave: () => void;
  onCancel: () => void;
  onPreviewImpact: () => void;
}

const RoleEditorHeader: React.FC<RoleEditorHeaderProps> = ({
  role,
  healthScore,
  hasChanges,
  isSaving,
  validationErrors,
  onSave,
  onCancel,
  onPreviewImpact,
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <CardTitle className="text-2xl">{role.name}</CardTitle>
              <div className="flex items-center space-x-2 mt-2">
                <Badge
                  variant="outline"
                  className="border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                >
                  <Zap className="h-3 w-3 mr-1" /> Editing
                </Badge>
                <Badge
                  variant="outline"
                  className={cn(
                    role.status === "Enabled"
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30"
                      : "border-muted bg-muted text-muted-foreground"
                  )}
                >
                 {role?.status ? role.status.charAt(0).toUpperCase() + role.status.slice(1).toLowerCase() : ''}
                </Badge>
                <Badge
                  variant="secondary"
                  className={cn(
                    healthScore >= 80
                      ? "text-emerald-700"
                      : healthScore >= 50
                        ? "text-amber-700"
                        : "text-destructive"
                  )}
                >
                  Health: {healthScore}%
                </Badge>
                {hasChanges && (
                  <Badge
                    variant="outline"
                    className="border-destructive/50 bg-destructive/10 text-destructive"
                  >
                    <AlertTriangle className="h-3 w-3 mr-1" /> Unsaved Changes
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={onPreviewImpact}
              className="gap-1.5"
            >
              <Eye className="h-4 w-4" /> Preview Impact
            </Button>
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isSaving}
              className="gap-1.5"
            >
              <X className="h-4 w-4" /> Cancel
            </Button>
            <Button
              onClick={onSave}
              disabled={!hasChanges || isSaving}
              className="gap-1.5"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      {validationErrors.length > 0 && (
        <CardContent className="pt-0">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc pl-4">
                {validationErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      )}
    </Card>
  );
};

export default RoleEditorHeader;