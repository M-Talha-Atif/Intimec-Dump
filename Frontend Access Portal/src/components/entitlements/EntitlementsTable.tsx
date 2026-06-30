import React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ArrowUpDown,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Archive,
  Trash2,
  Zap,
  Users,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EntitlementResponseDto } from "@/types/entitlements";
import CustomPagination from "@/components/applications/common/CustomPagination";
import useIdentity from "@/hooks/identities/useIdentity";
import { IDENTITY_ENTITY_TYPES } from "@/constants/identity";
// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SortConfig = {
  key: string;
  direction: "ascending" | "descending";
};

export interface ServerPaginationConfig {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

type EntitlementsTableProps = {
  entitlements: EntitlementResponseDto[];
  sortConfig: SortConfig;
  onSort: (config: SortConfig) => void;
  onEntitlementSelect: (entitlement: EntitlementResponseDto) => void;
  serverPagination?: ServerPaginationConfig;
};

// ---------------------------------------------------------------------------
// Classification badge variant map
// ---------------------------------------------------------------------------

const classificationVariantMap: {
  [key: string]: "default" | "secondary" | "destructive" | "outline";
} = {
  "High Risk": "destructive",
  PII: "secondary",
  GDPR: "default",
  SOX: "outline",
};

// ---------------------------------------------------------------------------
// Owner Cell Component — each row gets its own hook call
// ---------------------------------------------------------------------------

const OwnerCell: React.FC<{ entitlement: EntitlementResponseDto }> = ({
  entitlement,
}) => {
  const ownerId =
    typeof entitlement.ownerId === "string" ? entitlement.ownerId : null;

  const { data: ownerIdentity, isLoading } = useIdentity(
    ownerId ? IDENTITY_ENTITY_TYPES.EMPLOYEE : null,
    ownerId
  );

  if (!ownerId) {
    return (
      <Badge
        variant="destructive"
        className="bg-red-100/60 text-red-800 border-red-200"
      >
        <AlertTriangle className="mr-1 h-3.5 w-3.5" />
        Unowned
      </Badge>
    );
  }

  if (isLoading) {
    return (
      <span className="flex items-center gap-1 text-muted-foreground text-sm">
        <Loader2 className="h-3 w-3 animate-spin" />
      </span>
    );
  }

  // Resolve display name from coreAttributes
  const core = ownerIdentity?.coreAttributes;
  let displayLabel: string = ownerId;

  if (core) {
    const displayName = core.displayName;
    const firstName = core.firstName;
    const lastName = core.lastName;
    const username = core.username;
    const email = core.email;

    if (displayName) {
      displayLabel = String(displayName);
    } else if (firstName || lastName) {
      displayLabel =
        `${String(firstName ?? "")} ${String(lastName ?? "")}`.trim();
    } else if (username) {
      displayLabel = String(username);
    } else if (email) {
      displayLabel = String(email);
    }
  } else {
    // Fallback to attributes.owner if identity not found
    const attrOwner = entitlement.attributes?.owner;
    if (typeof attrOwner === "string" && attrOwner) {
      displayLabel = attrOwner;
    }
  }

  const username = core?.username ? String(core.username) : null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="cursor-pointer text-sm">
          {displayLabel}
          {username && displayLabel !== username && (
            <span className="text-xs text-muted-foreground ml-1">
              ({username})
            </span>
          )}
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <p>Owner ID: {ownerId}</p>
      </TooltipContent>
    </Tooltip>
  );
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const LifecycleBadge = ({ lifecycle }: { lifecycle: string }) => {
  const config: Record<string, { icon: React.ElementType; color: string }> = {
    Active: {
      icon: Zap,
      color: "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
    },
    Deprecated: {
      icon: Archive,
      color: "bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200",
    },
    Orphaned: {
      icon: Trash2,
      color:
        "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200",
    },
    Inactive: {
      icon: XCircle,
      color: "bg-red-100 text-red-800 border-red-200 hover:bg-red-200",
    },
  };

  const matched = config[lifecycle];
  if (!matched) {
    return (
      <Badge variant="outline" className="font-normal text-xs">
        {lifecycle}
      </Badge>
    );
  }
  const { icon: Icon, color } = matched;
  return (
    <Badge variant="outline" className={`font-normal text-xs ${color}`}>
      <Icon className="h-3 w-3 mr-1" />
      {lifecycle}
    </Badge>
  );
};

const SortableHeader = ({
  children,
  sortKey,
  sortConfig,
  onSort,
}: {
  children: React.ReactNode;
  sortKey: string;
  sortConfig: SortConfig;
  onSort: (key: string) => void;
}) => {
  const isSorted = sortConfig.key === sortKey;
  return (
    <Button variant="ghost" size="sm" onClick={() => onSort(sortKey)}>
      {children}
      <ArrowUpDown
        className={cn(
          "ml-2 h-4 w-4",
          !isSorted && "text-muted-foreground/50"
        )}
      />
    </Button>
  );
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resolveType(entitlement: EntitlementResponseDto): string {
  if (entitlement.kind) return entitlement.kind.charAt(0).toUpperCase() + entitlement.kind.slice(1).toLowerCase();
  const attrType = entitlement.attributes?.type;
  if (typeof attrType === "string" && attrType) return attrType;
  return entitlement.objectClass ?? "-";
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const EntitlementsTable = ({
  entitlements,
  sortConfig,
  onSort,
  onEntitlementSelect,
  serverPagination,
}: EntitlementsTableProps) => {
  const [selectedRows, setSelectedRows] = React.useState<string[]>([]);

  const [localPage, setLocalPage] = React.useState(1);
  const [localPageSize, setLocalPageSize] = React.useState(10);

  const isServerPaged = !!serverPagination;

  const currentPage = isServerPaged ? serverPagination.currentPage : localPage;
  const itemsPerPage = isServerPaged
    ? serverPagination.pageSize
    : localPageSize;
  const totalPages = isServerPaged
    ? serverPagination.totalPages
    : Math.ceil(entitlements.length / localPageSize);
  const totalElements = isServerPaged
    ? serverPagination.totalElements
    : entitlements.length;

  const visibleEntitlements = isServerPaged
    ? entitlements
    : entitlements.slice(
        (localPage - 1) * localPageSize,
        localPage * localPageSize
      );

  // ---- Selection helpers --------------------------------------------------

  const visibleIds = React.useMemo(
    () => visibleEntitlements.map((e) => e.id),
    [visibleEntitlements]
  );

  const selectedOnPageCount = React.useMemo(
    () => selectedRows.filter((id) => visibleIds.includes(id)).length,
    [selectedRows, visibleIds]
  );

  const headerCheckboxState =
    visibleEntitlements.length > 0 &&
    selectedOnPageCount === visibleEntitlements.length
      ? true
      : selectedOnPageCount > 0
        ? "indeterminate"
        : false;

  const handleSelectAllOnPage = (checked: boolean | "indeterminate") => {
    if (checked) {
      setSelectedRows((prev) => [...new Set([...prev, ...visibleIds])]);
    } else {
      setSelectedRows((prev) => prev.filter((id) => !visibleIds.includes(id)));
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedRows((prev) => [...prev, id]);
    } else {
      setSelectedRows((prev) => prev.filter((rowId) => rowId !== id));
    }
  };

  // ---- Pagination handlers ------------------------------------------------

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    if (isServerPaged) {
      serverPagination.onPageChange(page);
    } else {
      setLocalPage(page);
    }
  };

  const handleItemsPerPageChange = (value: string) => {
    const size = Number(value);
    if (isServerPaged) {
      serverPagination.onPageSizeChange(size);
    } else {
      setLocalPageSize(size);
      setLocalPage(1);
    }
  };

  // ---- Sort handler -------------------------------------------------------

  const handleSort = (key: string) => {
    const direction: "ascending" | "descending" =
      sortConfig.key === key && sortConfig.direction === "ascending"
        ? "descending"
        : "ascending";
    onSort({ key, direction });
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="border rounded-lg bg-white shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[40px] px-4">
                <Checkbox
                  onCheckedChange={handleSelectAllOnPage}
                  checked={headerCheckboxState}
                  aria-label="Select all rows on this page"
                />
              </TableHead>
              <TableHead className="whitespace-nowrap">
                <SortableHeader
                  sortKey="resourceName"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                >
                  Application
                </SortableHeader>
              </TableHead>
              <TableHead className="whitespace-nowrap">
                <SortableHeader
                  sortKey="sourceUid"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                >
                  Source UID
                </SortableHeader>
              </TableHead>
              <TableHead className="whitespace-nowrap">
                <SortableHeader
                  sortKey="displayName"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                >
                  Display Name
                </SortableHeader>
              </TableHead>
              <TableHead className="whitespace-nowrap">
                <SortableHeader
                  sortKey="objectClass"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                >
                  Type
                </SortableHeader>
              </TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="whitespace-nowrap">
                <SortableHeader
                  sortKey="ownerId"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                >
                  Owner
                </SortableHeader>
              </TableHead>
              <TableHead className="whitespace-nowrap">
                <SortableHeader
                  sortKey="assignedUsersCount"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                >
                  Users
                </SortableHeader>
              </TableHead>
              <TableHead className="whitespace-nowrap">
                <SortableHeader
                  sortKey="requestable"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                >
                  Requestable
                </SortableHeader>
              </TableHead>
              <TableHead className="whitespace-nowrap">
                <SortableHeader
                  sortKey="lifecycle"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                >
                  Lifecycle
                </SortableHeader>
              </TableHead>
              <TableHead>Classification</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            <TooltipProvider>
              {visibleEntitlements.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={11}
                    colSpan={11}
                    className="text-center py-10 text-muted-foreground"
                  >
                    No entitlements found.
                  </TableCell>
                </TableRow>
              ) : (
                visibleEntitlements.map((entitlement) => {
                  const typeLabel = resolveType(entitlement);

                  return (
                    <TableRow
                      key={entitlement.id}
                      data-state={
                        selectedRows.includes(entitlement.id)
                          ? "selected"
                          : ""
                      }
                      onClick={() => onEntitlementSelect(entitlement)}
                      className="cursor-pointer"
                    >
                      <TableCell
                        className="px-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          onCheckedChange={(checked) =>
                            handleSelectRow(entitlement.id, !!checked)
                          }
                          checked={selectedRows.includes(entitlement.id)}
                          aria-label={`Select row ${entitlement.displayName}`}
                        />
                      </TableCell>

                      <TableCell className="font-medium whitespace-nowrap">
                        {entitlement.resourceName ?? "-"}
                      </TableCell>

                      <TableCell className="text-muted-foreground whitespace-nowrap text-xs font-mono">
                        {entitlement.sourceUid}
                      </TableCell>

                      <TableCell className="whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {entitlement.displayName}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="whitespace-nowrap">
                        <Badge variant="outline">{typeLabel}</Badge>
                      </TableCell>

                      <TableCell className="max-w-[200px]">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="block truncate cursor-default">
                              {entitlement.description}
                            </span>
                          </TooltipTrigger>
                          {entitlement.description && (
                            <TooltipContent className="max-w-[320px] whitespace-normal">
                              <p>{entitlement.description}</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TableCell>

                      <TableCell className="whitespace-nowrap">
                        <OwnerCell entitlement={entitlement} />
                      </TableCell>

                      <TableCell className="whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1.5 text-slate-600">
                          <Users className="h-4 w-4" />
                          <span>{entitlement.assignedUsersCount}</span>
                        </div>
                      </TableCell>

                      {/* Last Used - Added here before Requestable */}
                      {/* <TableCell className="whitespace-nowrap">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1.5 text-sm">
                              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                {formatLastUsed(getMockLastUsed(entitlement.id))}
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              Last used{" "}
                              {new Date(getMockLastUsed(entitlement.id)).toLocaleString()}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell> */}

                      {/* Requestable */}
                      <TableCell>
                        {entitlement.requestable ? (
                          <Badge
                            variant="outline"
                            className="text-green-600 border-green-600/50 bg-green-50"
                          >
                            <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                            Requestable
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-slate-600 border-slate-600/50 bg-slate-50"
                          >
                            <XCircle className="mr-1 h-3.5 w-3.5" />
                            Not Requestable
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="whitespace-nowrap">
                        {entitlement.lifecycle ? (
                          <LifecycleBadge lifecycle={entitlement.lifecycle} />
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {entitlement.classification &&
                          entitlement.classification.length > 0 ? (
                            entitlement.classification.map((c) => (
                              <Badge
                                key={c}
                                variant={
                                  classificationVariantMap[c] || "default"
                                }
                              >
                                {c}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-slate-400 text-xs">
                              Unclassified
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TooltipProvider>
          </TableBody>
        </Table>
      </div>
      {/* ------------------------------------------------------------------ */}
      {/* Footer: row count + rows-per-page + pagination                      */}
      {/* ------------------------------------------------------------------ */}
      <CustomPagination
        useCallbackMode={true}
        totalElements={totalElements}
        totalPages={totalPages}
        page={currentPage - 1} 
        size={itemsPerPage}
        defaultSize={itemsPerPage}
        onPageChange={(zeroBasedPage) => handlePageChange(zeroBasedPage + 1)}
        onSizeChange={handleItemsPerPageChange}
      />
    </div>
  );
};

export default EntitlementsTable;
