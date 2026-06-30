import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, Key } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

import { useMyBusinessRoles } from "./hooks";
import {
  TileErrorCard,
  TileHeader,
  TileLoadingSkeleton,
  TileEmptyState,
  ViewAllButton,
} from "./components";
import { getRoleTypeLabel } from "./utils";
import { getRiskBadgeClass } from "@/utils/getRiskColor";
import { cn } from "@/lib/utils";

interface MyBusinessRolesTileProps {
  searchQuery: string;
}

export const MyBusinessRolesTile = ({
  searchQuery,
}: MyBusinessRolesTileProps) => {
  const router = useRouter();

  const { filteredRoles, isLoading, error } = useMyBusinessRoles(searchQuery);

  if (error) {
    return (
      <TileErrorCard
        title="Error Loading Roles"
        message="Failed to load business roles. Please try again."
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <TileHeader
          icon={<Shield className="h-5 w-5 text-primary" />}
          title="My Business Roles"
          description="Roles you own and manage"
          count={filteredRoles?.length}
          isLoading={isLoading}
          infoTooltipText="Business roles bundle entitlements based on job function. As owner, you're accountable for membership accuracy, risk posture, and periodic certification of each role."
        />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <TileLoadingSkeleton count={3} height="h-24" />
        ) : filteredRoles && filteredRoles.length > 0 ? (
          <div className="space-y-3">
            {filteredRoles.slice(0, 5).map((role) => (
              <div
                key={role.id}
                className="p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => router.push("/access-catalog/roles")}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-sm mb-1">{role.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {getRoleTypeLabel(role.type)}
                    </Badge>
                  </div>
                  <Badge
                    className={cn("text-xs capitalize", getRiskBadgeClass(role.riskLevel))}
                  >
                    {role.riskLevel}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {role.memberCount} members
                  </span>
                  <span className="flex items-center gap-1">
                    <Key className="h-3 w-3" />
                    {role.entitlementCount} entitlements
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  Modified {format(new Date(role.lastModified), "MMM dd, yyyy")}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <TileEmptyState
            icon={<Shield className="h-12 w-12" />}
            message="No business roles found"
            action={{
              label: "Create New Role",
              onClick: () => { },
            }}
          />
        )}

        {filteredRoles && filteredRoles.length > 0 && (
          <ViewAllButton
            label="View All Roles"
            href="/responsibilities/roles"
          />
        )}
      </CardContent>
    </Card>
  );
};
