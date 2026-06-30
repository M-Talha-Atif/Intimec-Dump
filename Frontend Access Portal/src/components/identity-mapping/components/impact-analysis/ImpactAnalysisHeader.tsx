"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, RefreshCw } from "lucide-react";
import { IdentityType } from "../../data/identity-mapping";

interface ImpactAnalysisHeaderProps {
  identityType: IdentityType;
  isRunning: boolean;
  onRunAnalysis: () => void;
}

export const ImpactAnalysisHeader = ({
  identityType,
  isRunning,
  onRunAnalysis,
}: ImpactAnalysisHeaderProps) => {
  return (
    <CardHeader className="flex flex-row items-center justify-between">
      <div>
        <CardTitle>Impact Analysis for {identityType} Mappings</CardTitle>
        <CardDescription>
          Analyze the potential impact of mapping changes across your{" "}
          {identityType} identity population
        </CardDescription>
      </div>
      <Button
        onClick={onRunAnalysis}
        disabled={isRunning}
        className="flex items-center space-x-2"
      >
        {isRunning ? (
          <RefreshCw className="h-4 w-4 animate-spin" />
        ) : (
          <Play className="h-4 w-4" />
        )}
        <span>{isRunning ? "Analyzing..." : "Run Analysis"}</span>
      </Button>
    </CardHeader>
  );
};
