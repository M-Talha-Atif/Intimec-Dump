"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, PlayCircle, RefreshCw } from "lucide-react";
import { AIRiskCard } from "@/types/ai-analysis";
import useAIAnalysis from "@/hooks/applications/useAIAnalysis";
import RiskCard from "@/components/applications/ai-analysis/RiskCard";
import ResultsMetadataCard from "@/components/applications/ai-analysis/ResultsMetadataCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import CustomPagination from "@/components/applications/common/CustomPagination";
import RiskActionDialog from "@/components/applications/ai-analysis/RiskActionDialog";
import clsx from "clsx";
import { toast } from "sonner";
import FeedbackDialog from "./FeedbackDialog";

type AIAnalysisTabProps = {
  appid: string;
};

const ApplicationAIAnalysisTab = ({ appid }: AIAnalysisTabProps) => {
  const [riskDialogData, setRiskDialogData] = useState<AIRiskCard | null>(null);
  const [showAIfeedbackDialog, setShowAIfeedbackDialog] =
    useState<AIRiskCard | null>(null);

  const { data, error, isLoading, metadata, pagination, refresh } =
    useAIAnalysis(appid);

  const analysisComplete = !isLoading && data !== undefined && !error;

  async function handleRunAnalysis() {
    try {
      const response = await fetch(`/api/applications/${appid}/ai-analysis`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });
      if (!response.ok) {
        throw new Error("Failed to start AI analysis");
      }
      toast("AI Analysis Started", {
        description:
          "Your AI analysis is now running. Please refresh to see results.",
      });
      refresh();
    } catch {
      toast.error("Error Starting AI Analysis", {
        description: "Please try again later.",
      });
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <section className="h-full overflow-hidden flex flex-col p-4">
        {/* AI Analysis Header */}
        <header className="flex gap-4 items-end justify-between border-b border-border pb-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">AI Security Analysis</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Run an AI-powered analysis to identify security risks, orphan
              accounts, excessive privileges, and policy violations.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={refresh}
              disabled={isLoading}
              variant="outline"
              className="flex items-center relative cursor-pointer"
            >
              <RefreshCw
                className={clsx("h-4 w-4", isLoading && " animate-spin")}
              />
              <span>Refresh</span>
            </Button>
            <Button
              onClick={handleRunAnalysis}
              disabled={isLoading}
              className="flex items-center relative cursor-pointer"
            >
              <PlayCircle className="h-4 w-4" />
              <span>Run AI Analysis</span>
            </Button>
          </div>
        </header>

        {/* Initial State */}
        {!analysisComplete && !isLoading && (
          <Card className="mt-4">
            <CardContent className="py-12 text-center">
              <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h4 className="font-medium mb-2">
                AI Security Analysis
              </h4>
              <p className="text-sm text-muted-foreground mb-4">
                Run an AI-powered analysis to identify security risks, orphan
                accounts, excessive privileges, and policy violations.
              </p>
              <Button onClick={handleRunAnalysis} className="flex items-center space-x-2 mx-auto">
                <Sparkles className="h-4 w-4" />
                <span>Start AI Analysis</span>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <Card className="mt-4">
            <CardContent className="py-8">
              <div className="text-center space-y-4">
                <div className="relative w-fit mx-auto">
                  <Sparkles className="h-12 w-12 text-blue-600 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-medium">AI Analysis in Progress</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Scanning accounts, entitlements, and access patterns...
                  </p>
                </div>
                <div className="w-full max-w-xs mx-auto bg-muted rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '65%' }} />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analysis Complete */}
        {analysisComplete && (
          <>
            <ScrollArea className="h-full mt-4">
              {metadata && (
                <ResultsMetadataCard metadata={metadata} className="mb-4" />
              )}
              <div className="space-y-4 mb-4">
                {data.map((riskCard: AIRiskCard) => (
                  <RiskCard
                    key={riskCard.id}
                    riskCard={riskCard}
                    viewActionDialog={() => setRiskDialogData(riskCard)}
                    showAIfeedbackDialog={() =>
                      setShowAIfeedbackDialog(riskCard)
                    }
                  />
                ))}
              </div>
            </ScrollArea>
            {riskDialogData && (
              <RiskActionDialog
                riskCard={riskDialogData}
                onClose={() => setRiskDialogData(null)}
              />
            )}
            {showAIfeedbackDialog && (
              <FeedbackDialog
                showAIfeedbackDialog={showAIfeedbackDialog}
                setShowAIfeedbackDialog={setShowAIfeedbackDialog}
              />
            )}
          </>
        )}
      </section>

      <CustomPagination
        totalPages={pagination?.totalPages || 0}
        totalElements={pagination?.totalElements || 0}
      />
    </div>
  );
};

export default ApplicationAIAnalysisTab;
