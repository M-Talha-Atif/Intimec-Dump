import React from "react";
import { EntitlementResponseDto } from "@/types/entitlements";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import useIdentity from "@/hooks/identities/useIdentity";
import { IDENTITY_ENTITY_TYPES } from "@/constants/identity";

interface EntitlementAttributesViewerProps {
  entitlement: EntitlementResponseDto;
}

const EntitlementAttributesViewer: React.FC<
  EntitlementAttributesViewerProps
> = ({ entitlement }) => {
  // REAL: type priority: kind -> attributes.type -> objectClass
  const typeLabel =
    typeof entitlement.kind === "string"
      ? entitlement.kind
      : typeof entitlement.attributes?.type === "string"
        ? String(entitlement.attributes.type)
        : entitlement.objectClass ?? "Standard";

  // REAL: riskLevel; MOCK fallback "Low"
  const riskLabel = entitlement.riskLevel ?? "Low";

  // REAL: classification; null-safe
  const classification = entitlement.classification ?? [];

  // Resolve owner identity
  const ownerId =
    typeof entitlement.ownerId === "string" ? entitlement.ownerId : null;

  const {
    data: ownerIdentity,
    isLoading: ownerLoading,
  } = useIdentity(
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

  // MOCK: lastUsed not in API; using updatedAt epoch ms as proxy
  const lastUsedLabel = entitlement.updatedAt
    ? format(new Date(entitlement.updatedAt), "MMM d, yyyy")
    : "Never";

  // REAL: createdAt epoch ms
  const createdAtLabel = entitlement.createdAt
    ? format(new Date(entitlement.createdAt), "MMM d, yyyy")
    : "-";

  return (
    <div className="space-y-6">
      {/* Basic Attributes */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Attributes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* REAL: displayName */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Display Name
              </label>
              <div className="text-slate-900">{entitlement.displayName}</div>
            </div>

            {/* REAL: resourceName */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Application
              </label>
              <div className="text-slate-900">
                {entitlement.resourceName ?? "-"}
              </div>
            </div>

            {/* REAL: sourceUid */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Source UID
              </label>
              <div className="text-slate-900 font-mono text-sm">
                {entitlement.sourceUid}
              </div>
            </div>

            {/* REAL: objectClass */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Object Class
              </label>
              <div className="text-slate-900">{entitlement.objectClass}</div>
            </div>

            {/* REAL: attributes.type / objectClass */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Type
              </label>
              <div className="text-slate-900">{typeLabel}</div>
            </div>

            {/* REAL: lifecycle */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Lifecycle
              </label>
              <Badge
                variant="outline"
                className={
                  entitlement.lifecycle === "Active"
                    ? "border-green-300 bg-green-50 text-green-700"
                    : "border-gray-300 bg-gray-50 text-gray-600"
                }
              >
                {entitlement.lifecycle ?? "Unknown"}
              </Badge>
            </div>

            {/* REAL: description */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Description
              </label>
              <div className="text-slate-900">{entitlement.description}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Classification & Tags */}
      <Card>
        <CardHeader>
          <CardTitle>Classification & Tags</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* REAL: classification array */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Classifications
              </label>
              <div className="flex flex-wrap gap-2">
                {classification.length > 0 ? (
                  classification.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))
                ) : (
                  <span className="text-slate-500 text-sm">
                    No classifications assigned
                  </span>
                )}
              </div>
            </div>

            {/* REAL: riskLevel */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Risk Level
              </label>
              <Badge
                variant="outline"
                className={
                  riskLabel.toLowerCase() === "high"
                    ? "border-red-300 bg-red-50 text-red-700"
                    : riskLabel.toLowerCase() === "medium"
                      ? "border-yellow-300 bg-yellow-50 text-yellow-700"
                      : "border-green-300 bg-green-50 text-green-700"
                }
              >
                {riskLabel} Risk
              </Badge>
            </div>

            {/* REAL: riskReason when present */}
            {entitlement.riskReason && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Risk Reason
                </label>
                <p className="text-sm text-slate-700">
                  {entitlement.riskReason}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Ownership & Governance */}
      <Card>
        <CardHeader>
          <CardTitle>Ownership & Governance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* REAL: owner resolved via useIdentity */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Owner
              </label>
              <div className="text-slate-900">
                {ownerLoading ? (
                  <span className="flex items-center gap-1 text-slate-400">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Loading...
                  </span>
                ) : (
                  <span>
                    {ownerDisplayName}
                    {ownerUsername &&
                      ownerDisplayName !== ownerUsername && (
                        <span className="text-xs text-slate-500 ml-1">
                          ({ownerUsername})
                        </span>
                      )}
                  </span>
                )}
              </div>
            </div>

            {/* MOCK: lastUsed not in API; using updatedAt as proxy */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Last Updated
              </label>
              <div className="text-slate-900">{lastUsedLabel}</div>
            </div>

            {/* REAL: requireApproval */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Requires Approval
              </label>
              <div className="text-slate-900">
                {entitlement.requireApproval ? "Yes" : "No"}
              </div>
            </div>

            {/* REAL: allowedAutomatedGrant */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Automated Grant Allowed
              </label>
              <div className="text-slate-900">
                {entitlement.allowedAutomatedGrant ? "Yes" : "No"}
              </div>
            </div>

            {/* REAL: createdAt */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Created At
              </label>
              <div className="text-slate-900">{createdAtLabel}</div>
            </div>

            {/* REAL: requestable */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Requestable
              </label>
              <div className="text-slate-900">
                {entitlement.requestable ? "Yes" : "No"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EntitlementAttributesViewer;