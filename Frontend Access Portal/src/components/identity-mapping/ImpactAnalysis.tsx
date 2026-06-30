"use client";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { IdentityType } from "./data/identity-mapping";
import { useImpactAnalysis } from "./hooks/useImpactAnalysis";
import {
  ImpactAnalysisHeader,
  ImpactAnalysisProgress,
  ImpactKPICards,
  ImpactIssuesList,
  ImpactCharts,
  ImpactRecommendations,
  ImpactEmptyState,
} from "./components/impact-analysis";

interface ImpactAnalysisProps {
  identityType: IdentityType;
}

export const ImpactAnalysis = ({ identityType }: ImpactAnalysisProps) => {
  const { isRunning, progress, hasRun, analysisData, runAnalysis } =
    useImpactAnalysis(identityType);

  return (
    <div className="space-y-6">
      <Card>
        <ImpactAnalysisHeader
          identityType={identityType}
          isRunning={isRunning}
          onRunAnalysis={runAnalysis}
        />
        <CardContent>
          {isRunning && <ImpactAnalysisProgress progress={progress} />}

          {hasRun && !isRunning && analysisData && (
            <>
              <ImpactKPICards data={analysisData} />
              <ImpactIssuesList issues={analysisData.issues} />
              <ImpactCharts
                attributeImpact={analysisData.attributeImpact}
                sourceImpact={analysisData.sourceImpact}
              />
              <ImpactRecommendations />
            </>
          )}

          {!hasRun && !isRunning && (
            <ImpactEmptyState identityType={identityType} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
