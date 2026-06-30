import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";

import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";
import clsx from "clsx";
import { AIRiskCard } from "@/types/ai-analysis";
import {
  AlertCircle,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Clock,
  ExternalLink,
  Eye,
  FileText,
  History,
  Settings,
  Shield,
  ThumbsDown,
  ThumbsUp,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { riskBadgeMap } from "@/components/applications/common/badgeMap";
import CustomBadge from "@/components/applications/common/CustomBadge";

export default function RiskCard({
  riskCard,
  viewActionDialog,
  showAIfeedbackDialog
}: {
  riskCard: AIRiskCard;
  viewActionDialog: () => void;
  showAIfeedbackDialog: () => void;
}) {
  const router = useRouter();
  const [isExpanded, setExpanded] = useState(false);
  const [feedback, setFeedback] = useState<
    "accurate" | "false-positive" | null
  >(null);

  return (
    <Collapsible open={isExpanded} onOpenChange={setExpanded}>
      <CollapsibleTrigger asChild>
        <Card
          key={riskCard.id}
          className={clsx(
            "border-l-4 mx-4",
            riskCard.severity === "High" && "border-l-red-500",
            riskCard.severity === "Medium" && "border-l-yellow-500",
            riskCard.severity === "Low" && "border-l-green-500"
          )}
        >
          <CardHeader className="cursor-pointer transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <CardTitle className="text-base">{riskCard.title}</CardTitle>
                  <CustomBadge
                    className="text-xs"
                    color={riskBadgeMap[riskCard.severity]}
                  >
                    {riskCard.severity.toUpperCase()}
                  </CustomBadge>
                  {riskCard.previouslyMitigated && (
                    <Badge
                      variant="outline"
                      className="text-xs text-green-700 border-green-300"
                    >
                      Previously Mitigated
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2 text-wrap">
                  {riskCard.description}
                </p>

                {/* Risk Evolution Timeline */}
                <section className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                  <span className="flex items-center space-x-1">
                    <History className="h-3 w-3" />
                    <span>First Seen: {riskCard.firstSeen}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>Peak: {riskCard.peakOccurrence}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>Detected {riskCard.lastDetected}</span>
                  </span>
                </section>

                {/* Compliance Labels */}
                <div className="flex items-center space-x-2 mb-2">
                  {riskCard.complianceLabels.map((label, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-xs text-purple-700 border-purple-300"
                    >
                      {label}
                    </Badge>
                  ))}
                  {riskCard.workflowAttached && (
                    <Badge
                      variant="outline"
                      className="text-xs text-blue-700 border-blue-300"
                    >
                      Workflow Attached
                    </Badge>
                  )}
                </div>

                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span className="flex items-center space-x-1">
                    <Users className="h-3 w-3" />
                    <span>{riskCard.affectedIdentities.length} identities</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Shield className="h-3 w-3" />
                    <span>ID: {riskCard.correlationId}</span>
                  </span>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>

          <CollapsibleContent>
            <CardContent>
              <div className="space-y-4">
                {/* Root Cause Analysis */}
                <div className="bg-orange-50 p-3 rounded-lg">
                  <h5 className="font-medium text-sm mb-1 flex items-center space-x-1">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <span>Why This Risk Exists</span>
                  </h5>
                  <p className="text-sm text-gray-700">{riskCard.rootCause}</p>
                </div>

                {/* Affected Identities */}
                <section>
                  <h5 className="font-medium text-sm mb-2">
                    Affected Identities
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {riskCard.affectedIdentities.map((identity, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {identity}
                      </Badge>
                    ))}
                  </div>
                </section>

                {/* Affected Objects */}
                <section>
                  <h5 className="font-medium text-sm mb-2">Affected Objects</h5>
                  <ul className="flex flex-wrap gap-2">
                    {riskCard.affectedObjects.map((object, index) => (
                      <li key={index}>
                        <Badge variant="outline" className="text-xs">
                          {object}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </section>

                {/* AI Recommendation */}
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h5 className="font-medium text-sm mb-1 flex items-center space-x-1">
                    <Zap className="h-3 w-3 text-blue-600" />
                    <span>AI Recommendation</span>
                  </h5>
                  <p className="text-sm text-gray-700 mb-2">
                    {riskCard.recommendation}
                  </p>
                  <div className="text-xs text-blue-600">
                    Estimated Risk Reduction: {riskCard.riskReduction}
                  </div>
                </div>

                {/* Cross-navigation Links */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(
                        `/identities?filter=${riskCard.affectedIdentities[0]}`
                      );
                    }}
                    className="flex items-center space-x-1 text-xs"
                  >
                    <Users className="h-3 w-3" />
                    <span>View Accounts</span>
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(
                        `/entitlements?filter=${riskCard.affectedObjects[0]}`
                      );
                    }}
                    className="flex items-center space-x-1 text-xs"
                  >
                    <Shield className="h-3 w-3" />
                    <span>View Entitlements</span>
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push("/access-review");
                    }}
                    className="flex items-center space-x-1 text-xs"
                  >
                    <Eye className="h-3 w-3" />
                    <span>Access Review</span>
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push("/auditlogs");
                    }}
                    className="flex items-center space-x-1 text-xs"
                  >
                    <FileText className="h-3 w-3" />
                    <span>Audit Logs</span>
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      viewActionDialog();
                    }}
                    className="flex items-center space-x-1"
                  >
                    <Settings className="h-3 w-3" />
                    <span>Take Action</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="flex items-center space-x-1"
                  >
                    <Eye className="h-3 w-3" />
                    <span>View in Monitoring</span>
                  </Button>
                </div>

                {/* AI Accuracy Feedback */}
                <div className="border-t pt-3">
                  <h5 className="font-medium text-sm mb-2">
                    AI Accuracy Feedback
                  </h5>
                  <div className="flex space-x-2">
                    <Button
                      size="icon"
                      variant="outline"
                      className={clsx(
                        "hover:text-green-500 hover:bg-green-50",
                        feedback === "accurate" && "bg-green-200"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        setFeedback("accurate");
                      }}
                    >
                      <ThumbsUp />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className={clsx(
                        "hover:text-red-500 hover:bg-red-50",
                        feedback === "false-positive" && "bg-red-200"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        setFeedback("false-positive");
                      }}
                    >
                      <ThumbsDown />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        showAIfeedbackDialog();
                      }}
                    >
                      <AlertCircle /> Needs Review
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </CollapsibleTrigger>
    </Collapsible>
  );
}
