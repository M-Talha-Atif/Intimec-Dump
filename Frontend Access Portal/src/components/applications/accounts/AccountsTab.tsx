"use client";

import { useEffect, useState } from "react";
import {
  StickyTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Scale, Download, RefreshCw, UserX, UserCog, ShieldAlert, Clock, AlertTriangle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

import useAccounts, {
  UseAccountsResponse,
} from "@/hooks/applications/useAccounts";

import CustomPagination from "@/components/applications/common/CustomPagination";

import { AccountComparisonDialog } from "./AccountComparisonDialog";
import AccountRow from "./AccountRow";
import AccountDetailPanel from "./AccountDetailPanel";
import SekeletonRow from "@/components/applications/common/SkeletonRow";
import { AccountWithUserAndEntitlements } from "@/components/applications/types";
import clsx from "clsx";
import useAccountFilters from "@/hooks/applications/useAccountFilters";
import { useSearchParams } from "next/navigation";
import SearchBarWithParams from "@/components/common/SearchBarWithParams";
import FiltersWithParams from "@/components/common/FiltersWithParams";

const ApplicationAccountsTab = ({ appid }: { appid: string }) => {
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<
    AccountWithUserAndEntitlements[]
  >([]);
  const [selectedAccount, setSelectedAccount] =
    useState<AccountWithUserAndEntitlements | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const searchParams = useSearchParams();
  const pageSize = parseInt(searchParams.get("size") || "10", 10);

  useEffect(() => {
    setIsPanelOpen(!!selectedAccount);
  }, [selectedAccount]);

  const {
    data: accounts,
    pagination,
    stats,
    isLoading,
    error,
    refresh,
  }: UseAccountsResponse = useAccounts(appid);

  const { filters, isLoading: isLoadingFilters } = useAccountFilters(appid);

  const toggleFilter = (filter: string) => {
    setActiveFilters((prev) =>
      prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]
    );
  };

  const filteredAccounts = accounts.filter((account) => {
    if (activeFilters.length === 0) return true;
    return activeFilters.every((filter) => {
      if (filter === "uncorrelated") return !account.userId;
      if (filter === "disabled") return account.status === "Disabled";
      if (filter === "privileged") return account.user?.isPrivileged;
      if (filter === "stale") return account.status === "Stale";
      if (filter === "violations") return (account.policyViolations?.length ?? 0) > 0;
      return true;
    });
  });

  function handleSelectAll(checked: boolean) {
    if (checked) {
      setSelectedItems(accounts);
    } else {
      setSelectedItems([]);
    }
  }

  function handleSelectItem(
    item: AccountWithUserAndEntitlements,
    checked: boolean
  ) {
    setSelectedItems((prev) => {
      if (checked) {
        return [...prev, item];
      } else {
        return prev.filter((i) => i.id !== item.id);
      }
    });
  }

  function handleAccountClick(account: AccountWithUserAndEntitlements) {
    if (selectedAccount?.id === account.id) {
      setSelectedAccount(null);
    } else {
      setSelectedAccount(account);
    }
  }

  const activeCount = stats?.activeCount ?? 0;
  const disabledCount = stats?.disabledCount ?? 0;
  const orphanCount = stats?.orphanCount ?? 0;
  const privilegedCount = stats?.privilegedCount ?? 0;

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col h-full gap-4 p-4 overflow-hidden">
        {/* Summary bar */}
        <div className="flex items-center gap-4 py-2 px-3 bg-muted/40 rounded-lg border text-xs">
          <span className="font-medium text-foreground">Summary:</span>
          <span>
            <strong>{pagination?.totalElements ?? accounts.length}</strong>{" "}
            Total
          </span>
          <span className="text-green-700">
            <strong>{activeCount}</strong> Active
          </span>
          <span className="text-red-700">
            <strong>{disabledCount}</strong> Disabled
          </span>
          <span className="text-amber-700">
            <strong>{orphanCount}</strong> Orphan
          </span>
          <span className="text-orange-700">
            <strong>{privilegedCount}</strong> Privileged
          </span>
        </div>

        <div className="flex flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <SearchBarWithParams
              searchPlaceholder="Search by account or user..."
              resetPageOnChange
              className="w-56 shrink-0"
            />
            <Button variant={activeFilters.includes('uncorrelated') ? 'secondary' : 'outline'} size="sm" className="shrink-0" onClick={() => toggleFilter('uncorrelated')}>
              <UserX className="mr-1.5 h-3.5 w-3.5" /> Uncorrelated
            </Button>
            <Button variant={activeFilters.includes('disabled') ? 'secondary' : 'outline'} size="sm" className="shrink-0" onClick={() => toggleFilter('disabled')}>
              <UserCog className="mr-1.5 h-3.5 w-3.5" /> Disabled
            </Button>
            <Button variant={activeFilters.includes('privileged') ? 'secondary' : 'outline'} size="sm" className="shrink-0" onClick={() => toggleFilter('privileged')}>
              <ShieldAlert className="mr-1.5 h-3.5 w-3.5" /> Privileged
            </Button>
            <Button variant={activeFilters.includes('stale') ? 'secondary' : 'outline'} size="sm" className="shrink-0" onClick={() => toggleFilter('stale')}>
              <Clock className="mr-1.5 h-3.5 w-3.5" /> Stale
            </Button>
            <Button variant={activeFilters.includes('violations') ? 'secondary' : 'outline'} size="sm" className="shrink-0" onClick={() => toggleFilter('violations')}>
              <AlertTriangle className="mr-1.5 h-3.5 w-3.5" /> Violations
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
              <Scale className="w-4 h-4 mr-2" />
              Compare ({selectedItems.length})
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
        <ScrollArea className="max-h-full overflow-hidden rounded-md border-1">
          <StickyTable>
            <TableHeader className="sticky top-0 z-10">
              <TableRow>
                <TableHead className="w-10">
                  <div className="flex items-center justify-center">
                    <Checkbox
                      checked={
                        selectedItems.length === accounts.length &&
                        accounts.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </div>
                </TableHead>
                <TableHead>Account Name</TableHead>
                <TableHead>Correlated Identity</TableHead>
                <TableHead>Situation</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead>Privileged</TableHead>
                <TableHead>Last Sync</TableHead>
                <TableHead className="w-10">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading &&
                [...Array(pageSize)].map((_, index) => (
                  <SekeletonRow key={index} />
                ))}

              {!!error && !isLoading && (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center h-24 max-h-full text-destructive"
                  >
                    Error loading accounts. Please try again later.
                  </TableCell>
                </TableRow>
              )}

              {!error &&
                !isLoading &&
                accounts &&
                accounts.map((account: AccountWithUserAndEntitlements) => {
                  if (activeFilters.length > 0) {
                    const matchesFilters = activeFilters.every((filter) => {
                      if (filter === "uncorrelated") return !account.userId;
                      if (filter === "disabled") return account.status === "Disabled";
                      if (filter === "privileged") return account.user?.isPrivileged;
                      if (filter === "stale") return account.status === "Stale";
                      if (filter === "violations") return (account.policyViolations?.length ?? 0) > 0;
                      return true;
                    });
                    if (!matchesFilters) return null;
                  }
                  return (
                    <AccountRow
                      key={account.id}
                      account={account}
                      isSelected={selectedItems.some((s) => s.id === account.id)}
                      isActive={selectedAccount?.id === account.id}
                      onSelect={(checked) => handleSelectItem(account, !!checked)}
                      onAccountClick={handleAccountClick}
                    />
                  );
                })}

              {!error && !isLoading && accounts.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center h-24 max-h-full text-muted-foreground"
                  >
                    No accounts found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </StickyTable>
        </ScrollArea>
        <AccountComparisonDialog
          isOpen={isCompareOpen}
          onOpenChange={setIsCompareOpen}
          accounts={selectedItems}
        />
      </div>
      <CustomPagination
        totalPages={pagination?.totalPages}
        totalElements={pagination?.totalElements}
        defaultSize={10}
      />

      {isPanelOpen && selectedAccount && (
        <AccountDetailPanel
          account={selectedAccount}
          onClose={() => setSelectedAccount(null)}
        />
      )}
    </div>
  );
};

export default ApplicationAccountsTab;
