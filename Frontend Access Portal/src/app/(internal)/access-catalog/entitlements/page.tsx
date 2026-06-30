"use client";

import Link from "next/link";
import PageHeader from "@/components/shared/PageHeader";
import {
  Search,
  Upload,
  Download,
  Plus,
  Filter,
  BarChart3,
  FolderTree,
  Activity,
  Users,
  Shield,
  ClipboardCheck,
  BookOpen,
  Play,
  Clock,
  ChevronDown,
  Zap,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import EntitlementsTable from "@/components/entitlements/EntitlementsTable";
import EntitlementsFilterPanel, {
  Filters,
  emptyFilters,
} from "@/components/entitlements/EntitlementsFilterPanel";
import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { SortConfig } from "@/components/entitlements/EntitlementsTable";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import EntitlementDetailView from "@/components/entitlements/EntitlementDetailView";
import EntitlementIntelligence from "@/components/entitlements/analytics/EntitlementIntelligence";
import EntitlementSprawlUsage from "@/components/entitlements/analytics/EntitlementSprawlUsage";
import EntitlementOwnershipClassification from "@/components/entitlements/analytics/EntitlementOwnershipClassification";
import EntitlementRiskCompliance from "@/components/entitlements/analytics/EntitlementRiskCompliance";
import EntitlementReviewsAnalytics from "@/components/entitlements/analytics/EntitlementReviewsAnalytics";
import AddEntitlementWizard from "@/components/entitlements/wizards/AddEntitlementWizard";
import ImportExportDialog from "@/components/shared/ImportExportDialog";
import ScheduleConfigDialog from "@/components/entitlements/ScheduleConfigDialog";
import StandardTabs from "@/components/shared/StandardTabs";
import IconTabs from "@/components/shared/IconTabs";
import { useEntitlements } from "@/hooks/useEntitlements";
import { useEvaluateAll } from "@/hooks/useEvaluateAll";
import type { EntitlementResponseDto } from "@/types/entitlements";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw, Loader2 } from "lucide-react";

const ENTITLEMENT_TEMPLATE_FIELDS = [
  "displayName",
  "resourceName",
  "objectClass",
  "kind",
  "description",
  "lifecycle",
  "riskLevel",
  "requestable",
  "privilegeLevel",
];

const SORT_KEY_MAP: Record<string, string> = {
  lastUsedAt: "updatedAt",
};

function toSpringSort(config: SortConfig): string {
  const dir = config.direction === "ascending" ? "asc" : "desc";
  const mappedKey = SORT_KEY_MAP[config.key] ?? config.key;
  return `${mappedKey},${dir}`;
}

function TableSkeleton() {
  return (
    <div className="border rounded-lg bg-white shadow-sm p-4 space-y-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full rounded" />
      ))}
    </div>
  );
}

