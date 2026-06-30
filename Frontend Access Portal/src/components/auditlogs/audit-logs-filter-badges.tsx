"use client";

import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useAuditLogsContext } from "@/contexts/audit-logs-context";

export function AuditLogsFilterBadges() {
  const {
    selectedEventTypes,
    setSelectedEventTypes,
    selectedObjectTypes,
    setSelectedObjectTypes,
    selectedRiskLevels,
    setSelectedRiskLevels,
    selectedStatuses,
    setSelectedStatuses,
  } = useAuditLogsContext();

  const removeEventType = (event: string) => {
    setSelectedEventTypes(selectedEventTypes.filter((e) => e !== event));
  };

  const removeObjectType = (objectType: string) => {
    setSelectedObjectTypes(
      selectedObjectTypes.filter((o) => o !== objectType)
    );
  };

  const removeRiskLevel = (risk: string) => {
    setSelectedRiskLevels(selectedRiskLevels.filter((r) => r !== risk));
  };

  const removeStatus = (status: string) => {
    setSelectedStatuses(selectedStatuses.filter((s) => s !== status));
  };

  const clearAllFilters = () => {
    setSelectedEventTypes([]);
    setSelectedObjectTypes([]);
    setSelectedRiskLevels([]);
    setSelectedStatuses([]);
  };

  const hasFilters =
    selectedEventTypes.length > 0 ||
    selectedObjectTypes.length > 0 ||
    selectedRiskLevels.length > 0 ||
    selectedStatuses.length > 0;

  if (!hasFilters) {
    return null;
  }

  const toTitleCase = (str: string) => {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  return (
    <div className="flex flex-wrap items-center gap-2 p-4 bg-muted/30 rounded-md">
      <span className="text-sm font-medium text-muted-foreground">
        Active Filters:
      </span>

      {selectedEventTypes.map((event) => (
        <Badge
          key={`event-${event}`}
          variant="secondary"
          className="gap-1 pr-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
        >
          <span className="text-xs">Event:</span> {toTitleCase(event)}
          <X
            className="h-3 w-3 cursor-pointer hover:text-destructive"
            onClick={() => removeEventType(event)}
          />
        </Badge>
      ))}

      {selectedObjectTypes.map((objectType) => (
        <Badge
          key={`object-${objectType}`}
          variant="secondary"
          className="gap-1 pr-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
        >
          <span className="text-xs">Object:</span> {toTitleCase(objectType)}
          <X
            className="h-3 w-3 cursor-pointer hover:text-destructive"
            onClick={() => removeObjectType(objectType)}
          />
        </Badge>
      ))}

      {selectedRiskLevels.map((risk) => {
        const riskColors = {
          low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
          medium:
            "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
          high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
          critical:
            "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        };
        const colorClass =
          riskColors[risk.toLowerCase() as keyof typeof riskColors] ||
          "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";

        return (
          <Badge
            key={`risk-${risk}`}
            variant="secondary"
            className={`gap-1 pr-1 ${colorClass}`}
          >
            <span className="text-xs">Risk:</span> {toTitleCase(risk)}
            <X
              className="h-3 w-3 cursor-pointer hover:text-destructive"
              onClick={() => removeRiskLevel(risk)}
            />
          </Badge>
        );
      })}

      {selectedStatuses.map((status) => {
        const statusColors = {
          success:
            "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
          failure:
            "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
          pending:
            "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
        };
        const colorClass =
          statusColors[status.toLowerCase() as keyof typeof statusColors] ||
          "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";

        return (
          <Badge
            key={`status-${status}`}
            variant="secondary"
            className={`gap-1 pr-1 ${colorClass}`}
          >
            <span className="text-xs">Status:</span> {toTitleCase(status)}
            <X
              className="h-3 w-3 cursor-pointer hover:text-destructive"
              onClick={() => removeStatus(status)}
            />
          </Badge>
        );
      })}

      {hasFilters && (
        <button
          onClick={clearAllFilters}
          className="text-xs text-muted-foreground hover:text-foreground underline ml-2"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
