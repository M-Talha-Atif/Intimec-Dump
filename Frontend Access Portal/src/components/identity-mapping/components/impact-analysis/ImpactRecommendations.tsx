"use client";
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export const ImpactRecommendations = () => {
  return (
    <Alert>
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <div className="space-y-2">
          <p>
            <strong>Recommendations based on impact analysis:</strong>
          </p>
          <ul className="text-sm space-y-1 list-disc list-inside">
            <li>
              Address critical and high severity issues before deploying mapping
              changes
            </li>
            <li>
              Review data quality in source systems with high impact rates
            </li>
            <li>
              Consider implementing data validation rules for frequently
              impacted attributes
            </li>
            <li>
              Schedule regular impact assessments to monitor mapping health
            </li>
          </ul>
        </div>
      </AlertDescription>
    </Alert>
  );
};
