import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  X,
  Edit,
  Eye,
  Users,
  Shield,
  AlertTriangle,
  KeyRound,
} from "lucide-react";
import { EntitlementResponseDto } from "@/types/entitlements";
import { format } from "date-fns";

interface EntitlementPreviewPanelProps {
  entitlement: EntitlementResponseDto;
  onClose: () => void;
  onSelectEntitlement: (entitlement: EntitlementResponseDto) => void;
}

const EntitlementPreviewPanel: React.FC<EntitlementPreviewPanelProps> = ({
  entitlement,
  onClose,
  onSelectEntitlement,
}) => {
  const getRiskColor = (score: string) => {
    switch (score.toLowerCase()) {
      case "high":
      case "critical":
        return "text-red-600 bg-red-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "low":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  // REAL: riskLevel; MOCK fallback "Low"
  const riskLevel = entitlement.riskLevel ?? "Low";

  // REAL: attributes.type or objectClass
 const typeLabel =
  typeof entitlement.kind === "string"
    ? entitlement.kind
    : typeof entitlement.attributes?.type === "string"
    ? entitlement.attributes.type
    : entitlement.objectClass ?? "Standard";

  // REAL: attributes.owner or ownerId
  const ownerLabel =
    typeof entitlement.attributes?.owner === "string"
      ? entitlement.attributes.owner
      : entitlement.ownerId ?? "N/A";

  // REAL: classification null-safe
  const classification = entitlement.classification ?? [];

  // REAL: updatedAt as "last used" proxy
  const lastUpdatedLabel = entitlement.updatedAt
    ? format(new Date(entitlement.updatedAt), "MMM d, yyyy")
    : null;

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <KeyRound className="h-5 w-5 text-emerald-600" />
          <h3 className="font-semibold">Entitlement Details</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                {/* REAL: displayName */}
                <CardTitle className="text-lg">
                  {entitlement.displayName}
                </CardTitle>
                {/* REAL: lifecycle */}
                <Badge
                  variant={
                    entitlement.lifecycle === "Active" ? "default" : "secondary"
                  }
                >
                  {entitlement.lifecycle ?? "Unknown"}
                </Badge>
              </div>
              {/* REAL: description */}
              <p className="text-sm text-gray-600">{entitlement.description}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                {/* REAL: resourceName */}
                <div>
                  <span className="font-medium text-gray-700">Resource:</span>
                  <p className="text-gray-900">
                    {entitlement.resourceName ?? "-"}
                  </p>
                </div>
                {/* REAL: attributes.type or objectClass */}
                <div>
                  <span className="font-medium text-gray-700">Type:</span>
                  <p className="text-gray-900">{typeLabel}</p>
                </div>
                {/* REAL: privilegeLevel */}
                <div>
                  <span className="font-medium text-gray-700">
                    Privilege Level:
                  </span>
                  <Badge variant="outline" className="ml-2">
                    {entitlement.privilegeLevel ?? "Read" /* MOCK fallback */}
                  </Badge>
                </div>
                {/* REAL: attributes.owner or ownerId */}
                <div>
                  <span className="font-medium text-gray-700">Owner:</span>
                  <p className="text-gray-900">{ownerLabel}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4 text-sm">
                {/* REAL: assignedUsersCount */}
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Users:</span>
                  <span className="text-lg font-bold text-blue-600">
                    {entitlement.assignedUsersCount}
                  </span>
                </div>
                {/* REAL: riskLevel */}
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Risk:</span>
                  <Badge className={`font-bold ${getRiskColor(riskLevel)}`}>
                    {riskLevel.toUpperCase()}
                  </Badge>
                </div>
              </div>

              {/* REAL: updatedAt as last-updated proxy (MOCK: true lastUsed not in API) */}
              {lastUpdatedLabel && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <span className="font-medium">Last Updated:</span>
                  <span>{lastUpdatedLabel}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* REAL: riskLevel drives risk assessment card */}
          {(riskLevel.toLowerCase() === "high" ||
            riskLevel.toLowerCase() === "critical") && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Risk Assessment</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className={`p-3 rounded-lg ${getRiskColor(riskLevel)}`}>
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-medium">High Risk Entitlement</span>
                  </div>
                  <p className="text-sm mt-1">
                    This entitlement requires careful monitoring and regular
                    review.
                  </p>
                </div>
                {/* REAL: classification */}
                {classification.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">
                      Classifications:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {classification.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="flex space-x-2">
            <Button
              className="flex-1"
              onClick={() => onSelectEntitlement(entitlement)}
            >
              <Eye className="h-4 w-4 mr-2" />
              View Full Details
            </Button>
            <Button variant="outline" className="flex-1">
              <Edit className="h-4 w-4 mr-2" />
              Edit Entitlement
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default EntitlementPreviewPanel;