"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useAuditLogsContext } from "@/contexts/audit-logs-context";

export function ErrorDisplay() {
  const { error, refetch } = useAuditLogsContext();

  if (!error) return null;

  return (
    <Card className="border-red-200 bg-secondary">
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 text-red-800 dark:text-red-400">
          <AlertTriangle className="h-4 w-4" />
          <span className="font-medium">Error loading audit logs:</span>
          <span>{error}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            className="ml-auto bg-transparent"
          >
            Try Again
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
