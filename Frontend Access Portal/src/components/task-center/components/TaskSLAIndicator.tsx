
import React from 'react';
import { Badge } from "@/components/ui/badge";

interface TaskSLAIndicatorProps {
  countdown: number;
  status: string; // Not used in original logic for badge color/text, just passed.
}

export const TaskSLAIndicator: React.FC<TaskSLAIndicatorProps> = ({ countdown }) => {
  if (countdown < 0) {
    return (
      <Badge variant="destructive" className="animate-pulse">
        Overdue
      </Badge>
    );
  } else if (countdown < 60) {
    return (
      <Badge variant="destructive" className="bg-orange-100 text-orange-800">
        {countdown}m
      </Badge>
    );
  } else if (countdown < 240) {
    return (
      <Badge variant="outline" className="text-orange-600 border-orange-300">
        {Math.floor(countdown / 60)}h {countdown % 60}m
      </Badge>
    );
  } else {
    return (
      <Badge variant="outline" className="text-green-600 border-green-300">
        {Math.floor(countdown / 60)}h {countdown % 60}m
      </Badge>
    );
  }
};
