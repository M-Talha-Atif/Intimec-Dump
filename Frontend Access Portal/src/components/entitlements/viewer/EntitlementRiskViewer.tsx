import React from "react";
import { EntitlementResponseDto } from "@/types/entitlements";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  Shield,
  Users,
  Bot,
  FileWarning,
} from "lucide-react";

interface EntitlementRiskViewerProps {
  entitlement: EntitlementResponseDto;
}

const EntitlementRiskViewer: React.FC<EntitlementRiskViewerProps> = ({
  entitlement,
}) => {
  // REAL: riskLevel from API; MOCK fallback "Low"
  const riskLevel = entitlement.riskLevel ?? "Low";

  // REAL: assignedUsersCount from API
  const userCount = entitlement.assignedUsersCount ?? 0;

  // MOCK: dormant / high-priv counts derived from userCount and privilegeLevel
  // Replace with real usage analytics endpoint when available
  const dormantCount = Math.max(0, Math.floor(userCount * 0.08));
  const highPrivUsers =
    entitlement.privilegeLevel === "Admin" ? Math.min(userCount, 5) : 0;

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case "high":
        return "text-destructive";
      case "medium":
        return "text-amber-600";
      case "low":
        return "text-emerald-600";
      default:
        return "text-muted-foreground";
    }
  };

  // REAL: classification array (null-safe)
  const classification = entitlement.classification ?? [];
  const hasSOX = classification.includes("SOX");
  const hasPII = classification.includes("PII");
  const hasGDPR = classification.includes("GDPR");
  const hasHighRisk = classification.includes("High Risk");

  // Dynamic AI recommendations based on real fields
  const recommendations: {
    title: string;
    description: string;
    severity: "info" | "warning" | "critical";
  }[] = [];

  // REAL: ownerId null check
  if (!entitlement.ownerId && !entitlement.attributes?.owner) {
    recommendations.push({
      title: "Assign an Owner",
      description:
        "This entitlement has no owner. Assign an accountable owner to ensure proper governance.",
      severity: "critical",
    });
  }

  if (riskLevel.toLowerCase() === "high" && userCount > 10) {
    recommendations.push({
      title: "Reduce Scope",
      description: `High-risk entitlement assigned to ${userCount} users. Consider limiting assignment to reduce blast radius.`,
      severity: "warning",
    });
  }

  // REAL: lifecycle check
  if (
    entitlement.lifecycle === "Orphaned" ||
    entitlement.lifecycle === "Deprecated"
  ) {
    recommendations.push({
      title: "Lifecycle Remediation",
      description: `This entitlement is ${entitlement.lifecycle}. Review for decommissioning or reassignment.`,
      severity: "warning",
    });
  }

  if (hasSOX && riskLevel.toLowerCase() === "high") {
    recommendations.push({
      title: "SoD Risk Detected",
      description:
        "SOX-classified high-risk entitlement. Verify no Separation of Duties violations exist with other assigned permissions.",
      severity: "critical",
    });
  }

  if (riskLevel.toLowerCase() !== "low") {
    recommendations.push({
      title: "Enhanced Monitoring",
      description: `Consider additional logging and monitoring for this ${riskLevel.toLowerCase()}-risk entitlement.`,
      severity: "info",
    });
  }

  // MOCK: generic review recommendation - will remain until review API is available
  recommendations.push({
    title: "Regular Review",
    description:
      "Schedule quarterly reviews to validate continued need and appropriate assignment.",
    severity: "info",
  });

  const severityStyles = {
    critical: "bg-destructive/10 border-destructive/20",
    warning:
      "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800",
    info: "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800",
  };

  return (
    <div className="space-y-6">
      {/* REAL: riskLevel + riskReason */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {/* <AlertTriangle className="h-5 w-5" /> */}
            <span>Risk Assessment</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8 bg-muted/50 rounded-lg">
            <div className="text-center">
              <AlertTriangle
                className={`h-12 w-12 mx-auto mb-4 ${getRiskColor(riskLevel)}`}
              />
              <div className={`text-2xl font-bold ${getRiskColor(riskLevel)}`}>
                {riskLevel} Risk
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Overall Risk Level
              </div>
              {/* REAL: riskReason when populated */}
              {entitlement.riskReason && (
                <p className="text-sm text-muted-foreground mt-3 max-w-md">
                  {entitlement.riskReason}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* REAL: classification-derived compliance flags */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {/* <Shield className="h-5 w-5" /> */}
              <span>Compliance Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">SOX Compliance</span>
                <Badge
                  variant={hasSOX ? "default" : "outline"}
                  className="text-xs"
                >
                  {hasSOX ? "Tagged" : "N/A"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">PII Classification</span>
                <Badge
                  variant={hasPII ? "default" : "outline"}
                  className="text-xs"
                >
                  {hasPII ? "Tagged" : "N/A"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">GDPR Compliance</span>
                <Badge
                  variant={hasGDPR ? "default" : "outline"}
                  className="text-xs"
                >
                  {hasGDPR ? "Tagged" : "N/A"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">High Risk Flag</span>
                <Badge
                  variant={hasHighRisk ? "destructive" : "outline"}
                  className="text-xs"
                >
                  {hasHighRisk ? "Flagged" : "Clear"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* REAL: assignedUsersCount + privilegeLevel; MOCK: dormant/highPriv */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {/* <Users className="h-5 w-5" /> */}
              <span>Usage Analytics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* REAL: userCount - dormantCount (MOCK: dormantCount derived) */}
              <div className="flex items-center justify-between">
                <span className="text-sm">Active Users</span>
                <span className="font-medium">{userCount - dormantCount}</span>
              </div>
              {/* MOCK: dormant count derived from 8% of total - replace with real data */}
              <div className="flex items-center justify-between">
                <span className="text-sm">
                  Dormant (90d) {/* MOCK */}
                </span>
                <span className="font-medium">{dormantCount}</span>
              </div>
              {/* MOCK: highPrivUsers derived from privilegeLevel - replace with real data */}
              <div className="flex items-center justify-between">
                <span className="text-sm">High Privilege Users {/* MOCK */}</span>
                <span className="font-medium">{highPrivUsers}</span>
              </div>
              {/* REAL: privilegeLevel */}
              <div className="flex items-center justify-between">
                <span className="text-sm">Privilege Level</span>
                <Badge
                  variant={
                    entitlement.privilegeLevel === "Admin"
                      ? "destructive"
                      : "outline"
                  }
                  className="text-xs"
                >
                  {entitlement.privilegeLevel ?? "Read" /* MOCK fallback */}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* REAL: SOX classification + riskLevel drives SoD exposure section */}
      {hasSOX && riskLevel.toLowerCase() !== "low" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileWarning className="h-5 w-5" />
              <span>Separation of Duties Exposure</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-950/20 dark:border-amber-800">
              <p className="text-sm font-medium text-amber-900 dark:text-amber-400">
                SOX-classified entitlement with elevated risk
              </p>
              <p className="text-sm text-amber-800 dark:text-amber-300 mt-1">
                This entitlement is tagged as SOX-relevant and has a{" "}
                {riskLevel.toLowerCase()} risk rating. Ensure that users with
                this entitlement do not hold conflicting permissions that could
                create Separation of Duties violations in financial processes.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Recommendations - logic driven by real fields, label is MOCK until AI endpoint exists */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {/* <Bot className="h-5 w-5" /> */}
            <span>
              AI Risk Recommendations {/* MOCK: rule-based until AI endpoint is available */}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recommendations.map((rec, i) => (
              <div
                key={i}
                className={`p-4 border rounded-lg ${severityStyles[rec.severity]}`}
              >
                <div className="font-medium text-foreground">{rec.title}</div>
                <p className="text-sm text-muted-foreground mt-1">
                  {rec.description}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EntitlementRiskViewer;