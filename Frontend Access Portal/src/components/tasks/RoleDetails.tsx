import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Shield, Users, Clock, HelpCircle, Loader2 } from "lucide-react";
import { useRoleDetails } from "@/hooks/useRoleDetails";
import { cn } from "@/lib/utils";
import { getRiskBadgeClass } from "@/utils/getRiskColor";

interface RoleDetailsProps {
  roleId: string;
}

export const RoleDetails: React.FC<RoleDetailsProps> = ({ roleId }) => {
  const { roleDetails, loading } = useRoleDetails(roleId);

  const formatDate = (timestamp: number) =>
    new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">
            Loading role details...
          </span>
        </CardContent>
      </Card>
    );
  }

  if (!roleDetails) return null;

  return (
    <div className="space-y-6">
      {/* Role Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            Role Information
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">

            <div>
              <p className="text-xs text-muted-foreground">Role Name</p>
              <p className="font-medium">{roleDetails.roleName}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Role Type</p>
              <Badge variant="outline">{roleDetails.roleType}</Badge>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Risk Level</p>
              <Badge className={cn(getRiskBadgeClass(roleDetails.riskLevel))}>
                {roleDetails.riskLevel}
              </Badge>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <Badge variant={roleDetails.isActive ? "default" : "secondary"}>
                {roleDetails.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>

          </div>

          <div className="grid md:grid-cols-2 gap-6">

            <div>
              <p className="text-xs text-muted-foreground mb-1">Description</p>
              <p className="text-sm">
                {roleDetails.description || "No description provided"}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Business Justification
              </p>
              <p className="text-sm">
                {roleDetails.businessJustification || "Not provided"}
              </p>
            </div>

          </div>

          {roleDetails.ownersData?.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Owners</p>
              <div className="flex flex-wrap gap-2">
                {roleDetails.ownersData.map((owner) => (
                  <Badge key={owner.id} variant="outline">
                    {owner.displayName || `${owner.firstName} ${owner.lastName}`}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            Usage Statistics
          </CardTitle>
        </CardHeader>

        <CardContent className="grid grid-cols-2 gap-6">

          <div>
            <p className="text-xs text-muted-foreground">Users Assigned</p>
            <p className="text-lg font-semibold">{roleDetails.userCount}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Permissions</p>
            <p className="text-lg font-semibold">{roleDetails.permissionsCount}</p>
          </div>

        </CardContent>
      </Card>

      {/* Audit Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            Audit Information
          </CardTitle>
        </CardHeader>

        <CardContent className="grid grid-cols-2 gap-6 text-sm">

          <div>
            <p className="text-xs text-muted-foreground">Created By</p>
            <p className="font-medium">{roleDetails.createdByName}</p>
            <p className="text-xs text-muted-foreground">
              {formatDate(roleDetails.createdAt)}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Last Updated By</p>
            <p className="font-medium">{roleDetails.updatedByName}</p>
            <p className="text-xs text-muted-foreground">
              {formatDate(roleDetails.updatedAt)}
            </p>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};