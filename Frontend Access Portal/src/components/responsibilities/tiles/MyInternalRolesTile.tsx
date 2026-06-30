import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, ShieldAlert } from "lucide-react";

import { useMyInternalRoles } from "./hooks";
import {
  TileErrorCard,
  TileHeader,
  TileLoadingSkeleton,
  TileEmptyState,
  ViewAllButton,
} from "./components";
import { getScopeColor, getScopeLabel } from "./utils";

interface MyInternalRolesTileProps {
  searchQuery: string;
}

export const MyInternalRolesTile = ({
  searchQuery,
}: MyInternalRolesTileProps) => {
  const { filteredRoles, isLoading, error } = useMyInternalRoles(searchQuery);

  if (error) {
    return (
      <TileErrorCard
        title="Error Loading Internal Roles"
        message="Failed to load internal roles. Please try again."
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <TileHeader
          icon={<Lock className="h-5 w-5 text-primary" />}
          title="My Internal Roles"
          description="System and platform roles"
          count={filteredRoles?.length}
          isLoading={isLoading}
        />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <TileLoadingSkeleton count={2} height="h-24" />
        ) : filteredRoles && filteredRoles.length > 0 ? (
          <div className="space-y-3">
            {filteredRoles.slice(0, 5).map((role) => (
              <div
                key={role.id}
                className="p-3 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{role.name}</h4>
                      {role.isCritical && (
                        <ShieldAlert className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                    <Badge
                      variant={getScopeColor(role.scope)}
                      className="text-xs"
                    >
                      {getScopeLabel(role.scope)}
                    </Badge>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-xs text-muted-foreground mb-2">
                    Permissions:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.slice(0, 3).map((perm) => (
                      <Badge key={perm} variant="outline" className="text-xs">
                        {perm}
                      </Badge>
                    ))}
                    {role.permissions.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{role.permissions.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <TileEmptyState
            icon={<Lock className="h-12 w-12" />}
            message="No internal roles found"
          />
        )}

        {filteredRoles && filteredRoles.length > 0 && (
          <ViewAllButton
            label="Manage Internal Roles"
            href="/responsibilities/internal-roles"
          />
        )}
      </CardContent>
    </Card>
  );
};
