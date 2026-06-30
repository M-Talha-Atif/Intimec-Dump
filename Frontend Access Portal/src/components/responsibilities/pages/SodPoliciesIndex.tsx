"use client";

import { useState } from "react";
// import { useOutletContext } from "react-router-dom";
import { useResponsibilitiesContext } from "./context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Play,
  FileText,
  UserCog,
  Download,
} from "lucide-react";
import { format } from "date-fns";
import { useSodPolicies } from "./hooks/useSodPolicies";
import { StatsCard, PageEmptyState } from "./components";
import PageHeader from '@/components/shared/PageHeader';
import { getComplianceColor, getSeverityBadgeClass } from "../utils";

export const SodPoliciesIndex = () => {
  const { globalSearch } = useResponsibilitiesContext();
  const [expandedPolicies, setExpandedPolicies] = useState<Set<string>>(
    new Set(),
  );

  const { filteredPolicies, isLoading } = useSodPolicies(globalSearch);

  const toggleExpanded = (policyId: string) => {
    const newExpanded = new Set(expandedPolicies);
    if (newExpanded.has(policyId)) {
      newExpanded.delete(policyId);
    } else {
      newExpanded.add(policyId);
    }
    setExpandedPolicies(newExpanded);
  };

  return (
    <div className="space-y-6  p-4 sm:lg-6 lg:p-8">
      <PageHeader
        title="SoD Policies"
        description="Segregation of Duties policies you own and manage"
        icon={<ShieldAlert className="h-6 w-6 text-primary" />}
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>

            <Button size="sm" className="gap-2">
              <ShieldAlert className="h-4 w-4" />
              What-If Simulator
            </Button>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          label="Total Policies"
          value={filteredPolicies?.length || 0}
          icon={<ShieldAlert className="h-6 w-6 text-primary" />}
        />
        <StatsCard
          label="Active Violations"
          value={
            filteredPolicies?.reduce((sum, p) => sum + p.violationCount, 0) ||
            0
          }
          icon={<AlertTriangle className="h-6 w-6 text-destructive" />}
          iconContainerClassName="bg-destructive/10"
        />
        <StatsCard
          label="Compliant"
          value={
            filteredPolicies?.filter(
              (p) => p.complianceStatus === "compliant",
            ).length || 0
          }
          icon={<CheckCircle className="h-6 w-6 text-green-500" />}
          iconContainerClassName="bg-green-500/10"
        />
      </div>

      {/* Policies List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : filteredPolicies && filteredPolicies.length > 0 ? (
        <div className="space-y-4">
          {filteredPolicies.map((policy) => {
            const isExpanded = expandedPolicies.has(policy.id);

            return (
              <Card
                key={policy.id}
                className="transition hover:shadow-sm"
              >
                <CardContent className="p-5 space-y-4">

                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">

                    {/* Left Section */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground"
                        onClick={() => toggleExpanded(policy.id)}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>

                      <div className="flex-1 space-y-2">

                        {/* Title + Badges */}
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-semibold">
                            {policy.name}
                          </h3>

                          <Badge variant={getComplianceColor(policy.complianceStatus)}>
                            {policy.complianceStatus.replace("_", " ")}
                          </Badge>
                          <Badge className={getSeverityBadgeClass(policy.severity)}>
                            {policy.severity}
                          </Badge>
                        </div>

                        {/* Metadata */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">

                          <span className="flex items-center gap-1">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            {policy.violationCount} violations
                          </span>

                          <span>
                            {policy.affectedRoles} affected roles
                          </span>

                          <span>
                            Last review{" "}
                            {format(new Date(policy.lastReview), "MMM dd, yyyy")}
                          </span>

                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">

                      <Button size="sm" variant="outline" className="gap-2">
                        <Play className="h-4 w-4" />
                        Run Scan
                      </Button>

                      <Button size="sm" variant="outline" className="gap-2">
                        <FileText className="h-4 w-4" />
                        Report
                      </Button>

                      <Button size="sm" variant="outline" className="gap-2">
                        <UserCog className="h-4 w-4" />
                        Assign
                      </Button>

                    </div>
                  </div>

                  {/* Expanded Violations */}
                  {isExpanded && (
                    <div className="pt-4">

                      {policy.violationCount > 0 ? (
                        <>
                          <h4 className="text-sm font-medium mb-3">
                            Active Violations
                          </h4>

                          <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(320px,1fr))]">

                            {Array.from({
                              length: Math.min(policy.violationCount, 3),
                            }).map((_, idx) => (
                              <div
                                key={idx}
                                className="rounded-md border bg-destructive/5 p-4"
                              >
                                <div className="flex items-start justify-between gap-3">

                                  <div>
                                    <p className="text-sm font-medium">
                                      User {idx + 1}
                                    </p>

                                    <p className="text-xs text-muted-foreground mt-1">
                                      Conflicting roles detected
                                    </p>
                                  </div>

                                  <Badge variant="destructive" className="text-xs">
                                    High Risk
                                  </Badge>

                                </div>

                                <div className="flex flex-wrap gap-2 mt-3">
                                  <Badge variant="outline" className="text-xs">
                                    Finance Approver
                                  </Badge>

                                  <Badge variant="outline" className="text-xs">
                                    Finance Processor
                                  </Badge>
                                </div>

                                <Button
                                  variant="link"
                                  size="sm"
                                  className="mt-2 h-auto p-0 text-xs"
                                >
                                  View Lineage Graph →
                                </Button>
                              </div>
                            ))}

                          </div>
                        </>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          No violations detected
                        </div>
                      )}

                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <PageEmptyState
          icon={<ShieldAlert className="h-8 w-8 text-primary" />}
          title="No SoD Policies Found"
          message="No policies match your search."
        />
      )}
    </div>
  );
};
