"use client";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSchemaManagement } from "@/contexts/schema-management-context";
import { Skeleton } from "@/components/ui/skeleton";

export const SchemaStatsCards = () => {
  const { state } = useSchemaManagement();

  // Create stats array from tenant statistics stored in context
  const createStatsFromTenantData = () => {
    if (!state.tenantStatistics) return state.stats; // Fallback to existing stats

    return [
      {
        label: "Total Identities",
        value: (state.tenantStatistics.totalCount || 0).toString(),
        color: "text-blue-600",
      },
      {
        label: "Active Identities",
        value: (state.tenantStatistics.activeCount || 0).toString(),
        color: "text-green-600",
      },
      {
        label: "Inactive Identities",
        value: (state.tenantStatistics.inactiveIdentities || 0).toString(),
        color: "text-yellow-600",
      },
      {
        label: "Suspended Identities",
        value: (state.tenantStatistics.suspendedCount || 0).toString(),
        color: "text-orange-600",
      },
      {
        label: "Terminated Identities",
        value: (state.tenantStatistics.terminatedCount || 0).toString(),
        color: "text-red-600",
      },
      {
        label: "Pending Identities",
        value: (state.tenantStatistics.pendingCount || 0).toString(),
        color: "text-purple-600",
      },
      {
        label: "Expired Identities",
        value: (state.tenantStatistics.expiredCount || 0).toString(),
        color: "text-pink-600",
      },
      {
        label: "Archived Identities",
        value: (state.tenantStatistics.archivedCount || 0).toString(),
        color: "text-gray-600",
      },
      {
        label: "Extended Attributes",
        value: (state.tenantStatistics.extendedAttributesCount || 0).toString(),
        color: "text-indigo-600",
      },
    ];
  };

  if (state.loadingStates.entities || state.loadingStates.tenantStatistics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {[...Array(9)].map((_, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-6 w-12" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Show empty state when no entities are available or when there's a stats error
  if (state.entityTypes.length === 0 || state.errors.tenantStatistics) {
    const emptyStats = [
      {
        label: "Total Identities",
        value: "0",
        color: "text-muted-foreground",
      },
      {
        label: "Active Identities",
        value: "0",
        color: "text-muted-foreground",
      },
      {
        label: "Inactive Identities",
        value: "0",
        color: "text-muted-foreground",
      },
      {
        label: "Suspended Identities",
        value: "0",
        color: "text-muted-foreground",
      },
      {
        label: "Terminated Identities",
        value: "0",
        color: "text-muted-foreground",
      },
      {
        label: "Pending Identities",
        value: "0",
        color: "text-muted-foreground",
      },
      {
        label: "Expired Identities",
        value: "0",
        color: "text-muted-foreground",
      },
      {
        label: "Archived Identities",
        value: "0",
        color: "text-muted-foreground",
      },
      {
        label: "Extended Attributes",
        value: "0",
        color: "text-muted-foreground",
      },
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {emptyStats.map((stat, index) => (
          <Card key={index} className="opacity-60">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold text-muted-foreground">
                    {stat.value}
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className="text-muted-foreground bg-muted"
                >
                  ±0
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Show actual stats when entities are available
  const currentStats = createStatsFromTenantData();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
      {currentStats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">
                  {stat.value}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
