import { RiskLevel } from "@/types/shared";

export type AIRiskActionType =
  | "deprovisioning"
  | "access-review"
  | "entitlement-editor"
  | "policy-review";

export type AIFeedback = {
  type: "accurate" | "false-positive";
  comment?: string | null;
  timestamp: string;
};
export type AIRiskCard = {
  id: string;
  title: string;
  description: string;
  severity: RiskLevel;
  category: string;
  affectedIdentities: string[];
  affectedObjects: string[];
  lastDetected: string;
  recommendation: string;
  actionType: AIRiskActionType;
  correlationId: string;
  firstSeen: string;
  peakOccurrence: string;
  previouslyMitigated: boolean;
  rootCause: string;
  complianceLabels: string[];
  workflowAttached: boolean;
  riskReduction: string;
  estimatedImpact: string;
  feedback?: AIFeedback | null;
};
