import React from "react";
import { Progress } from "@/components/ui/progress";
import { RefreshCw } from "lucide-react";

interface PreviewProgressProps {
  progress: number;
}

export const PreviewProgress: React.FC<PreviewProgressProps> = ({
  progress,
}) => {
  return (
    <div className="mb-6">
      <div className="flex items-center space-x-3 mb-2">
        <RefreshCw className="h-4 w-4 animate-spin" />
        <span className="text-sm font-medium">
          Running transformation preview...
        </span>
      </div>
      <Progress value={progress} className="w-full" />
      <p className="text-xs text-muted-foreground mt-1">{progress}% complete</p>
    </div>
  );
};
