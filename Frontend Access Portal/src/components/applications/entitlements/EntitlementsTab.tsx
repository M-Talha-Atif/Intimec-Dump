"use client";

import React, { useEffect, useState } from "react";
import {
  StickyTable,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Download,
  RefreshCw,
  Scale,
  ShieldAlert,
  Archive,
  Tag,
  AlertTriangle,
  ShieldOff,
} from "lucide-react";
import { EntitlementComparisonDialog } from "./EntitlementComparisonDialog";
import EntitlementRow from "./EntitlementRow";
import EntitlementDetailPanel from "./EntitlementDetailPanel";
import CustomPagination from "@/components/applications/common/CustomPagination";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import useEntitlements from "@/hooks/applications/useEntitlements";
import SekeletonRow from "@/components/applications/common/SkeletonRow";
import { EntitlementWithUsersMeta } from "@/components/applications/types";
import { useSearchParams } from "next/navigation";
import useEntitlementsFilters from "@/hooks/applications/useEntitlementsFilters";
import SearchBarWithParams from "@/components/common/SearchBarWithParams";
import FiltersWithParams from "@/components/common/FiltersWithParams";
import clsx from "clsx";

export default function ApplicationEntitlementsTab({
  appid,
}: {
  appid: string;
}) {
  const [selectedItems, setSelectedItems] = useState<
    EntitlementWithUsersMeta[]
  >([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [selectedEntitlement, setSelectedEntitlement] =
    useState<EntitlementWithUsersMeta | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const searchParams = useSearchParams();
  const pageSize = parseInt(searchParams.get("size") || "10", 10);

  useEffect(() => {
    setIsPanelOpen(!!selectedEntitlement);
  }, [selectedEntitlement]);

  const { filters, isLoading: isLoadingFilters } =
    useEntitlementsFilters(appid);

  const {
    data: entitlements = [],
    isLoading,
    pagination,
    error,
    refresh,
  } = useEntitlements(appid);

  const handleSelectItem = (
    item: EntitlementWithUsersMeta,
    checked: boolean
  ) => {
    setSelectedItems((prev) =>
      checked ? [...prev, item] : prev.filter((i) => i.id !== item.id)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(entitlements);
    } else {
      setSelectedItems([]);
    }
  };

  const handleEntitlementClick = (entitlement: EntitlementWithUsersMeta) => {
    if (selectedEntitlement?.id === entitlement.id) {
      setSelectedEntitlement(null);
    } else {
      setSelectedEntitlement(entitlement);
    }
  };

  const toggleFilter = (filter: string) => {
    setActiveFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    );
  };

  const highRiskCount = entitlements.filter(
    (e) => e.riskLevel === "High"
  ).length;
  const deprecatedCount = entitlements.filter(
    (e) => e.lifecycle === "Deprecated"
  ).length;
  const unclassifiedCount = entitlements.filter(
    (e) => !e.classification || e.classification.length === 0
  ).length;
  const orphanCount = entitlements.filter(
    (e) => e.lifecycle === "Orphaned"
  ).length;
  const unownedCount = entitlements.filter(
    (e) => !e.owner
  ).length;

  // Apply client-side quick filters
  const filteredEntitlements = entitlements.filter((e) => {
    if (activeFilters.length === 0) return true;
    return activeFilters.every((filter) => {
      if (filter === "highRisk") return e.riskLevel === "High";
      if (filter === "deprecated") return e.lifecycle === "Deprecated";
      if (filter === "unclassified")
        return !e.classification || e.classification.length === 0;
      if (filter === "orphan") return e.lifecycle === "Orphaned";
      if (filter === "noCertification")
        return !e.reviewHistory || e.reviewHistory.length === 0;
      return true;
    });
  });

  return (
    <div className="flex flex-col h-full">
      <div className="h-full p-4 flex flex-col gap-4 overflow-hidden">
        {/* Summary bar */}
        <div className="flex items-center gap-4 py-2 px-3 bg-muted/40 rounded-lg border text-xs">
          <span className="font-medium text-foreground">Summary:</span>
          <span>
            <strong>{pagination?.totalElements ?? entitlements.length}</strong>{" "}
            Total
          </span>
          <span className="text-red-700">
            <strong>{highRiskCount}</strong> High Risk
          </span>
          <span className="text-red-600">
            <strong>{unownedCount}</strong> Unowned
          </span>
          <span className="text-muted-foreground">
            <strong>{deprecatedCount}</strong> Deprecated
          </span>
          <span className="text-muted-foreground">
            <strong>{unclassifiedCount}</strong> Unclassified
          </span>
          <span className="text-amber-700">
            <strong>{orphanCount}</strong> Orphan
          </span>
        </div>

        <div className="flex flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <SearchBarWithParams
              searchPlaceholder="Search by display name..."
              resetPageOnChange
              className="w-56 shrink-0"
            />
            <Button
              variant={
                activeFilters.includes("highRisk") ? "secondary" : "outline"
              }
              size="sm"
              className="shrink-0"
              onClick={() => toggleFilter("highRisk")}
            >
              <ShieldAlert className="mr-1.5 h-3.5 w-3.5" /> High Risk
            </Button>
            <Button
              variant={
                activeFilters.includes("deprecated") ? "secondary" : "outline"
              }
              size="sm"
              className="shrink-0"
              onClick={() => toggleFilter("deprecated")}
            >
              <Archive className="mr-1.5 h-3.5 w-3.5" /> Deprecated
            </Button>
            <Button
              variant={
                activeFilters.includes("unclassified")
                  ? "secondary"
                  : "outline"
              }
              size="sm"
              className="shrink-0"
              onClick={() => toggleFilter("unclassified")}
            >
              <Tag className="mr-1.5 h-3.5 w-3.5" /> Unclassified
            </Button>
            <Button
              variant={
                activeFilters.includes("orphan") ? "secondary" : "outline"
              }
              size="sm"
              className="shrink-0"
              onClick={() => toggleFilter("orphan")}
            >
              <AlertTriangle className="mr-1.5 h-3.5 w-3.5" /> Orphan
            </Button>
            <Button
              variant={
                activeFilters.includes("noCertification")
                  ? "secondary"
                  : "outline"
              }
              size="sm"
              className="shrink-0"
              onClick={() => toggleFilter("noCertification")}
            >
              <ShieldOff className="mr-1.5 h-3.5 w-3.5" /> No Certification
            </Button>
          </div>
          <div className="flex flex-row items-center gap-2">
            <FiltersWithParams filters={filters} isLoading={isLoadingFilters} />
            <Button
              variant="outline"
              size="sm"
              disabled={isLoading}
              onClick={refresh}
            >
              <RefreshCw
                className={clsx("w-4 h-4 mr-2", isLoading && "animate-spin")}
              />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={selectedItems.length < 2}
              onClick={() => setIsCompareOpen(true)}
            >
              <Scale className="mr-2 h-4 w-4" />
              Compare ({selectedItems.length})
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
        <ScrollArea className="max-h-full overflow-hidden border-1 rounded-md">
          <StickyTable>
            <TableHeader className="sticky top-0 z-10">
              <TableRow>
                <TableHead className="w-10">
                  <div className="flex items-center justify-center">
                    <Checkbox
                      checked={
                        selectedItems.length === entitlements.length &&
                        entitlements.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all"
                    />
                  </div>
                </TableHead>
                <TableHead>Display Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>Classification</TableHead>
                <TableHead>Requestable</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead className="text-center">Users</TableHead>
                <TableHead className="w-10">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading &&
                [...Array(pageSize)].map((_, index) => (
                  <SekeletonRow key={index} cols={9} />
                ))}

              {!!error && !isLoading && (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center h-24 max-h-full text-destructive"
                  >
                    Error loading entitlements. Please try again later.
                  </TableCell>
                </TableRow>
              )}

              {!error &&
                !isLoading &&
                filteredEntitlements.map((entitlement) => (
                  <EntitlementRow
                    key={entitlement.id}
                    item={entitlement}
                    isSelected={selectedItems.some(
                      (s) => s.id === entitlement.id
                    )}
                    isActive={selectedEntitlement?.id === entitlement.id}
                    onSelect={(checked) =>
                      handleSelectItem(entitlement, !!checked)
                    }
                    onEntitlementClick={handleEntitlementClick}
                  />
                ))}

              {!error &&
                !isLoading &&
                filteredEntitlements.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center h-24 max-h-full text-muted-foreground"
                    >
                      No entitlements found.
                    </TableCell>
                  </TableRow>
                )}
            </TableBody>
          </StickyTable>
        </ScrollArea>
        <EntitlementComparisonDialog
          isOpen={isCompareOpen}
          onOpenChange={setIsCompareOpen}
          entitlements={selectedItems}
        />
      </div>
      <CustomPagination
        totalPages={pagination?.totalPages}
        totalElements={pagination?.totalElements}
        defaultSize={10}
      />

      {isPanelOpen && selectedEntitlement && (
        <EntitlementDetailPanel
          entitlement={selectedEntitlement}
          appId={appid}
          onClose={() => setSelectedEntitlement(null)}
        />
      )}
    </div>
  );
}