export default function Page() {
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>(emptyFilters());
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "displayName",
    direction: "ascending",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEntitlement, setSelectedEntitlement] =
    useState<EntitlementResponseDto | null>(null);
  const [activeTab, setActiveTab] = useState("analytics");
  const [analyticsSubTab, setAnalyticsSubTab] = useState("intelligence");
  const [isAddWizardOpen, setIsAddWizardOpen] = useState(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [clientSortConfig, setClientSortConfig] = useState<SortConfig | null>(
    null
  );
  const CLIENT_SIDE_SORT_KEYS = new Set(["resourceName", "assignedUsersCount"]);

  const {
    entitlements,
    totalElements,
    totalPages,
    currentPage,
    pageSize,
    loading,
    error,
    goToPage,
    changePageSize,
    changeSort,
    setFilters: setEntitlementFilters,
    replaceFilters: replaceEntitlementFilters,
    refresh,
  } = useEntitlements({
    initialSize: 10,
    initialSort: toSpringSort(sortConfig),
  });

  // Debounced search: waits 400ms after user stops typing, then sends
  // the search term to the backend. Preserves any existing filter params.
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    searchTimerRef.current = setTimeout(() => {
      // Rebuild the full backend filter state so search does not wipe out
      // active filters, and filters do not wipe out search.
      handleFilterApply(filters);
    }, 400);

    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, [searchQuery]);

  /**
   * Translates UI filter panel state into backend query parameters
   * and pushes them to the useEntitlements hook.
   *
   * Mapping:
   *   Requestable "yes"/"no"          -> ?requestable=true/false
   *   Ownership "owned"/"unowned"     -> ?hasOwner=true/false
   *   Governance "orphaned"           -> ?lifecycle=Orphaned
   *   Governance "unclassified"       -> ?classified=false
   *   Governance "critical"           -> ?riskLevel=Critical
   *   Entitlement Type (first value)  -> ?kind=Group
   *   Classifications (any selected)  -> ?classified=true
   */
  /**
   * Translates UI filter panel state into backend query parameters.
   * Uses replaceFilters (not setFilters) to fully replace the filter state.
   * This ensures that switching a radio back to "All" removes the param
   * instead of leaving the previous value merged in.
   */
  const handleFilterApply = useCallback(
    (uiFilters: Filters) => {
      setFilters(uiFilters);

      const backendFilters: Record<string, string | boolean | undefined> = {
        search: searchQuery.trim() || undefined,
      };

      // Requestable
      if (uiFilters.requestable === "yes") {
        backendFilters.requestable = true;
      } else if (uiFilters.requestable === "no") {
        backendFilters.requestable = false;
      }
      // "all" -> key is absent, so replaceFilters clears it

      // Ownership
      if (uiFilters.ownership === "owned") {
        backendFilters.hasOwner = true;
      } else if (uiFilters.ownership === "unowned") {
        backendFilters.hasOwner = false;
      }
      // "all" -> key is absent, so replaceFilters clears it

      // Governance
      if (uiFilters.governance.includes("orphaned")) {
        backendFilters.lifecycle = "Orphaned";
      }
      if (uiFilters.governance.includes("unclassified")) {
        backendFilters.classified = false;
      }
      if (uiFilters.governance.includes("critical")) {
        backendFilters.riskLevel = "Critical";
      }

      // Classifications
      if (uiFilters.classifications.length > 0) {
        backendFilters.classified = true;
      }

      // Entitlement Type
      if (uiFilters.entitlementTypes.length > 0) {
        backendFilters.kind = uiFilters.entitlementTypes[0];
      }

      replaceEntitlementFilters(backendFilters as any);
    },
    [replaceEntitlementFilters, searchQuery]
  );

  const {
    evaluating,
    error: evaluateError,
    successMessage: evaluateSuccess,
    evaluateAll,
    clearResult,
  } = useEvaluateAll();

  useEffect(() => {
    if (evaluateSuccess || evaluateError) {
      const timer = setTimeout(clearResult, 5000);
      return () => clearTimeout(timer);
    }
  }, [evaluateSuccess, evaluateError, clearResult]);

  // No client-side filtering needed. All filtering is done by the backend.
  const filteredEntitlements = useMemo(() => {
    return [...entitlements];
  }, [entitlements]);

  const handleSort = useCallback(
    (config: SortConfig) => {
      setSortConfig(config);
      if (CLIENT_SIDE_SORT_KEYS.has(config.key)) {
        setClientSortConfig(config);
      } else {
        setClientSortConfig(null);
        changeSort(toSpringSort(config));
      }
    },
    [changeSort]
  );

  const sortedEntitlements = useMemo(() => {
    if (!clientSortConfig) return filteredEntitlements;

    return [...filteredEntitlements].sort((a, b) => {
      const dir = clientSortConfig.direction === "ascending" ? 1 : -1;

      switch (clientSortConfig.key) {
        case "resourceName": {
          const aVal = (a.resourceName ?? "").toLowerCase();
          const bVal = (b.resourceName ?? "").toLowerCase();
          return aVal.localeCompare(bVal) * dir;
        }
        case "assignedUsersCount": {
          const aVal = a.assignedUsersCount ?? 0;
          const bVal = b.assignedUsersCount ?? 0;
          return (aVal - bVal) * dir;
        }
        default:
          return 0;
      }
    });
  }, [filteredEntitlements, clientSortConfig]);

  const handlePageChange = useCallback(
    (oneBased: number) => {
      goToPage(oneBased - 1);
    },
    [goToPage]
  );

  const handleItemsPerPageChange = useCallback(
    (size: number) => {
      changePageSize(size);
    },
    [changePageSize]
  );

  const bannerMessage = evaluateSuccess || evaluateError;
  const bannerIsSuccess = !!evaluateSuccess;

  return (
    <div className="space-y-6 bg-background p-4 sm:p-6 lg:p-8">
      <TooltipProvider>
        <div>
          <PageHeader
            title="Entitlement Catalog"
            description="Manage and govern entitlements across all connected applications."
            icon={<FolderTree className="h-6 w-6 text-primary" />}
            actions={
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" disabled={evaluating}>
                      {evaluating ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Evaluating...
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4" />
                          Assignment Rules
                          <ChevronDown className="h-3.5 w-3.5 ml-1" />
                        </>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenuItem
                          onClick={evaluateAll}
                          disabled={evaluating}
                          className="cursor-pointer"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Run Now
                        </DropdownMenuItem>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="max-w-xs">
                        <p className="text-xs">
                          Trigger all the assignment rules on entitlements now
                        </p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenuItem
                          onClick={() => setIsScheduleDialogOpen(true)}
                          className="cursor-pointer"
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          Schedule
                        </DropdownMenuItem>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="max-w-xs">
                        <p className="text-xs">
                          Trigger all the assignment rules on entitlements
                          with a schedule
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  variant="outline"
                  onClick={() => setIsImportExportOpen(true)}
                >
                  <Upload className="h-4 w-4" /> Import
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsImportExportOpen(true)}
                >
                  <Download className="h-4 w-4" /> Export
                </Button>
                <Button onClick={() => setIsAddWizardOpen(true)}>
                  <Plus className="h-4 w-4" /> Add Entitlement
                </Button>
              </>
            }
          />

          {bannerMessage && (
            <div
              className={`mt-3 flex items-start gap-2 rounded-lg border p-3 ${bannerIsSuccess
                ? "border-green-200 dark:border-green-800 bg-green-100 dark:bg-green-900/20"
                : "border-red-200 dark:border-red-800 bg-red-100 dark:bg-red-900/20"
                }`}
            >
              <div
                className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${bannerIsSuccess
                  ? "bg-green-600 dark:bg-green-400"
                  : "bg-red-600 dark:bg-red-400"
                  }`}
              />
              <p
                className={`text-xs ${bannerIsSuccess
                  ? "text-green-700 dark:text-green-400"
                  : "text-red-700 dark:text-red-400"
                  }`}
              >
                {bannerMessage}
              </p>
            </div>
          )}
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <StandardTabs
            value={activeTab}
            onValueChange={setActiveTab}
            tabs={[
              {
                value: "analytics",
                label: "Analytics",
                icon: <BarChart3 className="h-4 w-4" />,
              },
              {
                value: "directory",
                label: "Directory",
                icon: <BookOpen className="h-4 w-4" />,
              },
            ]}
          />

          <TabsContent
            value="analytics"
            className="flex-1 overflow-y-auto mt-4"
          >
            <div>
              <Tabs
                value={analyticsSubTab}
                onValueChange={setAnalyticsSubTab}
              >
                <IconTabs
                  columns={5}
                  tabs={[
                    {
                      value: "intelligence",
                      label: "Intelligence",
                      icon: Activity,
                    },
                    {
                      value: "sprawl",
                      label: "Sprawl & Usage",
                      icon: BarChart3,
                    },
                    {
                      value: "ownership",
                      label: "Ownership & Classification",
                      icon: Users,
                    },
                    {
                      value: "risk",
                      label: "Risk & Compliance",
                      icon: Shield,
                    },
                    {
                      value: "reviews",
                      label: "Reviews",
                      icon: ClipboardCheck,
                    },
                  ]}
                />
                <TabsContent value="intelligence" className="pt-4">
                  <EntitlementIntelligence />
                </TabsContent>
                <TabsContent value="sprawl" className="pt-4">
                  <EntitlementSprawlUsage />
                </TabsContent>
                <TabsContent value="ownership" className="pt-4">
                  <EntitlementOwnershipClassification />
                </TabsContent>
                <TabsContent value="risk" className="pt-4">
                  <EntitlementRiskCompliance />
                </TabsContent>
                <TabsContent value="reviews" className="pt-4">
                  <EntitlementReviewsAnalytics />
                </TabsContent>
              </Tabs>
            </div>
          </TabsContent>

          <TabsContent
            value="directory"
            className="flex-1 overflow-hidden m-0"
          >
            <div className="h-full flex">
              <ResizablePanelGroup direction="horizontal">
                <ResizablePanel>
                  <div className="h-full overflow-y-auto">
                    <div className="pt-4">
                      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
                        <div className="relative w-full sm:max-w-xs">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search entitlements..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                        <Button
                          variant="outline"
                          onClick={() =>
                            setIsFilterPanelOpen(!isFilterPanelOpen)
                          }
                        >
                          <Filter /> Filters
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={refresh}
                          disabled={loading}
                          aria-label="Refresh entitlements"
                        >
                          <RefreshCw
                            className={`h-4 w-4 ${loading ? "animate-spin" : ""
                              }`}
                          />
                        </Button>
                      </div>

                      {error && (
                        <Alert variant="destructive" className="mb-4">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}

                      {loading ? (
                        <TableSkeleton />
                      ) : (
                        <EntitlementsTable
                          entitlements={sortedEntitlements}
                          sortConfig={sortConfig}
                          onSort={handleSort}
                          onEntitlementSelect={setSelectedEntitlement}
                          serverPagination={{
                            currentPage: currentPage + 1,
                            totalPages,
                            totalElements,
                            pageSize,
                            onPageChange: handlePageChange,
                            onPageSizeChange: handleItemsPerPageChange,
                          }}
                        />
                      )}
                    </div>
                  </div>
                </ResizablePanel>

                <Dialog
                  open={!!selectedEntitlement}
                  onOpenChange={(open) => {
                    if (!open) setSelectedEntitlement(null);
                  }}
                >
                  <DialogContent className="w-full sm:max-w-5xl flex flex-col p-0 h-full">
                    <VisuallyHidden>
                      <DialogTitle>
                        {selectedEntitlement?.displayName ??
                          "Entitlement Details"}
                      </DialogTitle>
                    </VisuallyHidden>

                    {selectedEntitlement && (
                      <div className="flex flex-col h-full min-h-0">
                        <EntitlementDetailView
                          entitlement={selectedEntitlement}
                          allEntitlements={entitlements}
                          onSelectEntitlement={setSelectedEntitlement}
                        />
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </ResizablePanelGroup>

              {isFilterPanelOpen && (
                <EntitlementsFilterPanel
                  onClose={() => setIsFilterPanelOpen(false)}
                  filters={filters}
                  onFilterChange={handleFilterApply}
                />
              )}
            </div>
          </TabsContent>
        </Tabs>

        <AddEntitlementWizard
          open={isAddWizardOpen}
          onOpenChange={setIsAddWizardOpen}
        />
        <ImportExportDialog
          open={isImportExportOpen}
          onOpenChange={setIsImportExportOpen}
          entityType="entitlement"
          data={entitlements}
          templateFields={ENTITLEMENT_TEMPLATE_FIELDS}
        />
        <ScheduleConfigDialog
          open={isScheduleDialogOpen}
          onOpenChange={setIsScheduleDialogOpen}
        />
      </TooltipProvider>
    </div>
  );
}