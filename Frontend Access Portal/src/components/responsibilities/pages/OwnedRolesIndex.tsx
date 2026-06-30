"use client";

import { useState } from "react";
import { useResponsibilitiesContext } from "./context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Key,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Edit,
  UserPlus,
  RefreshCw,
  ArrowRightLeft,
  Download,
  Plus,
  FolderTree,
} from "lucide-react";
import { format } from "date-fns";
import { useConfirm } from "@/hooks/useConfirm";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useOwnedRoles } from "./hooks/useOwnedRoles";
import { PageEmptyState } from "./components";
import PageHeader from "@/components/shared/PageHeader";
import { getRiskColor } from "../utils";
import { useRouter } from "next/navigation";
import { ListControlsCard } from "@/components/shared/ListControlsCard";

export const OwnedRolesIndex = () => {
  const router = useRouter();
  const { globalSearch } = useResponsibilitiesContext();

  const [typeFilter, setTypeFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");
  const [expandedRoles, setExpandedRoles] = useState<Set<string>>(new Set());

  const { isOpen, options, handleConfirm, handleCancel } = useConfirm();

  const {
    filteredRoles,
    isLoading,
    actions: { handleRecertify, handleTransferOwnership },
    mutationStates: { isRecertifying, isTransferring },
  } = useOwnedRoles(globalSearch, typeFilter, riskFilter);

  const toggleExpanded = (roleId: string) => {
    const next = new Set(expandedRoles);
    next.has(roleId) ? next.delete(roleId) : next.add(roleId);
    setExpandedRoles(next);
  };

  return (
    <div className="space-y-6 p-4 sm:lg-6 lg:p-8">

      {/* Header */}
      <PageHeader
        title="Owned Roles & Entitlements"
        description="Business, Functional, and Application Roles you manage"
        icon={<FolderTree className="h-6 w-6 text-primary" />}
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>

            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Create Role
            </Button>
          </>
        }
      />

      {/* List Controls */}
      <ListControlsCard
        title="Business Roles"
        totalItems={filteredRoles?.length || 0}
        displayCount={filteredRoles?.length || 0}
        itemLabel="roles"
        searchQuery={globalSearch || ""}
        onSearchChange={() => {}}
        searchPlaceholder="Search roles..."
        searchTooltip="Search by role name"
        filters={[
          {
            key: "type",
            placeholder: "All Types",
            tooltip: "Filter by role type",
            options: [
              { label: "All Types", value: "all" },
              { label: "Business", value: "business" },
              { label: "Functional", value: "functional" },
              { label: "Application", value: "application" },
            ],
          },
          {
            key: "risk",
            placeholder: "All Risk",
            tooltip: "Filter by risk level",
            options: [
              { label: "All Risk", value: "all" },
              { label: "Low", value: "low" },
              { label: "Medium", value: "medium" },
              { label: "High", value: "high" },
              { label: "Critical", value: "critical" },
            ],
          },
        ]}
        filterValues={{ type: typeFilter, risk: riskFilter }}
        onFilterChange={(key, value) => {
          if (key === "type") setTypeFilter(value);
          if (key === "risk") setRiskFilter(value);
        }}
        pageSize={10}
        pageSizeLabel='Tasks per page:'
        onPageSizeChange={() => {}}
      />

      {/* AI Recommendation */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-5 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1">
              AI Role Hygiene Recommendation
            </h3>
            <p className="text-sm text-muted-foreground">
              We've detected 3 roles with similar entitlements that could
              potentially be merged to reduce complexity.
            </p>
          </div>

          <Button variant="outline" size="sm">
            Review Suggestions
          </Button>
        </CardContent>
      </Card>

      {/* Roles */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : filteredRoles?.length ? (
        <div className="space-y-4">

          {filteredRoles.map((role) => {
            const isExpanded = expandedRoles.has(role.id);

            return (
              <Card
                key={role.id}
                className="transition hover:shadow-sm"
              >
                <CardContent className="p-5 space-y-4">

                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">

                    <div className="flex items-start gap-3 flex-1 min-w-0">

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground"
                        onClick={() => toggleExpanded(role.id)}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>

                      <div className="flex-1 space-y-2">

                        <div className="flex flex-wrap items-center gap-2">

                          <h3 className="text-sm font-semibold">
                            {role.name}
                          </h3>

                          <Badge variant="outline" className="capitalize">
                            {role.type.replace("_", " ")}
                          </Badge>

                          <Badge variant={getRiskColor(role.riskLevel)}>
                            {role.riskLevel} risk
                          </Badge>

                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">

                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {role.memberCount} members
                          </span>

                          <span className="flex items-center gap-1">
                            <Key className="h-3.5 w-3.5" />
                            {role.entitlementCount} entitlements
                          </span>

                          <span>
                            Modified{" "}
                            {format(new Date(role.lastModified), "MMM dd yyyy")}
                          </span>

                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          router.push("/access-catalog/roles")
                        }
                      >
                        View Details
                      </Button>

                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>

                      <Button size="sm" variant="outline">
                        <UserPlus className="h-4 w-4" />
                      </Button>

                      {/* <Button
                        size="sm"
                        variant="outline"
                        disabled={isRecertifying}
                        onClick={() => handleRecertify(role.id)}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isTransferring}
                        onClick={() => handleTransferOwnership(role.id)}
                      >
                        <ArrowRightLeft className="h-4 w-4" />
                      </Button> */}

                    </div>
                  </div>

                  {/* Expanded */}
                  {isExpanded && (
                    <div className="pt-4">

                      <h4 className="text-sm font-medium mb-3">
                        Linked Entitlements
                      </h4>

                      <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">

                        {Array.from({ length: role.entitlementCount }).map(
                          (_, idx) => (
                            <div
                              key={idx}
                              className="rounded-md border p-3 bg-muted/30"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">
                                  Entitlement {idx + 1}
                                </span>

                                <Badge variant="outline" className="text-xs">
                                  Read
                                </Badge>
                              </div>

                              <p className="text-xs text-muted-foreground mt-1">
                                Application: Sample App
                              </p>
                            </div>
                          ),
                        )}

                      </div>
                    </div>
                  )}

                </CardContent>
              </Card>
            );
          })}

        </div>
      ) : (
        <PageEmptyState
          icon={<Users className="h-8 w-8 text-primary" />}
          title="No Roles Found"
          message="No roles match your current filters."
        />
      )}

      <ConfirmDialog
        isOpen={isOpen}
        options={options}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
};