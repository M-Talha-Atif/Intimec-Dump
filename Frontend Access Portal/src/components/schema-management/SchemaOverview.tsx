import React, { useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  User,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import { useSchemaManagement } from "@/contexts/schema-management-context";
import { SchemaStatisticsResponse } from "@/types/schema-mangement";
import { Loader } from "../ui/Loader";

// Module-level cache for statistics to persist across tab switches
const statisticsCache = new Map<string, SchemaStatisticsResponse>();

// Export function to clear cache when needed (e.g., after schema changes)
export const clearStatisticsCache = (entityType?: string) => {
  if (entityType) {
    statisticsCache.delete(entityType);
  } else {
    statisticsCache.clear();
  }
};

interface SchemaOverviewProps {
  entityType: string;
}

export const SchemaOverview = ({ entityType }: SchemaOverviewProps) => {
  const {
    state,
    getEntityStatistics,
    getDetailedRecentChanges,
    getEntityDisplayName,
    getCurrentEntityData,
  } = useSchemaManagement();

  console.log("SchemaOverview mounted for entity:", entityType);

  // Generate cache key for current entity
  const cacheKey = entityType || "default";

  // Get cached statistics from module-level cache
  const cachedStatistics = statisticsCache.get(cacheKey);

  // Load statistics for the current entity only if not cached
  const loadStatistics = useCallback(async () => {
    if (!entityType) return;

    // Check if we have cached statistics and are not already loading
    if (cachedStatistics && !state.loadingStates.entityStatistics) {
      return;
    }

    try {
      const data = await getEntityStatistics(entityType);
      // Cache the statistics at module level for persistence across tab switches
      if (data) {
        statisticsCache.set(cacheKey, data);
      }
    } catch (error) {
      console.error("Failed to load entity statistics:", error);
      // Error is already handled in the context and stored in state.error.entityStatistics
    }
  }, [
    entityType,
    getEntityStatistics,
    cachedStatistics,
    state.loadingStates.entityStatistics,
    cacheKey,
  ]);

  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  // Clear cache when entity type changes to ensure fresh data
  useEffect(() => {
    if (entityType) {
      clearStatisticsCache();
    }
  }, [entityType]);

  // Get local entity data for real-time updates
  const localEntityData = getCurrentEntityData();

  // Use cached statistics from module-level cache first, then check if we can get from context state
  const statistics = cachedStatistics || null;

  // Map API response to metrics format, but prefer local data when available for real-time updates
  const metrics = statistics
    ? {
        totalAttributes:
          localEntityData?.overviewMetrics?.totalAttributes ?? statistics.totalAttributes ?? 12,
        coverage: statistics.schemaCoverage ?? 85,
        requiredFields:
          localEntityData?.overviewMetrics?.requiredFields ??
          statistics.requiredFields ?? 5,
        issues: statistics.highRiskFields ?? 0,
        sensitiveFields:
          localEntityData?.overviewMetrics?.sensitiveFields ?? statistics.sensitiveFields ?? 2,
        customFields:
          localEntityData?.overviewMetrics?.customFields ??
          statistics.customFields ?? 3,
        lastSync: statistics.lastSync || new Date().toISOString().split("T")[0],
      }
    : localEntityData?.overviewMetrics
    ? {
        totalAttributes: localEntityData?.overviewMetrics?.totalAttributes || 12,
        coverage: localEntityData.overviewMetrics.coverage || 85,
        requiredFields: localEntityData.overviewMetrics.requiredFields || 5,
        issues: 0,
        sensitiveFields: localEntityData?.overviewMetrics?.sensitiveFields || 2,
        customFields: localEntityData.overviewMetrics.customFields || 3,
        lastSync: new Date().toISOString().split("T")[0],
      }
    : {
        totalAttributes: 12, // Default values when no data available
        coverage: 85,
        requiredFields: 5,
        issues: 0,
        sensitiveFields: 2,
        customFields: 3,
        lastSync: new Date().toISOString().split("T")[0],
      };

  const recentChanges = getDetailedRecentChanges(entityType);

  // Show loading state
  if (state.loadingStates.entityStatistics) return <Loader />;

  // Show error state
  if (state.errors.entityStatistics) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-md">
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          Error Loading Statistics
        </h3>
        <p className="text-red-700 mb-4">{state.errors.entityStatistics}</p>
        <button
          onClick={loadStatistics}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case "create":
        return <Plus className="h-3 w-3 text-green-600" />;
      case "update":
        return <Edit className="h-3 w-3 text-blue-600" />;
      case "delete":
        return <Trash2 className="h-3 w-3 text-red-600" />;
      default:
        return <Edit className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getActionBadge = (action: string) => {
    const variant =
      action === "Added"
        ? "default"
        : action === "Modified"
        ? "secondary"
        : "destructive";
    return <Badge variant={variant}>{action}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Schema Overview</h2>
          <p className="text-muted-foreground mt-1">
            Statistics for {getEntityDisplayName(entityType)}
          </p>
        </div>
      </div>

      {/* Schema Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Attributes</p>
                <p className="text-2xl font-bold text-foreground">
                  {metrics.totalAttributes}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Schema Coverage</p>
                <p className="text-2xl font-bold text-foreground">
                  {metrics.coverage}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Required Fields</p>
                <p className="text-2xl font-bold text-foreground">
                  {metrics.requiredFields}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Issues</p>
                <p className="text-2xl font-bold text-foreground">
                  {metrics.issues}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Schema Information */}
      <Card>
        <CardHeader>
          <CardTitle>
            Schema Information -{" "}
            {statistics?.schemaName || getEntityDisplayName(entityType)}
          </CardTitle>
          <CardDescription>
            Current schema status and configuration details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-slate-800 mb-2">
                  Field Distribution
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">
                      Required Fields
                    </span>
                    <Badge variant="outline">{metrics.requiredFields}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">
                      Sensitive Fields
                    </span>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      {metrics.sensitiveFields}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Custom Fields
                    </span>
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                      {metrics.customFields}
                    </Badge>
                  </div>
                  {statistics && statistics.syncedFields !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">
                        Synced Fields
                      </span>
                      <Badge className="bg-purple-100 text-purple-800">
                        {statistics.syncedFields}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>
     
          </div>
        </CardContent>
      </Card>

      {/* Recent Schema Changes */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Schema Changes</CardTitle>
          <CardDescription>
            Latest modifications to the{" "}
            {getEntityDisplayName(entityType).toLowerCase()} schema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Field</TableHead>
                  <TableHead>Performed By</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentChanges.map((change) => (
                  <TableRow key={change.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getActionIcon(change.type)}
                        {getActionBadge(change.action)}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {change.field}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3 text-slate-400" />
                        <span className="text-sm">{change.actor}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {formatDate(change.timestamp)}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600 max-w-xs truncate">
                      {change.description}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
