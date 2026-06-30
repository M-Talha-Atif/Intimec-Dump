import React from "react";
import { EntitlementResponseDto } from "@/types/entitlements";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Calendar,
  TrendingUp,
  Shield,
  Building,
  Heart,
  Tag,
  Layers,
  Loader2,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { useCssVariable } from "@/hooks/useCssVariable";
import { format } from "date-fns";
import useIdentity from "@/hooks/identities/useIdentity";
import { IDENTITY_ENTITY_TYPES } from "@/constants/identity";
import { attr } from "@/types/identity";

interface EntitlementOverviewViewerProps {
  entitlement: EntitlementResponseDto;
}

const EntitlementOverviewViewer: React.FC<EntitlementOverviewViewerProps> = ({
  entitlement,
}) => {
  // MOCK: usage trend data - replace with real usage history API endpoint when available
  const usageTrendData = [
    { month: "Jan", usageCount: 45 },
    { month: "Feb", usageCount: 52 },
    { month: "Mar", usageCount: 48 },
    { month: "Apr", usageCount: 61 },
    { month: "May", usageCount: 55 },
    { month: "Jun", usageCount: 67 },
  ];

  const primaryColor = useCssVariable("--primary");

  // Resolve owner identity to get display name
  const ownerId =
    typeof entitlement.ownerId === "string" ? entitlement.ownerId : null;

  const {
    data: ownerIdentity,
    isLoading: ownerLoading,
    error: ownerError,
  } = useIdentity(
    ownerId ? IDENTITY_ENTITY_TYPES.EMPLOYEE : null,
    ownerId
  );

  // Build owner display label
  const ownerLabel = (() => {
    if (!ownerId) return "Unassigned";
    if (ownerLoading) return null; // handled in JSX with spinner
    if (ownerError || !ownerIdentity) {
      // Fallback to attributes.owner or raw ID
      return typeof entitlement.attributes?.owner === "string"
        ? String(entitlement.attributes.owner)
        : ownerId;
    }

    // Resolve from coreAttributes
    const username = ownerIdentity.coreAttributes?.username;
    const displayName = ownerIdentity.coreAttributes?.displayName;
    const firstName = ownerIdentity.coreAttributes?.firstName;
    const lastName = ownerIdentity.coreAttributes?.lastName;
    const email = ownerIdentity.coreAttributes?.email;

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

  // REAL: riskLevel from API. MOCK fallback "Low" when null.
  const riskLabel = entitlement.riskLevel ?? "Low";

  // REAL: classification array from API. Null-safe.
  const classification = entitlement.classification ?? [];

  // REAL: requestable from API.
  const { requestable, lifecycle, privilegeLevel, assignedUsersCount } =
    entitlement;

  // REAL: type priority: kind -> attributes.type -> objectClass
  const typeLabel =
    typeof entitlement.kind === "string"
      ? entitlement.kind
      : typeof entitlement.attributes?.type === "string"
        ? String(entitlement.attributes.type)
        : entitlement.objectClass ?? "Standard";

  // Governance health score derived from real fields
  const hasOwner = !!entitlement.ownerId || !!entitlement.attributes?.owner;
  const hasClassification = classification.length > 0;
  const isActive = lifecycle === "Active";
  // MOCK: hasReviews - replace with real review history count from API when available
  const hasReviews = false;

  const healthScore =
    [hasOwner, hasClassification, isActive, hasReviews].filter(Boolean).length *
    25;
  const healthColor =
    healthScore >= 75
      ? "text-emerald-600"
      : healthScore >= 50
        ? "text-amber-600"
        : "text-destructive";

  // REAL: updatedAt epoch ms -> formatted date for "Last Updated"
  const lastUsedLabel = entitlement.updatedAt
    ? format(new Date(entitlement.updatedAt), "MMM d, yyyy")
    : "Never";

  return (
    <div className="space-y-6">
      {/* Key Information */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* REAL: resourceName */}
        <div className="flex items-center space-x-3">
          <Building className="h-5 w-5 text-muted-foreground" />
          <div>
            <div className="text-sm font-medium text-muted-foreground">
              Resource
            </div>
            <div className="text-foreground">
              {entitlement.resourceName ?? "-"}
            </div>
          </div>
        </div>

        {/* REAL: owner resolved via useIdentity */}
        <div className="flex items-center space-x-3">
          <User className="h-5 w-5 text-muted-foreground" />
          <div>
            <div className="text-sm font-medium text-muted-foreground">
              Owner
            </div>
            <div className="text-foreground">
              {ownerLoading ? (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Loading...
                </span>
              ) : (
                <span>
                  {ownerLabel}
                  {ownerUsername && ownerLabel !== ownerUsername && (
                    <span className="text-xs text-muted-foreground ml-1">
                      ({ownerUsername})
                    </span>
                  )}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* REAL: riskLevel */}
        <div className="flex items-center space-x-3">
          <Shield className="h-5 w-5 text-muted-foreground" />
          <div>
            <div className="text-sm font-medium text-muted-foreground">
              Risk Level
            </div>
            <div className="text-foreground">{riskLabel.charAt(0).toUpperCase() + riskLabel.slice(1).toLowerCase()}</div>
          </div>
        </div>

        {/* REAL: updatedAt as proxy for last activity */}
        <div className="flex items-center space-x-3">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <div>
            <div className="text-sm font-medium text-muted-foreground">
              Last Updated
            </div>
            <div className="text-foreground">{lastUsedLabel}</div>
          </div>
        </div>
      </div>

      {/* Health / Privilege / Classification cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Heart className="h-4 w-4" /> Governance Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className={`text-3xl font-bold ${healthColor}`}>
                {healthScore}%
              </div>
              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Owner Assigned</span>
                  <span>{hasOwner ? "✓" : "✗"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Classified</span>
                  <span>{hasClassification ? "✓" : "✗"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Lifecycle</span>
                  <span>{isActive ? "✓" : "✗"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Reviewed</span>
                  <span>{hasReviews ? "✓" : "✗"}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Layers className="h-4 w-4" /> Privilege Composition
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Privilege Level</span>
                <Badge
                  variant={
                    privilegeLevel === "Admin"
                      ? "destructive"
                      : privilegeLevel === "Write"
                        ? "default"
                        : "secondary"
                  }
                  className="text-xs"
                >
                  {privilegeLevel ?? "Read"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Type</span>
                <Badge variant="outline" className="text-xs">
                  {typeLabel}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Lifecycle</span>
                <Badge variant="outline" className="text-xs">
                  {lifecycle ?? "Active"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Requestable</span>
                <span className="text-sm font-medium">
                  {requestable ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Tag className="h-4 w-4" /> Classifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            {classification.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {classification.map((c) => (
                  <Badge
                    key={c}
                    variant={c === "High Risk" ? "destructive" : "outline"}
                    className="text-xs"
                  >
                    {c}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No classifications assigned
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* MOCK: Usage Trend chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Usage Trend</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={usageTrendData}>
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 12,
                    fill: "hsl(var(--muted-foreground))",
                  }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 12,
                    fill: "hsl(var(--muted-foreground))",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="usageCount"
                  stroke={primaryColor}
                  strokeWidth={2}
                  dot={{ fill: primaryColor, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Strategic Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Strategic Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Business Impact</h4>
              <div className="p-4 bg-muted/50 border rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {riskLabel.toLowerCase() === "high"
                      ? "High"
                      : riskLabel.toLowerCase() === "medium"
                        ? "Moderate"
                        : "Low"}{" "}
                    business impact entitlement
                  </span>
                  <span className="text-sm text-primary">
                    Used by {assignedUsersCount ?? 0} users
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Governance Status</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start space-x-2">
                  <div
                    className={`w-1.5 h-1.5 rounded-full mt-2 ${
                      hasOwner && hasClassification
                        ? "bg-emerald-500"
                        : "bg-amber-500"
                    }`}
                  />
                  <span>
                    {hasOwner && hasClassification
                      ? "Compliant with current policies"
                      : "Governance gaps detected - review ownership and classification"}
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <div
                    className={`w-1.5 h-1.5 rounded-full mt-2 ${
                      hasReviews ? "bg-emerald-500" : "bg-destructive"
                    }`}
                  />
                  <span>
                    {hasReviews
                      ? "Regular certification completed"
                      : "No certifications on record - schedule a review"}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EntitlementOverviewViewer;