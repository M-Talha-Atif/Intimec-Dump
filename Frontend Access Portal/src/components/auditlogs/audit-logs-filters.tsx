"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/ui/multi-select";
import { useAuditLogsContext } from "@/contexts/audit-logs-context";
import { Search, Filter, X, Calendar } from "lucide-react";
import { getEventIcon } from "./audit-log-utils";

export function AuditLogsFilters() {
  const {
    searchTerm,
    setSearchTerm,
    pendingSearchTerm,
    setPendingSearchTerm,
    commitSearch,
    selectedEventTypes,
    setSelectedEventTypes,
    selectedObjectTypes,
    setSelectedObjectTypes,
    selectedRiskLevels,
    setSelectedRiskLevels,
    selectedStatuses,
    setSelectedStatuses,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    totalLogs,
    loading,
    availableEvents,
    availableObjectTypes,
    availableRisks,
    availableStatuses,
  } = useAuditLogsContext();

  // Helper function to convert event name to title case
  const toTitleCase = (str: string) => {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Search & Filter Audit Events
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            {/* Replace the entire relative div wrapping the search Input */}
            <div className="relative flex items-center">
              <button
                onClick={() => commitSearch()}
                className="absolute left-3 text-muted-foreground hover:text-foreground transition-colors"
                type="button"
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
              </button>
              <Input
                placeholder="Search events, actors, objects..."
                value={pendingSearchTerm}
                onChange={(e) => setPendingSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitSearch();
                }}
                className="pl-10 pr-10"
              />
              {pendingSearchTerm && (
                <button
                  onClick={() => {
                    setPendingSearchTerm("");
                    commitSearch("");
                  }}
                  className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors"
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <MultiSelect
                options={availableEvents.map((event) => ({
                  value: event,
                  label: toTitleCase(event),
                  icon: getEventIcon(event),
                }))}
                selected={selectedEventTypes}
                onChange={setSelectedEventTypes}
                placeholder="Event Types"
                className="w-52"
              />
              {selectedEventTypes.length > 0 && (
                <button
                  onClick={() => setSelectedEventTypes([])}
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 flex items-center justify-center text-xs transition-colors z-10"
                  type="button"
                  title="Clear selection"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            <div className="relative">
              <MultiSelect
                options={availableObjectTypes.map((objectType) => ({
                  value: objectType,
                  label: objectType.charAt(0).toUpperCase() + objectType.slice(1),
                }))}
                selected={selectedObjectTypes}
                onChange={setSelectedObjectTypes}
                placeholder="Object Types"
                className="w-52"
              />
              {selectedObjectTypes.length > 0 && (
                <button
                  onClick={() => setSelectedObjectTypes([])}
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 flex items-center justify-center text-xs transition-colors z-10"
                  type="button"
                  title="Clear selection"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            <div className="relative">
              <MultiSelect
                options={availableRisks.map((risk) => ({
                  value: risk,
                  label: risk.charAt(0).toUpperCase() + risk.slice(1),
                }))}
                selected={selectedRiskLevels}
                onChange={setSelectedRiskLevels}
                placeholder="Risk Levels"
                className="w-44"
              />
              {selectedRiskLevels.length > 0 && (
                <button
                  onClick={() => setSelectedRiskLevels([])}
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 flex items-center justify-center text-xs transition-colors z-10"
                  type="button"
                  title="Clear selection"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            <div className="relative">
              <MultiSelect
                options={availableStatuses.map((status) => ({
                  value: status,
                  label: status.charAt(0).toUpperCase() + status.slice(1),
                }))}
                selected={selectedStatuses}
                onChange={setSelectedStatuses}
                placeholder="Statuses"
                className="w-44"
              />
              {selectedStatuses.length > 0 && (
                <button
                  onClick={() => setSelectedStatuses([])}
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 flex items-center justify-center text-xs transition-colors z-10"
                  type="button"
                  title="Clear selection"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="dateFrom" className="text-sm font-medium">
              From:
            </Label>
            <div className="relative">
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-40"
              />
              {dateFrom && (
                <button
                  onClick={() => setDateFrom("")}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  type="button"
                  title="Clear date"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="dateTo" className="text-sm font-medium">
              To:
            </Label>
            <div className="relative">
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-40"
              />
              {dateTo && (
                <button
                  onClick={() => setDateTo("")}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  type="button"
                  title="Clear date"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
          {(dateFrom || dateTo) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setDateFrom("");
                setDateTo("");
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Clear Dates
            </Button>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
          <span>Found {loading ? "..." : totalLogs} audit events</span>
        </div>
      </CardContent>
    </Card>
  );
}
