import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import type { Entitlement } from "../data/mock-entitlements";
import type { Filters } from "../filter/types";
import { applyFilters } from "../filter/utils";

export const useEntitlementsTable = (
  entitlements: Entitlement[],
  filters?: Filters
) => {
  const searchParams = useSearchParams();
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // Get pagination params from URL
  const page = Number(searchParams.get("page")) || 0;
  const size = Number(searchParams.get("size")) || 10;

  // Apply filters to entitlements
  const filteredEntitlements = useMemo(() => {
    if (!filters) return entitlements;
    return applyFilters(entitlements, filters);
  }, [entitlements, filters]);

  const paginatedEntitlements = useMemo(() => {
    const startIndex = page * size;
    const endIndex = startIndex + size;
    return filteredEntitlements.slice(startIndex, endIndex);
  }, [filteredEntitlements, page, size]);

  const totalPages = Math.ceil(filteredEntitlements.length / size);

  const handleSelectAllOnPage = (checked: boolean | "indeterminate") => {
    const pageIds = paginatedEntitlements.map((e) => e.id);
    if (checked) {
      setSelectedRows((prev) => [...new Set([...prev, ...pageIds])]);
    } else {
      setSelectedRows((prev) => prev.filter((id) => !pageIds.includes(id)));
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedRows((prev) => [...prev, id]);
    } else {
      setSelectedRows((prev) => prev.filter((rowId) => rowId !== id));
    }
  };

  const paginatedIds = useMemo(
    () => paginatedEntitlements.map((e) => e.id),
    [paginatedEntitlements]
  );

  const selectedOnPageCount = useMemo(
    () => selectedRows.filter((id) => paginatedIds.includes(id)).length,
    [selectedRows, paginatedIds]
  );

  const headerCheckboxState: boolean | "indeterminate" =
    paginatedEntitlements.length > 0 &&
    selectedOnPageCount === paginatedEntitlements.length
      ? true
      : selectedOnPageCount > 0
      ? "indeterminate"
      : false;

  return {
    selectedRows,
    paginatedEntitlements,
    filteredEntitlements,
    totalPages,
    handleSelectAllOnPage,
    handleSelectRow,
    headerCheckboxState,
  };
};
