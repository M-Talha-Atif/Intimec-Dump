import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppWindow, Users, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

import { useMyApplications } from "./hooks";
import {
  TileErrorCard,
  TileHeader,
  TileLoadingSkeleton,
  TileEmptyState,
  ViewAllButton,
  ConnectorIcon,
} from "./components";
import { getEnvColor, getConnectorLabel } from "./utils";

interface MyApplicationsTileProps {
  searchQuery: string;
}

export const MyApplicationsTile = ({
  searchQuery,
}: MyApplicationsTileProps) => {
  const router = useRouter();
  const [envFilter, setEnvFilter] = useState<string>("all");

  const { filteredApplications, isLoading, error } = useMyApplications(
    searchQuery,
    envFilter,
  );

  if (error) {
    return (
      <TileErrorCard
        title="Error Loading Applications"
        message="Failed to load applications. Please try again."
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <TileHeader
          icon={<AppWindow className="h-5 w-5 text-primary" />}
          title="My Applications"
          description="Applications you own or manage"
          count={filteredApplications?.length}
          isLoading={isLoading}
          infoTooltipText="Applications where you are the designated governance owner. You're responsible for access reviews, connector health, entitlement accuracy, and ensuring proper onboarding/offboarding flows."
        />
      </CardHeader>
      <CardContent>
        {/* Environment Filter */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={envFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setEnvFilter("all")}
          >
            All
          </Button>
          <Button
            variant={envFilter === "prod" ? "default" : "outline"}
            size="sm"
            onClick={() => setEnvFilter("prod")}
          >
            Production
          </Button>
          <Button
            variant={envFilter === "test" ? "default" : "outline"}
            size="sm"
            onClick={() => setEnvFilter("test")}
          >
            Test
          </Button>
        </div>

        {isLoading ? (
          <TileLoadingSkeleton count={3} height="h-24" />
        ) : filteredApplications && filteredApplications.length > 0 ? (
          <div className="space-y-3">
            {filteredApplications.slice(0, 5).map((app) => (
              <div
                key={app.id}
                className="p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => router.push("/responsibilities/applications")}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-sm mb-1">{app.name}</h4>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="text-xs flex items-center gap-1"
                      >
                        <ConnectorIcon type={app.connectorType} />
                        {getConnectorLabel(app.connectorType)}
                      </Badge>
                      <Badge
                        variant={getEnvColor(app.environment)}
                        className="text-xs"
                      >
                        {app.environment.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mb-2">
                  System ID: {app.systemId}
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    {app.linkedRoles} roles
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {app.activeUsers} users
                  </span>
                  <span>Synced {format(new Date(app.lastSync), "MMM dd")}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <TileEmptyState
            icon={<AppWindow className="h-12 w-12" />}
            message="No applications found"
          />
        )}

        {filteredApplications && filteredApplications.length > 0 && (
          <ViewAllButton label="View All Applications" href="/applications" />
        )}
      </CardContent>
    </Card>
  );
};
