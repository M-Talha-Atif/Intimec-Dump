import React from "react";
import { Badge } from "@/components/ui/badge";

export const getConfidenceBadge = (confidence: number) => {
  if (confidence >= 90)
    return (
      <Badge className="bg-green-100 text-green-800">
        High ({confidence}%)
      </Badge>
    );
  if (confidence >= 70)
    return (
      <Badge className="bg-yellow-100 text-yellow-800">
        Medium ({confidence}%)
      </Badge>
    );
  return <Badge className="bg-red-100 text-red-800">Low ({confidence}%)</Badge>;
};
