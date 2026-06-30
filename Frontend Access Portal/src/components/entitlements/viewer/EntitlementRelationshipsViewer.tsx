import React from "react";
import { EntitlementResponseDto } from "@/types/entitlements";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, Users, Shield, Network, List } from "lucide-react";
import EntitlementRelationshipGraph from "../EntitlementRelationshipGraph";

interface EntitlementRelationshipsViewerProps {
  entitlement: EntitlementResponseDto;
  allEntitlements: EntitlementResponseDto[];
  onSelectEntitlement: (entitlement: EntitlementResponseDto) => void;
}

// MOCK: static role lookup map - replace with real role API endpoint when available
const mockRoleData: Record<
  string,
  { name: string; type: string; userCount: number; classification: string }
> = {
  "IT Administrator": {
    name: "IT Administrator",
    type: "Business",
    userCount: 8,
    classification: "Admin Role",
  },
  "Security Operations": {
    name: "Security Operations",
    type: "Technical",
    userCount: 5,
    classification: "Privileged",
  },
  "AP Supervisor Role": {
    name: "AP Supervisor Role",
    type: "Business",
    userCount: 12,
    classification: "Standard",
  },
  "Sales Manager": {
    name: "Sales Manager",
    type: "Business",
    userCount: 25,
    classification: "Standard",
  },
  "IT Standard Role": {
    name: "IT Standard Role",
    type: "Technical",
    userCount: 45,
    classification: "Standard",
  },
};

const EntitlementRelationshipsViewer: React.FC<
  EntitlementRelationshipsViewerProps
> = ({ entitlement, allEntitlements, onSelectEntitlement }) => {
  // REAL: filter allEntitlements by same resourceId (same resource = related)
  // Falls back to resourceName match when resourceId is absent.
  const relatedEntitlements = allEntitlements
    .filter(
      (ent) =>
        ent.id !== entitlement.id &&
        (ent.resourceId === entitlement.resourceId ||
          (ent.resourceName &&
            ent.resourceName === entitlement.resourceName &&
            ent.resourceName !== "Unknown"))
    )
    .slice(0, 5);

  // MOCK: associatedRoles not in API - replace with real roles API endpoint when available
  // For now render an empty list with the mock lookup map ready for when data arrives.
  const associatedRoles: Array<{
    name: string;
    type: string;
    userCount: number;
    classification: string;
  }> = [];
  // Future: map entitlement.associatedRoles (when API provides it) through mockRoleData
  // const associatedRoles = (entitlement.associatedRoles ?? []).map(
  //   roleName => mockRoleData[roleName] ?? { name: roleName, type: "Business", userCount: 0, classification: "Standard" }
  // );

  return (
    <Tabs defaultValue="list" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="list" className="flex items-center space-x-2">
          <List className="h-4 w-4" />
          <span>List View</span>
        </TabsTrigger>
        <TabsTrigger value="graph" className="flex items-center space-x-2">
          <Network className="h-4 w-4" />
          <span>Graph View</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="list" className="space-y-6 mt-4">
        {/* MOCK: Role Associations - waiting on roles API */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {/* <Users className="h-5 w-5" /> */}
              <span>
                Role Associations ({associatedRoles.length})
                {/* MOCK: data - replace badge when roles API is available */}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {associatedRoles.length > 0 ? (
              <div className="space-y-3">
                {associatedRoles.map((role, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium text-foreground">
                          {role.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {role.type} - {role.userCount} users
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant={
                        role.classification === "Admin Role"
                          ? "destructive"
                          : role.classification === "Privileged"
                            ? "default"
                            : "outline"
                      }
                      className="text-xs"
                    >
                      {role.classification}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2" />
                <p>No role associations defined</p>
                <p className="text-sm">
                  This entitlement is not currently assigned to any roles
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
              <span>Related Entitlements ({relatedEntitlements.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {relatedEntitlements.length > 0 ? (
              <div className="space-y-3">
                {relatedEntitlements.map((relatedEnt) => {
                  const relatedType =
                    typeof relatedEnt.kind === "string"
                      ? relatedEnt.kind
                      : typeof relatedEnt.attributes?.type === "string"
                        ? relatedEnt.attributes.type
                        : relatedEnt.objectClass ?? "-";
                  return (
                    <div
                      key={relatedEnt.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                      onClick={() => onSelectEntitlement(relatedEnt)}
                    >
                      <div className="flex items-center space-x-3">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <div>
                          {/* REAL: displayName */}
                          <div className="font-medium text-foreground">
                            {relatedEnt.displayName}
                          </div>
                          {/* REAL: resourceName + type */}
                          <div className="text-sm text-muted-foreground">
                            {relatedEnt.resourceName ?? "-"} - {relatedType}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Same Resource
                      </Badge>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Link className="h-8 w-8 mx-auto mb-2" />
                <p>No related entitlements found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="graph" className="mt-4">
        <div className="h-[600px]">
          {/* EntitlementRelationshipGraph still uses its own internal mock data */}
          <EntitlementRelationshipGraph
            entitlement={entitlement}
            allEntitlements={allEntitlements}
            onSelectEntitlement={onSelectEntitlement}
          />
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default EntitlementRelationshipsViewer;