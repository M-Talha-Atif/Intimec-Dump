import React, { useState } from "react";
import { EntitlementResponseDto } from "@/types/entitlements";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, Users, Shield, Plus, X, Search } from "lucide-react";

interface EntitlementRelationshipsEditorProps {
  entitlement: EntitlementResponseDto;
  allEntitlements: EntitlementResponseDto[];
  isEditing: boolean;
  onChange: (updates: Partial<EntitlementResponseDto>) => void;
  onSelectEntitlement: (entitlement: EntitlementResponseDto) => void;
}

// MOCK: available roles list - replace with real roles API endpoint when available
const mockAvailableRoles = [
  { name: "IT Administrator", type: "Business", userCount: 8 },
  { name: "Security Operations", type: "Technical", userCount: 5 },
  { name: "AP Supervisor Role", type: "Business", userCount: 12 },
  { name: "Sales Manager", type: "Business", userCount: 25 },
  { name: "HR Business Partner", type: "Business", userCount: 15 },
  { name: "DevOps Engineer", type: "Technical", userCount: 20 },
  { name: "Compliance Analyst", type: "Business", userCount: 8 },
];

const EntitlementRelationshipsEditor: React.FC<
  EntitlementRelationshipsEditorProps
> = ({ entitlement, allEntitlements, isEditing, onChange, onSelectEntitlement }) => {
  // MOCK: associatedRoles not in API yet - local state only until roles API is available
  const [associatedRoles, setAssociatedRoles] = useState<string[]>([]);
  const [roleSearch, setRoleSearch] = useState("");
  const [showRoleSearch, setShowRoleSearch] = useState(false);

  const availableRoles = mockAvailableRoles.filter(
    (r) =>
      !associatedRoles.includes(r.name) &&
      r.name.toLowerCase().includes(roleSearch.toLowerCase())
  );

  const handleAddRole = (roleName: string) => {
    const updated = [...associatedRoles, roleName];
    setAssociatedRoles(updated);
    // MOCK: onChange not called for associatedRoles since field doesn't exist in DTO yet
    setRoleSearch("");
    setShowRoleSearch(false);
  };

  const handleRemoveRole = (roleName: string) => {
    setAssociatedRoles((prev) => prev.filter((r) => r !== roleName));
  };

  // REAL: related by same resourceId (or resourceName fallback)
  const relatedEntitlements = allEntitlements
    .filter(
      (e) =>
        e.id !== entitlement.id &&
        (e.resourceId === entitlement.resourceId ||
          (e.resourceName &&
            e.resourceName === entitlement.resourceName &&
            e.resourceName !== "Unknown"))
    )
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* MOCK: Role Associations - waiting on roles API */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {/* <Users className="h-5 w-5" /> */}
              <span>
                Role Associations ({associatedRoles.length})
                {/* MOCK: data - replace when roles API is available */}
              </span>
            </div>
            {isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRoleSearch(!showRoleSearch)}
              >
                <Plus className="h-4 w-4 mr-1" /> Add Role
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {showRoleSearch && (
            <div className="border rounded-lg p-3 space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search roles..."
                  value={roleSearch}
                  onChange={(e) => setRoleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {availableRoles.map((role) => (
                  <div
                    key={role.name}
                    className="flex items-center justify-between p-2 hover:bg-muted/50 rounded cursor-pointer"
                    onClick={() => handleAddRole(role.name)}
                  >
                    <div>
                      <span className="text-sm font-medium">{role.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {role.type} - {role.userCount} users
                      </span>
                    </div>
                    <Plus className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
                {availableRoles.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    No matching roles
                  </p>
                )}
              </div>
            </div>
          )}

          {associatedRoles.length > 0 ? (
            associatedRoles.map((roleName) => {
              const roleInfo = mockAvailableRoles.find(
                (r) => r.name === roleName
              );
              return (
                <div
                  key={roleName}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium text-foreground">
                        {roleName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {roleInfo?.type ?? "Business"} -{" "}
                        {roleInfo?.userCount ?? 0} users
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {roleInfo?.type ?? "Business"}
                    </Badge>
                    {isEditing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveRole(roleName)}
                      >
                        <X className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">No role associations</p>
              <p className="text-xs">
                Add roles that should include this entitlement
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* REAL: related entitlements by resourceId */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {/* <Link className="h-5 w-5" /> */}
            {/* REAL: resourceName as section label */}
            <span>
              Related Entitlements -{" "}
              {entitlement.resourceName ?? entitlement.sourceUid}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {relatedEntitlements.length > 0 ? (
            <div className="space-y-2">
              {relatedEntitlements.map((e) => {
                const typeLabel =
                  typeof e.kind === "string"
                    ? e.kind
                    : typeof e.attributes?.type === "string"
                      ? e.attributes.type
                      : e.objectClass ?? "-";
                return (
                  <div
                    key={e.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                    onClick={() => onSelectEntitlement(e)}
                  >
                    <div>
                      {/* REAL: displayName */}
                      <p className="text-sm font-medium">{e.displayName}</p>
                      {/* REAL: type + riskLevel */}
                      <p className="text-xs text-muted-foreground">
                        {typeLabel} - {e.riskLevel ?? "Low"} risk
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Same Resource
                    </Badge>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No related entitlements in this resource
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EntitlementRelationshipsEditor;