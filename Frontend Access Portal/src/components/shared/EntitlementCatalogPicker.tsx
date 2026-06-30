import React, { useState, useCallback, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import CustomPagination from "@/components/applications/common/CustomPagination";
import {
  Search,
  X,
  LoaderCircle,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Server,
  Loader2,
} from "lucide-react";
import { useApplicationList } from "@/hooks/useApplicationList";
import { useEntitlements } from "@/hooks/useEntitlements";
import { getRiskBadgeClass } from "@/utils/getRiskColor";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ─── Types ────────────────────────────────────────────────────────────────────

interface EntitlementCatalogPickerProps {
  /**
   * Currently selected entitlement IDs.
   */
  selectedIds: string[];
  /**
   * Called when the selection changes (add or remove).
   */
  onSelectionChange: (ids: string[]) => void;
  /**
   * Shared name cache from parent — survives tab switches.
   * Maps entitlement UUID → displayName.
   */
  nameCache: React.MutableRefObject<Map<string, string>>;
  /**
   * Whether the picker is in edit mode (allows selection changes).
   */
  editable?: boolean;
}

const APP_PAGE_SIZE = 10;
const ENT_PAGE_SIZE = 10;

// ─── Component ────────────────────────────────────────────────────────────────

const EntitlementCatalogPicker: React.FC<EntitlementCatalogPickerProps> = ({
  selectedIds,
  onSelectionChange,
  nameCache,
  editable = true,
}) => {
  // ─── Drill-down state ───────────────────────────────────────────────────────

  const [selectedResource, setSelectedResource] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [appSearch, setAppSearch] = useState("");
  const [entSearch, setEntSearch] = useState("");

  // ─── Application list ───────────────────────────────────────────────────────

  const {
    applications,
    totalElements: appTotalElements,
    totalPages: appTotalPages,
    currentPage: appCurrentPage,
    pageSize: appPageSize,
    loading: appLoading,
    error: appError,
    goToPage: appGoToPage,
    changePageSize: appChangePageSize,
    setSearch: appSetSearch,
    refresh: appRefresh,
  } = useApplicationList({
    page: 0,
    size: APP_PAGE_SIZE,
    autoFetch: true,
  });

  // ─── Entitlements for selected app ──────────────────────────────────────────

  const {
    entitlements,
    totalElements: entTotalElements,
    totalPages: entTotalPages,
    currentPage: entCurrentPage,
    pageSize: entPageSize,
    loading: entLoading,
    error: entError,
    goToPage: entGoToPage,
    changePageSize: entChangePageSize,
    setFilters: entSetFilters,
    refresh: entRefresh,
  } = useEntitlements({
    autoFetch: !!selectedResource,
    initialPage: 0,
    initialSize: ENT_PAGE_SIZE,
    initialSort: "displayName,asc",
    initialLifecycle: "Active",
    initialResourceId: selectedResource?.id,
  });

  // When selected resource changes, update entitlement filters
  useEffect(() => {
    if (selectedResource) {
      entSetFilters({
        resourceId: selectedResource.id,
        search: entSearch || undefined,
        lifecycle: "Active",
      });
    }
  }, [selectedResource, entSetFilters, entSearch]);

  // Seed name cache when entitlements page loads
  useEffect(() => {
    entitlements.forEach((ent) => {
      if (!nameCache.current.has(ent.id)) {
        nameCache.current.set(ent.id, ent.displayName);
      }
    });
  }, [entitlements, nameCache]);

  // ─── Seed cache for pre-existing IDs (edit mode) ───────────────────────────

  const [seeded, setSeeded] = useState(false);
  const [seedingNames, setSeedingNames] = useState(false);

  useEffect(() => {
    if (seeded || selectedIds.length === 0) return;

    const uncachedIds = selectedIds.filter((id) => !nameCache.current.has(id));
    if (uncachedIds.length === 0) {
      setSeeded(true);
      return;
    }

    const fetchNames = async () => {
      setSeedingNames(true);
      try {
        const results = await Promise.allSettled(
          uncachedIds.map(async (id) => {
            const res = await fetch(`/api/entitlements/${id}`);
            if (!res.ok) return { id, name: null };
            const json = await res.json();
            const data = json.data || json;
            return { id, name: data.displayName || null };
          })
        );
        results.forEach((result) => {
          if (result.status === "fulfilled" && result.value.name) {
            nameCache.current.set(result.value.id, result.value.name);
          }
        });
      } catch {
        // Silently fail — badges will show truncated IDs
      } finally {
        setSeedingNames(false);
        setSeeded(true);
      }
    };

    fetchNames();
  }, [selectedIds, nameCache, seeded]);

  // ─── Name resolution ───────────────────────────────────────────────────────

  const getDisplayName = useCallback(
    (id: string): string => {
      const cached = nameCache.current.get(id);
      if (cached) return cached;
      const fromPage = entitlements.find((e) => e.id === id);
      if (fromPage) {
        nameCache.current.set(id, fromPage.displayName);
        return fromPage.displayName;
      }
      return `${id.substring(0, 8)}…`;
    },
    [entitlements, nameCache]
  );

  // ─── Selection handlers ─────────────────────────────────────────────────────

  const toggleEntitlement = (id: string) => {
    if (!editable) return;
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((e) => e !== id));
      nameCache.current.delete(id);
    } else {
      const ent = entitlements.find((e) => e.id === id);
      if (ent) nameCache.current.set(id, ent.displayName);
      onSelectionChange([...selectedIds, id]);
    }
  };

  const removeEntitlement = (id: string) => {
    if (!editable) return;
    onSelectionChange(selectedIds.filter((e) => e !== id));
    nameCache.current.delete(id);
  };

  // ─── Navigation ─────────────────────────────────────────────────────────────

  const handleSelectApp = (app: { id: string; name: string }) => {
    setSelectedResource(app);
    setEntSearch("");
  };

  const handleBackToApps = () => {
    setSelectedResource(null);
    setEntSearch("");
  };

  const handleAppSearchChange = (value: string) => {
    setAppSearch(value);
    appSetSearch(value);
  };

  const handleEntSearchChange = (value: string) => {
    setEntSearch(value);
    entSetFilters({
      resourceId: selectedResource?.id,
      search: value || undefined,
      lifecycle: "Active",
    });
  };

  // Count selected entitlements per app (for badges on app list)
  const getSelectedCountForApp = useCallback(
    (appId: string): number => {
      // We can't know perfectly without fetching all entitlements for each app,
      // but we can check the name cache for resourceName matching
      // For now return 0 — the total selected badge at top is sufficient
      return 0;
    },
    []
  );

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <div className="flex items-center gap-1.5">
            <Label>
              {selectedResource
                ? `Entitlements ${selectedResource.name}`
                : "Select Application"}
            </Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/50 cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p>
                  {selectedResource
                    ? "Select entitlements from this application to bundle into the role."
                    : "Choose an application first, then select its entitlements."}
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <p className="text-xs text-muted-foreground mb-2">
            {selectedResource
              ? `Showing entitlements for ${selectedResource.name}. Click to select/deselect.`
              : "Browse applications to find entitlements to attach to this role."}
          </p>
        </div>

        {/* Selected entitlement badges */}
        {selectedIds.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                Selected ({selectedIds.length})
              </span>
              {seedingNames && (
                <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3 w-3 text-muted-foreground/50 cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>
                    These entitlements will be linked to the role on save.
                    {editable && " Click × to remove."}
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="flex flex-wrap gap-1">
              {selectedIds.map((id) => (
                <Tooltip key={id}>
                  <TooltipTrigger asChild>
                    <Badge variant="secondary" className="text-xs cursor-default">
                      {getDisplayName(id)}
                      {editable && (
                        <X
                          className="h-3 w-3 ml-1 cursor-pointer hover:text-destructive transition-colors"
                          onClick={() => removeEntitlement(id)}
                        />
                      )}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    <p>{editable ? "Click × to remove" : "Linked entitlement"}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        )}

        {/* ─── Application List View ─────────────────────────────────────── */}
        {!selectedResource && (
          <>
            {/* App search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={appSearch}
                onChange={(e) => handleAppSearchChange(e.target.value)}
                placeholder="Search applications..."
                className="pl-8"
              />
            </div>

            {/* App loading */}
            {appLoading && (
              <div className="flex items-center justify-center py-12">
                <LoaderCircle className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            )}

            {/* App error */}
            {appError && !appLoading && (
              <div className="text-center py-6">
                <p className="text-sm text-destructive mb-2">
                  Failed to load applications
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  {appError}
                </p>
                <Button variant="outline" size="sm" onClick={appRefresh}>
                  Retry
                </Button>
              </div>
            )}

            {/* App empty */}
            {!appLoading && !appError && applications.length === 0 && (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <p className="text-sm">No applications found.</p>
              </div>
            )}

            {/* App list */}
            {!appLoading && !appError && applications.length > 0 && (
              <>
                <ScrollArea className="rounded-md border max-h-[400px]">
                  {applications.map((app) => (
                    <div
                      key={app.id}
                      onClick={() => handleSelectApp({ id: app.id, name: app.name })}
                      className="flex items-center justify-between p-3 border-b cursor-pointer transition-colors hover:bg-accent"
                    >
                      <div className="flex items-center gap-3">
                        <Server className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div>
                          <div className="font-medium text-sm">{app.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {app.category || "Application"} · {app.users} users
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {app.riskLevel && app.riskLevel !== "Low" && (
                          <Badge
                            className={`text-xs ${getRiskBadgeClass(app.riskLevel)}`}
                          >
                            {app.riskLevel}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {app.connectionStatus}
                        </Badge>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </ScrollArea>

                <CustomPagination
                  useCallbackMode={true}
                  totalElements={appTotalElements}
                  totalPages={appTotalPages}
                  page={appCurrentPage}
                  size={appPageSize}
                  defaultSize={APP_PAGE_SIZE}
                  onPageChange={(p) => appGoToPage(p)}
                  onSizeChange={(s) => appChangePageSize(s)}
                  siblingCount={1}
                  boundaryCount={1}
                />
              </>
            )}
          </>
        )}

        {/* ─── Entitlement List View (for selected app) ─────────────────── */}
        {selectedResource && (
          <>
            {/* Back button + search */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToApps}
                className="gap-1 px-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  value={entSearch}
                  onChange={(e) => handleEntSearchChange(e.target.value)}
                  placeholder={`Search entitlements in ${selectedResource.name}...`}
                  className="pl-8"
                />
              </div>
            </div>

            {/* Ent loading */}
            {entLoading && (
              <div className="flex items-center justify-center py-12">
                <LoaderCircle className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            )}

            {/* Ent error */}
            {entError && !entLoading && (
              <div className="text-center py-6">
                <p className="text-sm text-destructive mb-2">
                  Failed to load entitlements
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  {entError}
                </p>
                <Button variant="outline" size="sm" onClick={entRefresh}>
                  Retry
                </Button>
              </div>
            )}

            {/* Ent empty */}
            {!entLoading && !entError && entitlements.length === 0 && (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <p className="text-sm">
                  No entitlements found in {selectedResource.name}.
                </p>
              </div>
            )}

            {/* Ent list */}
            {!entLoading && !entError && entitlements.length > 0 && (
              <>
                <ScrollArea className="rounded-md border max-h-[350px]">
                  {entitlements.map((e) => {
                    const selected = selectedIds.includes(e.id);
                    const riskLevel = e.riskLevel || "Low";
                    const riskLabel =
                      riskLevel.charAt(0).toUpperCase() +
                      riskLevel.slice(1).toLowerCase();

                    return (
                      <Tooltip key={e.id}>
                        <TooltipTrigger asChild>
                          <div
                            onClick={() => toggleEntitlement(e.id)}
                            className={`p-2.5 border-b cursor-pointer transition-colors text-sm hover:bg-accent ${
                              selected
                                ? "bg-primary/5 border-l-4 border-l-primary"
                                : ""
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-medium">
                                {e.displayName}
                              </span>
                              <div className="flex gap-1.5 items-center">
                                <Badge variant="outline" className="text-xs">
                                  {e.resourceName}
                                </Badge>
                                <Badge
                                  className={`text-xs ${getRiskBadgeClass(riskLevel)}`}
                                >
                                  {riskLabel}
                                </Badge>
                              </div>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {e.kind} ·{" "}
                              {e.description
                                ? e.description.substring(0, 80) +
                                  (e.description.length > 80 ? "…" : "")
                                : "No description"}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent
                          side="left"
                          className="max-w-xs text-xs"
                        >
                          <div className="space-y-1">
                            <p className="font-medium">{e.displayName}</p>
                            {e.description && (
                              <p className="text-muted-foreground">
                                {e.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 pt-1">
                              <span>Risk: {riskLabel}</span>
                              <span>·</span>
                              <span>App: {e.resourceName}</span>
                              {e.privilegeLevel && (
                                <>
                                  <span>·</span>
                                  <span>Privilege: {e.privilegeLevel}</span>
                                </>
                              )}
                            </div>
                            <p className="pt-1 text-muted-foreground italic">
                              {selected
                                ? "Click to deselect"
                                : "Click to select"}
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </ScrollArea>

                <CustomPagination
                  useCallbackMode={true}
                  totalElements={entTotalElements}
                  totalPages={entTotalPages}
                  page={entCurrentPage}
                  size={entPageSize}
                  defaultSize={ENT_PAGE_SIZE}
                  onPageChange={(p) => entGoToPage(p)}
                  onSizeChange={(s) => entChangePageSize(s)}
                  siblingCount={1}
                  boundaryCount={1}
                />
              </>
        )}
          </>
        )}
      </div>
    </TooltipProvider>
  );
};

export default EntitlementCatalogPicker;