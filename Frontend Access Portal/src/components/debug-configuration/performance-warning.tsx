import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { getHighVerbosityWarning, hasTraceLogging } from "@/utils/debug";

import { useDebugConfiguration } from "@/contexts/use-debug-configuration";

export const PerformanceWarning = () => {
  const { components } = useDebugConfiguration();
  const showWarning = getHighVerbosityWarning(components);
  const hasTrace = hasTraceLogging(components);

  if (!showWarning) return null;

  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardContent className="pt-6">
        <div className="flex items-center space-x-2 text-yellow-800">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm font-medium">
            {hasTrace
              ? "Performance Warning: TRACE logging enabled - may significantly impact system performance"
              : "Performance Warning: Multiple components set to DEBUG level may impact system performance"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
