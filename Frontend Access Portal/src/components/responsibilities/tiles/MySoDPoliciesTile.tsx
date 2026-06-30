import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

import { useMySoDPolicies } from "./hooks";
import {
  TileErrorCard,
  TileHeader,
  TileLoadingSkeleton,
  TileEmptyState,
  ViewAllButton,
  ComplianceIcon,
} from "./components";
import { getSeverityColor, getComplianceLabel } from "./utils";

interface MySoDPoliciesTileProps {
  searchQuery: string;
}

export const MySoDPoliciesTile = ({ searchQuery }: MySoDPoliciesTileProps) => {
  const router = useRouter();

  const { filteredPolicies, violationsCount, isLoading, error } =
    useMySoDPolicies(searchQuery);

  if (error) {
    return (
      <TileErrorCard
        title="Error Loading SoD Policies"
        message="Failed to load SoD policies. Please try again."
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <TileHeader
          icon={<Shield className="h-5 w-5 text-primary" />}
          title="My SoD Policies"
          description="Segregation of Duties policies"
          count={filteredPolicies?.length}
          isLoading={isLoading}
        />
      </CardHeader>
      <CardContent>
        {/* Violations Summary */}
        {!isLoading && violationsCount > 0 && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="text-sm font-medium text-destructive">
                {violationsCount} active violation
                {violationsCount !== 1 ? "s" : ""} detected
              </span>
            </div>
          </div>
        )}

        {isLoading ? (
          <TileLoadingSkeleton count={2} height="h-24" />
        ) : filteredPolicies && filteredPolicies.length > 0 ? (
          <div className="space-y-3">
            {filteredPolicies.slice(0, 5).map((policy) => (
              <div
                key={policy.id}
                className="p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => router.push("/sod-policies")}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm mb-1">{policy.name}</h4>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={getSeverityColor(policy.severity)}
                        className="text-xs"
                      >
                        {policy.severity}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs">
                        <ComplianceIcon status={policy.complianceStatus} />
                        <span
                          className={
                            policy.complianceStatus === "violations"
                              ? "text-destructive"
                              : "text-muted-foreground"
                          }
                        >
                          {getComplianceLabel(policy.complianceStatus)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-3">
                  <div className="flex items-center gap-3">
                    <span>{policy.violationCount} violations</span>
                    <span>{policy.affectedRoles} roles</span>
                  </div>
                  <span>
                    Reviewed {format(new Date(policy.lastReview), "MMM dd")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <TileEmptyState
            icon={<Shield className="h-12 w-12" />}
            message="No SoD policies found"
          />
        )}

        {filteredPolicies && filteredPolicies.length > 0 && (
          <ViewAllButton
            label="View All Policies"
            href="/responsibilities/sod-policies"
          />
        )}
      </CardContent>
    </Card>
  );
};
