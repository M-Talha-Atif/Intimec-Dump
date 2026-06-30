import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface PreviewIssuesAlertProps {
  warningCount: number;
  errorCount: number;
}

export const PreviewIssuesAlert: React.FC<PreviewIssuesAlertProps> = ({
  warningCount,
  errorCount,
}) => {
  if (warningCount === 0 && errorCount === 0) return null;

  return (
    <Alert>
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <div className="space-y-1">
          <p>
            <strong>Issues detected in transformation preview:</strong>
          </p>
          {warningCount > 0 && (
            <p>
              • {warningCount} warning(s): Review fallback values and
              transformation logic
            </p>
          )}
          {errorCount > 0 && (
            <p>
              • {errorCount} error(s): Fix transformation scripts and mapping
              configurations
            </p>
          )}
          <p className="text-sm mt-2">
            <strong>Recommendation:</strong> Address these issues before
            deploying mappings to production.
          </p>
        </div>
      </AlertDescription>
    </Alert>
  );
};
