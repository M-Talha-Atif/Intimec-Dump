import { useState } from "react";
import { toast } from "sonner";
import { IdentityType } from "../data/identity-mapping";
import {
  mockImpactAnalysisData,
  ImpactAnalysisData,
} from "../data/impact-analysis";

export const useImpactAnalysis = (identityType: IdentityType) => {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hasRun, setHasRun] = useState(false);
  const [analysisData, setAnalysisData] = useState<ImpactAnalysisData | null>(
    null
  );

  const runAnalysis = async () => {
    setIsRunning(true);
    setProgress(0);

    // Simulate progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 12.5;
      });
    }, 300);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2400));

    const data = mockImpactAnalysisData[identityType];
    setAnalysisData(data);
    setIsRunning(false);
    setHasRun(true);

    toast.success("Impact Analysis Complete", {
      description: `Analyzed ${data.totalIdentities} ${identityType} identities. Found ${data.issues.length} impact areas.`,
    });
  };

  const resetAnalysis = () => {
    setHasRun(false);
    setProgress(0);
    setAnalysisData(null);
  };

  return {
    isRunning,
    progress,
    hasRun,
    analysisData,
    runAnalysis,
    resetAnalysis,
  };
};
