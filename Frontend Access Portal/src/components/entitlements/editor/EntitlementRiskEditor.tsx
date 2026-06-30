import React, { useState } from "react";
import { EntitlementResponseDto } from "@/types/entitlements";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Target, Shield, FileCheck, AlertTriangle, Bot, Loader2 } from "lucide-react";
import useIdentity from "@/hooks/identities/useIdentity";
import { IDENTITY_ENTITY_TYPES } from "@/constants/identity";

interface EntitlementRiskEditorProps {
  entitlement: EntitlementResponseDto;
  isEditing: boolean;
  onChange: (updates: Partial<EntitlementResponseDto>) => void;
}

// ✅ FIX #1: Removed duplicate declarations of getRiskBadgeClass and getPrivilegeBadgeClass
const getRiskBadgeClass = (risk: string): string => {
  switch (risk.toLowerCase()) {
    case "high":
    case "critical":
      return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800";
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800";
    case "low":
      return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600";
  }
};

const getPrivilegeBadgeClass = (level: string): string => {
  switch (level.toLowerCase()) {
    case "admin":
      return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800";
    case "write":
      return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800";
    case "read":
      return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600";
  }
};

const EntitlementRiskEditor: React.FC<EntitlementRiskEditorProps> = ({
  entitlement,
  isEditing,
  onChange,
}) => {
  const classification = entitlement.classification ?? [];

  const [sodPolicies, setSodPolicies] = useState({
    financialSoD: classification.includes("SOX"),
    dataSoD: classification.includes("PII"),
    adminSoD: classification.includes("High Risk"),
  });

  const [complianceFrameworks, setComplianceFrameworks] = useState({
    sox: classification.includes("SOX"),
    pii: classification.includes("PII"),
    gdpr: classification.includes("GDPR"),
    highRisk: classification.includes("High Risk"),
  });

  const handleRiskChange = (value: string) => {
    onChange({ riskLevel: value });
  };

  const handleComplianceToggle = (
    key: keyof typeof complianceFrameworks
  ) => {
    const updated = {
      ...complianceFrameworks,
      [key]: !complianceFrameworks[key],
    };
    setComplianceFrameworks(updated);

    const tagMap: Record<string, string> = {
      sox: "SOX",
      pii: "PII",
      gdpr: "GDPR",
      highRisk: "High Risk",
    };

    const newClassification = Object.entries(updated)
      .filter(([, v]) => v)
      .map(([k]) => tagMap[k]);
    onChange({ classification: newClassification });
  };

  const riskLabel = entitlement.riskLevel ?? "Low";
  const privilegeLabel = entitlement.privilegeLevel ?? "Read";

  const ownerId =
    typeof entitlement.ownerId === "string" ? entitlement.ownerId : null;

  const { data: ownerIdentity, isLoading: ownerLoading } = useIdentity(
    ownerId ? IDENTITY_ENTITY_TYPES.EMPLOYEE : null,
    ownerId
  );

  const ownerDisplayName = (() => {
    if (!ownerId) return "Unassigned";
    if (ownerLoading) return null;
    if (!ownerIdentity) {
      return typeof entitlement.attributes?.owner === "string"
        ? String(entitlement.attributes.owner)
        : ownerId;
    }

    const core = ownerIdentity.coreAttributes;
    if (!core) {
      return typeof entitlement.attributes?.owner === "string"
        ? String(entitlement.attributes.owner)
        : ownerId;
    }

    const displayName = core.displayName;
    const firstName = core.firstName;
    const lastName = core.lastName;
    const username = core.username;
    const email = core.email;

    if (displayName) return String(displayName);
    if (firstName || lastName)
      return `${String(firstName ?? "")} ${String(lastName ?? "")}`.trim();
    if (username) return String(username);
    if (email) return String(email);
    return ownerId;
  })();

  const ownerUsername = ownerIdentity?.coreAttributes?.username
    ? String(ownerIdentity.coreAttributes.username)
    : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Risk Level Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Risk Level</Label>
              <Select
                value={riskLabel}
                onValueChange={handleRiskChange}
                disabled={!isEditing}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Privilege Level</Label>
              {/* ✅ FIX #2: Removed duplicate value={privilegeLabel} prop */}
              <Select
                value={privilegeLabel}
                onValueChange={(v) => onChange({ privilegeLevel: v })}
                disabled={!isEditing}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Read">Read</SelectItem>
                  <SelectItem value="Write">Write</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {entitlement.riskReason && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Current Risk Reason
              </p>
              <p className="text-sm">{entitlement.riskReason}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Commented-out Compliance Framework Tags card unchanged */}

      {/* Commented-out SoD Policy card unchanged */}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bot className="h-5 w-5" />
            <span>AI Risk Assessment Preview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 border rounded-lg bg-blue-50/50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800">
            {/* ✅ FIX #3 & #4: Removed duplicate <div> and fixed closing tags */}
            <div className="flex items-center gap-2 mb-3">
              <Bot className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-foreground">
                Computed Risk Assessment
              </span>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Risk Level</span>
                <Badge
                  className={`${getRiskBadgeClass(riskLabel)} border text-xs`}
                >
                  {riskLabel.charAt(0).toUpperCase() +
                    riskLabel.slice(1).toLowerCase()}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Privilege Level</span>
                <Badge
                  className={`${getPrivilegeBadgeClass(privilegeLabel)} border text-xs`}
                >
                  {privilegeLabel}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Compliance Tags</span>
                <div className="flex flex-wrap gap-1 justify-end">
                  {classification.length > 0 ? (
                    classification.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="text-xs"
                      >
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">None</span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Assigned Users</span>
                <Badge variant="secondary" className="text-xs">
                  {entitlement.assignedUsersCount ?? 0}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Owner</span>
                {ownerLoading ? (
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                  </span>
                ) : ownerDisplayName === "Unassigned" ? (
                  <Badge
                    variant="outline"
                    className="text-xs bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                  >
                    Unassigned
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">
                    {ownerDisplayName}
                    {ownerUsername &&
                      ownerDisplayName !== ownerUsername && (
                        <span className="text-muted-foreground ml-1">
                          ({ownerUsername})
                        </span>
                      )}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EntitlementRiskEditor;