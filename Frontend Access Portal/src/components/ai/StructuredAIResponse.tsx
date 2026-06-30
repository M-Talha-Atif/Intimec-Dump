import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Download,
  Play,
  Settings,
  ExternalLink,
} from "lucide-react";

interface KPICardData {
  title: string;
  value: string;
  status?: "success" | "warning" | "error" | "info";
  trend?: "up" | "down" | "stable";
}

interface ActionButton {
  label: string;
  action: string;
  variant?: "default" | "outline" | "destructive";
  icon?: React.ReactNode;
}

interface StructuredResponse {
  kpis?: KPICardData[];
  rootCause?: string[];
  securityImpact?: { framework: string; impact: string }[];
  immediateActions?: ActionButton[];
  longTermActions?: string[];
  relatedPatterns?: { pattern: string; frequency: number; severity: string }[];
  rawText?: string;
}

interface StructuredAIResponseProps {
  content: string;
  isAnalysis?: boolean;
  isPatternAnalysis?: boolean;
}

export const StructuredAIResponse: React.FC<StructuredAIResponseProps> = ({
  content,
  isAnalysis = false,
  isPatternAnalysis = false,
}) => {
  // Enhanced parser that works with mock responses
  const parseStructuredResponse = (text: string): StructuredResponse => {
    const response: StructuredResponse = { rawText: text };

    // Always provide KPIs for analysis requests to demonstrate the structure
    if (isAnalysis || isPatternAnalysis) {
      if (
        text.toLowerCase().includes("timeout") ||
        text.toLowerCase().includes("failure") ||
        text.toLowerCase().includes("connector")
      ) {
        response.kpis = [
          {
            title: "Success Rate",
            value: "75%",
            status: "warning",
            trend: "down",
          },
          { title: "Avg Response Time", value: "30s", status: "error" },
          { title: "Retry Attempts", value: "3/5", status: "warning" },
          { title: "Similar Issues (24h)", value: "5", status: "info" },
        ];
      } else if (
        text.toLowerCase().includes("access") ||
        text.toLowerCase().includes("violation") ||
        text.toLowerCase().includes("authentication")
      ) {
        response.kpis = [
          {
            title: "Security Score",
            value: "87/100",
            status: "success",
            trend: "up",
          },
          { title: "Failed Attempts", value: "12", status: "warning" },
          { title: "High-Risk Users", value: "5", status: "error" },
          { title: "Active Sessions", value: "1,247", status: "info" },
        ];
      } else if (isPatternAnalysis) {
        response.kpis = [
          {
            title: "Pattern Detected",
            value: "15",
            status: "error",
            trend: "up",
          },
          { title: "Avg Resolution", value: "45min", status: "warning" },
          {
            title: "Success Rate Drop",
            value: "15%",
            status: "error",
            trend: "down",
          },
          { title: "Peak Hours Impact", value: "9-11 AM", status: "warning" },
        ];
      } else {
        // Default KPIs for general analysis
        response.kpis = [
          {
            title: "Platform Health",
            value: "99.2%",
            status: "success",
            trend: "stable",
          },
          { title: "Active Users", value: "1,247", status: "info" },
          { title: "Pending Requests", value: "23", status: "warning" },
          { title: "Failed Auth (24h)", value: "12", status: "info" },
        ];
      }
    }

    // Extract root causes from structured text
    if (text.includes("Root Cause") || text.includes("root cause")) {
      const rootCauseMatch = text.match(
        /(?:Root Cause.*?:|•)([\s\S]*?)(?=\n\n|\*\*|$)/
      );
      if (rootCauseMatch) {
        response.rootCause = rootCauseMatch[1]
          .split(/[•\n]/)
          .map((item) => item.trim())
          .filter((item) => item.length > 10)
          .slice(0, 4);
      }
    }

    // Extract security/compliance impact
    if (
      text.includes("Security") ||
      text.includes("Compliance") ||
      text.includes("SOX") ||
      text.includes("GDPR")
    ) {
      response.securityImpact = [
        {
          framework: "SOX",
          impact: "Provisioning SLA breach - user access delayed",
        },
        {
          framework: "GDPR",
          impact: "Risk of stale account data persisting beyond policy",
        },
        {
          framework: "ISO 27001",
          impact: "Access control process integrity maintained",
        },
      ];
    }

    // Always provide immediate actions for analysis requests
    if (isAnalysis || isPatternAnalysis || text.includes("Immediate")) {
      response.immediateActions = [
        {
          label: "Retry Operation",
          action: "retry",
          variant: "default",
          icon: <Play className="h-4 w-4" />,
        },
        {
          label: "Adjust Settings",
          action: "settings",
          variant: "outline",
          icon: <Settings className="h-4 w-4" />,
        },
        {
          label: "Export Analysis",
          action: "export",
          variant: "outline",
          icon: <Download className="h-4 w-4" />,
        },
        {
          label: "View Details",
          action: "details",
          variant: "outline",
          icon: <ExternalLink className="h-4 w-4" />,
        },
      ];
    }

    // Extract pattern data for pattern analysis
    if (
      isPatternAnalysis ||
      text.includes("Pattern") ||
      text.includes("Frequency")
    ) {
      response.relatedPatterns = [
        { pattern: "Connector Timeouts", frequency: 15, severity: "high" },
        {
          pattern: "Authentication Failures",
          frequency: 23,
          severity: "medium",
        },
        { pattern: "Bulk Operation Failures", frequency: 8, severity: "high" },
        { pattern: "Queue Backlog Issues", frequency: 12, severity: "high" },
      ];
    }

    return response;
  };

  const structuredData = parseStructuredResponse(content);

  const getKPIIcon = (status?: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  const getKPICardBorder = (status?: string) => {
    switch (status) {
      case "success":
        return "border-l-4 border-l-green-500";
      case "warning":
        return "border-l-4 border-l-yellow-500";
      case "error":
        return "border-l-4 border-l-red-500";
      default:
        return "border-l-4 border-l-blue-500";
    }
  };

  const handleAction = (action: string) => {
    console.log(`Executing action: ${action}`);
    // In a real implementation, this would trigger actual actions
  };

  return (
    <div className="space-y-4">
      {/* KPI Summary Cards */}
      {structuredData.kpis && (
        <div>
          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
            📊 Health & Risk Summary
          </h4>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {structuredData.kpis.map((kpi, index) => (
              <Card
                key={index}
                className={`${getKPICardBorder(kpi.status)} bg-muted/20`}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">
                      {kpi.title}
                    </span>
                    {getKPIIcon(kpi.status)}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">{kpi.value}</span>
                    {kpi.trend && (
                      <TrendingUp
                        className={`h-3 w-3 ${
                          kpi.trend === "up"
                            ? "text-green-500 rotate-0"
                            : kpi.trend === "down"
                            ? "text-red-500 rotate-180"
                            : "text-gray-500"
                        }`}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Root Cause Analysis */}
      {structuredData.rootCause && (
        <div>
          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
            🛠 Root Cause Analysis
          </h4>
          <ul className="space-y-1 text-sm">
            {structuredData.rootCause.map((cause, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-red-500 text-xs mt-1">•</span>
                <span>{cause}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Security & Compliance Impact */}
      {structuredData.securityImpact && (
        <div>
          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
            🔐 Security & Compliance Impact
          </h4>
          <div className="space-y-2">
            {structuredData.securityImpact.map((impact, index) => (
              <div
                key={index}
                className="bg-yellow-50 border border-yellow-200 rounded p-2"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs">
                    {impact.framework}
                  </Badge>
                </div>
                <p className="text-xs text-gray-700">{impact.impact}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Immediate Actions */}
      {structuredData.immediateActions && (
        <div>
          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
            🚑 Immediate Actions
          </h4>
          <div className="flex flex-wrap gap-2">
            {structuredData.immediateActions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || "outline"}
                size="sm"
                onClick={() => handleAction(action.action)}
                className="text-xs"
              >
                {action.icon}
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Related Patterns (for pattern analysis) */}
      {structuredData.relatedPatterns && (
        <div>
          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
            📈 Related Patterns Detected
          </h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Pattern</TableHead>
                <TableHead className="text-xs">Frequency</TableHead>
                <TableHead className="text-xs">Severity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {structuredData.relatedPatterns.map((pattern, index) => (
                <TableRow key={index}>
                  <TableCell className="text-xs">{pattern.pattern}</TableCell>
                  <TableCell className="text-xs">{pattern.frequency}</TableCell>
                  <TableCell className="text-xs">
                    <Badge
                      variant={
                        pattern.severity === "high"
                          ? "destructive"
                          : pattern.severity === "medium"
                          ? "secondary"
                          : "outline"
                      }
                      className="text-xs"
                    >
                      {pattern.severity}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Enhanced Raw Text Display */}
      <div className="bg-muted/20 p-3 rounded text-sm">
        <div className="prose prose-sm max-w-none">
          {structuredData.rawText?.split("\n").map((line, index) => {
            if (line.startsWith("**") && line.endsWith("**")) {
              return (
                <h5 key={index} className="font-semibold mt-3 mb-1">
                  {line.replace(/\*\*/g, "")}
                </h5>
              );
            }
            if (line.startsWith("•") || line.startsWith("-")) {
              return (
                <li key={index} className="ml-4 list-disc">
                  {line.substring(1).trim()}
                </li>
              );
            }
            if (line.trim()) {
              return (
                <p key={index} className="mb-2">
                  {line}
                </p>
              );
            }
            return <br key={index} />;
          })}
        </div>
      </div>
    </div>
  );
};
