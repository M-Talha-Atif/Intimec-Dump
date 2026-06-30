import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChevronDown, Search, ArrowUp, ArrowDown, HelpCircle } from "lucide-react";
import { Input } from "@/components/ui/input";

import { Application } from "@/types/application";

import ApplicationTableRow, {
  ApplicationTableRowSkeleton,
} from "./ApplicationTableRow";

function InfoTooltip({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <HelpCircle className="h-3.5 w-3.5 shrink-0 cursor-help text-muted-foreground" />
      </TooltipTrigger>
      <TooltipContent className="max-w-[260px] text-xs">{text}</TooltipContent>
    </Tooltip>
  );
}

function SortableHeader({
  columnKey,
  children,
  className,
  sortConfig,
  onSort,
}: {
  columnKey: string;
  children: React.ReactNode;
  className?: string;
  sortConfig: { key: string; direction: "asc" | "desc" };
  onSort: (key: string) => void;
}) {
  return (
    <TableHead className={className}>
      <Button
        variant="ghost"
        onClick={() => onSort(columnKey)}
        className="-ml-4 hover:bg-muted"
      >
        {children}
        {sortConfig.key === columnKey ? (
          sortConfig.direction === "asc" ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : (
            <ArrowDown className="ml-2 h-4 w-4" />
          )
        ) : (
          <div className="ml-2 h-4 w-4" />
        )}
      </Button>
    </TableHead>
  );
}

const TableView = ({
  filteredApplications,
  loading = false,
  size = 10,
  error,
}: {
  filteredApplications: Application[];
  loading?: boolean;
  size?: number;
  error: unknown;
}) => {
  const [columns, setColumns] = useState({
    users: true,
    orphan: true,
    risky: true,
    source: true,
    flows: true,
    lastSync: true,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  }>({ key: "name", direction: "asc" });

  const requestSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const displayedApplications = useMemo(() => {
    if (!filteredApplications) return [];
    let result = [...filteredApplications];

    // Filter by search
    if (searchTerm) {
      result = result.filter((app) =>
        app.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Sort
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof Application];
        const bValue = b[sortConfig.key as keyof Application];
        if (aValue == null) return 1;
        if (bValue == null) return -1;
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [filteredApplications, searchTerm, sortConfig]);

  if (!loading && error) return null;

  // Summary stats from the full list (not filtered by search)
  const totalCount = filteredApplications?.length ?? 0;
  const connectedCount =
    filteredApplications?.filter((a) => a.connectionStatus === "Connected")
      .length ?? 0;
  const authoritativeCount =
    filteredApplications?.filter((a) => a.authoritative).length ?? 0;
  const atRiskCount =
    filteredApplications?.filter((a) => a.riskyCount > 20).length ?? 0;

  return (
    <div className="flex flex-col h-full gap-4 mt-4 mb-4 overflow-hidden">
      {/* Search and Column Toggle */}
      <div className="flex items-center justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search applications..."
            className="pl-10 pr-4 py-2 w-full sm:w-80 border"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {Object.entries(columns).map(([key, checked]) => (
              <DropdownMenuCheckboxItem
                key={key}
                checked={checked}
                onCheckedChange={(v) =>
                  setColumns((prev) => ({ ...prev, [key]: !!v }))
                }
              >
                {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1")}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Summary Bar */}
      {!loading && (
        <div className="flex items-center gap-4 px-4 py-2.5 bg-muted/50 rounded-lg border text-sm text-muted-foreground">
          <span>
            Total:{" "}
            <strong className="text-foreground">{totalCount}</strong>
          </span>
          <span>
            Connected:{" "}
            <strong className="text-foreground">{connectedCount}</strong>
          </span>
          <span>
            Authoritative:{" "}
            <strong className="text-foreground">{authoritativeCount}</strong>
          </span>
          <span>
            At Risk:{" "}
            <strong className="text-foreground">{atRiskCount}</strong>
          </span>
        </div>
      )}

      {/* Table */}
      <div className="bg-card rounded-lg border overflow-auto flex-1">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox />
              </TableHead>
              <SortableHeader
                columnKey="name"
                sortConfig={sortConfig}
                onSort={requestSort}
              >
                App
              </SortableHeader>
              {columns.users && (
                <SortableHeader
                  columnKey="users"
                  sortConfig={sortConfig}
                  onSort={requestSort}
                >
                  <div className="flex items-center gap-1">
                    Users
                    <InfoTooltip text="Total number of identities with active access to this application." />
                  </div>
                </SortableHeader>
              )}
              {columns.orphan && (
                <SortableHeader
                  columnKey="orphanCount"
                  sortConfig={sortConfig}
                  onSort={requestSort}
                >
                  <div className="flex items-center gap-1">
                    Orphan
                    <InfoTooltip text="Accounts with no matching identity in the identity store." />
                  </div>
                </SortableHeader>
              )}
              {columns.risky && (
                <SortableHeader
                  columnKey="riskyCount"
                  sortConfig={sortConfig}
                  onSort={requestSort}
                >
                  <div className="flex items-center gap-1">
                    Risky
                    <InfoTooltip text="Users with access anomalies such as excessive permissions or SoD violations." />
                  </div>
                </SortableHeader>
              )}
              <TableHead>
                <div className="flex items-center gap-1">
                  Risk Level
                  <InfoTooltip text="Aggregate risk assessment based on orphan accounts, risky users, and governance coverage." />
                </div>
              </TableHead>
              {columns.source && (
                <SortableHeader
                  columnKey="authoritative"
                  sortConfig={sortConfig}
                  onSort={requestSort}
                >
                  <div className="flex items-center gap-1">
                    Source
                    <InfoTooltip text="Authoritative sources are the system of record for identity data." />
                  </div>
                </SortableHeader>
              )}
              {columns.flows && (
                <SortableHeader
                  columnKey="flows"
                  sortConfig={sortConfig}
                  onSort={requestSort}
                >
                  <div className="flex items-center gap-1">
                    Flows
                    <InfoTooltip text="Number of provisioning and deprovisioning workflows configured." />
                  </div>
                </SortableHeader>
              )}
              {columns.lastSync && (
                <SortableHeader
                  columnKey="lastSyncAccounts"
                  sortConfig={sortConfig}
                  onSort={requestSort}
                >
                  <div className="flex items-center gap-1">
                    Last Sync
                    <InfoTooltip text="When the connector last synchronized identity and access data." />
                  </div>
                </SortableHeader>
              )}
              <SortableHeader
                columnKey="connectionStatus"
                sortConfig={sortConfig}
                onSort={requestSort}
              >
                <div className="flex items-center gap-1">
                  Status
                  <InfoTooltip text="Current connector health. Connection problems may cause provisioning delays." />
                </div>
              </SortableHeader>
              <TableHead>
                <div className="flex items-center gap-1">
                  Governance
                  <InfoTooltip text="Governance readiness: owner assignment, workflow configuration, and certification coverage." />
                </div>
              </TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading &&
              Array.from({ length: size }).map((_, i) => (
                <ApplicationTableRowSkeleton key={i} columns={columns} />
              ))}
            {!loading &&
              !error &&
              displayedApplications.map((application: Application) => (
                <ApplicationTableRow
                  key={application.id}
                  application={application}
                  columns={columns}
                />
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TableView;
