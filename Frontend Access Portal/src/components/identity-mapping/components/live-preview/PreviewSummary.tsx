import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface PreviewSummaryProps {
  total: number;
  successCount: number;
  warningCount: number;
  errorCount: number;
}

export const PreviewSummary: React.FC<PreviewSummaryProps> = ({
  total,
  successCount,
  warningCount,
  errorCount,
}) => {
  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-brand-teal">{total}</div>
          <div className="text-sm text-muted-foreground">
            Total Transformations
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {successCount}
          </div>
          <div className="text-sm text-muted-foreground">Successful</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {warningCount}
          </div>
          <div className="text-sm text-muted-foreground">Warnings</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{errorCount}</div>
          <div className="text-sm text-muted-foreground">Errors</div>
        </CardContent>
      </Card>
    </div>
  );
};
