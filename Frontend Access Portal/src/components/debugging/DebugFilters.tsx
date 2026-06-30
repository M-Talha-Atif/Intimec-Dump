"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Upload } from "lucide-react";
import clsx from "clsx";
import { FilterOptionGroup } from "@/types/filters";
import { useDebugging } from "@/contexts/debugging-context";
import SearchBarWithParams from "@/components/common/SearchBarWithParams";
import FiltersWithParams from "@/components/common/FiltersWithParams";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Card, CardHeader } from "@/components/ui/card";

const filters: FilterOptionGroup[] = [
  {
    title: "Time Range",
    type: "radio",
    key: "timeRange",
    defaultValue: "15m",
    options: [
      { label: "All time", value: "" },
      { label: "Last 15 minutes", value: "15m" },
      { label: "Last hour", value: "1h" },
      { label: "Last 4 hours", value: "4h" },
      { label: "Last 24 hours", value: "24h" },
      { label: "Last 7 days", value: "7d" },
    ],
  },
  {
    title: "Event Type",
    type: "checkbox",
    key: "level",
    defaultValue: "all",
    options: [
      { label: "ERROR", value: "ERROR" },
      { label: "WARN", value: "WARN" },
      { label: "INFO", value: "INFO" },
      { label: "DEBUG", value: "DEBUG" },
      { label: "TRACE", value: "TRACE" },
    ],
  },
  {
    title: "Source",
    type: "checkbox",
    key: "source",
    defaultValue: "all",
    options: [
      { label: "SAP Connector", value: "SAP Connector" },
      { label: "Role Engine", value: "Role Engine" },
      { label: "AI Engine", value: "AI Engine" },
      { label: "Workflow Engine", value: "Workflow Engine" },
      { label: "Access Portal", value: "Access Portal" },
    ],
  },
  {
    title: "Object Type",
    type: "checkbox",
    key: "objectType",
    defaultValue: "all",
    options: [
      { label: "User", value: "user" },
      { label: "Entitlement", value: "entitlement" },
    ],
  },
];

export const DebugFilters = () => {
  const {
    exportLogsAsJson,
    loading: isLoading,
    refreshLogs,
    searchQuery,
    setSearchQuery,
  } = useDebugging();

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    const hasTimeRangeParam = searchParams.has("filter_timeRange");

    if (!hasTimeRangeParam) {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.set("filter_timeRange", "15m");
      router.replace(`${pathname}?${newSearchParams.toString()}`);
    }
  }, [searchParams, router, pathname]);

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">

        {/* Title Row */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Logs</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Search and filter debugging logs
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={isLoading}
              onClick={refreshLogs}
            >
              <RefreshCw
                className={clsx("w-4 h-4 mr-2", isLoading && "animate-spin")}
              />
              Refresh
            </Button>

            <Button variant="outline" size="sm" onClick={exportLogsAsJson}>
              <Upload className="w-4 h-4 mr-2" />
              Export Logs
            </Button>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3 pt-3">

          <div className="flex-1 min-w-[260px]">
            <SearchBarWithParams
              searchPlaceholder="Search logs by message, user, application, or correlation ID..."
              resetPageOnChange
              contextSearchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <FiltersWithParams
              filters={filters}
              isLoading={false}
              resetPageOnChange
            />
          </div>

        </div>

      </CardHeader>
    </Card>
  );
};