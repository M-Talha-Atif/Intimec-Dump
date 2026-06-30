"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuditLogs } from "@/hooks/useAuditLogs";
import type { AuditLogFilters, AuditLogsContextType } from "@/types/audit-logs";

const AuditLogsContext = createContext<AuditLogsContextType | undefined>(
  undefined
);

interface AuditLogsProviderProps {
  children: ReactNode;
  initialEventTypes?: string[];
  initialObjectTypes?: string[];
  initialRiskLevels?: string[];
  initialStatuses?: string[];
}

export function AuditLogsProvider({
  children,
  initialEventTypes = [],
  initialObjectTypes = [],
  initialRiskLevels = [],
  initialStatuses = [],
}: AuditLogsProviderProps) {
  const [searchTerm, setSearchTerm] = useState("");         // committed value -> goes to API
  const [pendingSearchTerm, setPendingSearchTerm] = useState(""); // live input value
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>(initialEventTypes);
  const [selectedObjectTypes, setSelectedObjectTypes] = useState<string[]>(initialObjectTypes);
  const [selectedRiskLevels, setSelectedRiskLevels] = useState<string[]>(initialRiskLevels);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(initialStatuses);
  const [dateFrom, setDateFrom] = useState<string>(""); // New date from filter
  const [dateTo, setDateTo] = useState<string>(""); // New date to filter
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25); // Now configurable

  // Mapping-configuration object types are shown only in the Identity Mapping
  // Audit Trail tab, not in the main Audit Logs page.
  const EXCLUDED_OBJECT_TYPES = "Attribute Mapping,Correlation Rule";

  // Create filters object for the API
  const filters: AuditLogFilters = useMemo(
    () => ({
      event: selectedEventTypes.length > 0 ? selectedEventTypes.join(",") : undefined,
      objectType: selectedObjectTypes.length > 0 ? selectedObjectTypes.join(",") : undefined,
      // Exclude mapping config events from the main page unless the user explicitly
      // filters for them via the objectType dropdown.
      excludeObjectType: selectedObjectTypes.length === 0 ? EXCLUDED_OBJECT_TYPES : undefined,
      risk: selectedRiskLevels.length > 0 ? selectedRiskLevels.join(",") : undefined,
      status: selectedStatuses.length > 0 ? selectedStatuses.join(",") : undefined,
      search: searchTerm || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      page: currentPage - 1, // Backend uses 0-based pagination
      size: pageSize,
    }),
    [searchTerm, selectedEventTypes, selectedObjectTypes, selectedRiskLevels, selectedStatuses, dateFrom, dateTo, currentPage, pageSize]
  );

  // Use your existing API hook
  const {
    logs,
    loading,
    error,
    refetch,
    exportLogs,
    exportSingleLog,
    exportSelectedLogs,
    pagination,
    availableEvents,
    availableObjectTypes,
    availableRisks,
    availableStatuses
  } = useAuditLogs(filters);

  const toggleRowExpansion = (logId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedRows(newExpanded);
  };

  // Selection handlers
  const toggleRowSelection = (logId: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(logId)) {
      newSelected.delete(logId);
    } else {
      newSelected.add(logId);
    }
    setSelectedRows(newSelected);
  };

  const selectAllRows = () => {
    const allIds = new Set(logs.map(log => log.id));
    setSelectedRows(allIds);
  };

  const clearAllSelections = () => {
    setSelectedRows(new Set());
  };

  const isAllSelected = logs.length > 0 && selectedRows.size === logs.length;
  const isPartiallySelected = selectedRows.size > 0 && selectedRows.size < logs.length;

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Filter handlers that reset to page 1
  const handleEventTypesChange = (events: string[]) => {
    setSelectedEventTypes(events);
    setCurrentPage(1);
  };

  const handleObjectTypesChange = (objectTypes: string[]) => {
    setSelectedObjectTypes(objectTypes);
    setCurrentPage(1);
  };

  const handleRiskLevelsChange = (risks: string[]) => {
    setSelectedRiskLevels(risks);
    setCurrentPage(1);
  };

  const handleStatusesChange = (statuses: string[]) => {
    setSelectedStatuses(statuses);
    setCurrentPage(1);
  };

  const handleDateFromChange = (date: string) => {
    setDateFrom(date);
    setCurrentPage(1);
  };

  const handleDateToChange = (date: string) => {
    setDateTo(date);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const commitSearch = (value?: string) => {
    const term = value !== undefined ? value : pendingSearchTerm;
    setSearchTerm(term);
    setCurrentPage(1);
  };

  // Computed values - now based on backend pagination data
  const totalElements = pagination?.totalElements || 0;
  const totalPages = pagination?.totalPages || 0;
  const criticalEvents = logs.filter(
    (log) => log.riskLevel === "critical"
  ).length;
  const failures = logs.filter((log) => log.outcome === "failure").length;

  const contextValue: AuditLogsContextType = {
    // Filter states
    searchTerm,
    setSearchTerm,
    pendingSearchTerm,
    setPendingSearchTerm,
    commitSearch,
    selectedEventTypes,
    setSelectedEventTypes: handleEventTypesChange,
    selectedObjectTypes,
    setSelectedObjectTypes: handleObjectTypesChange,
    selectedRiskLevels,
    setSelectedRiskLevels: handleRiskLevelsChange,
    selectedStatuses,
    setSelectedStatuses: handleStatusesChange,
    dateFrom,
    setDateFrom: handleDateFromChange,
    dateTo,
    setDateTo: handleDateToChange,

    // Pagination states
    currentPage,
    setCurrentPage: handlePageChange,
    pageSize,
    setPageSize: handlePageSizeChange,
    totalPages,
    totalElements,

    // Filter metadata from backend
    availableEvents: availableEvents || [],
    availableObjectTypes: availableObjectTypes || [],
    availableRisks: availableRisks || [],
    availableStatuses: availableStatuses || [],

    // UI states
    expandedRows,
    toggleRowExpansion,

    // Selection states
    selectedRows,
    toggleRowSelection,
    selectAllRows,
    clearAllSelections,
    isAllSelected,
    isPartiallySelected,

    // API data
    logs,
    loading,
    error,
    refetch,
    exportLogs,
    exportSingleLog,
    exportSelectedLogs,

    // Computed values
    totalLogs: totalElements, // For backward compatibility
    criticalEvents,
    failures,
  };

  return (
    <AuditLogsContext.Provider value={contextValue}>
      {children}
    </AuditLogsContext.Provider>
  );
}

export function useAuditLogsContext() {
  const context = useContext(AuditLogsContext);
  if (context === undefined) {
    throw new Error(
      "useAuditLogsContext must be used within an AuditLogsProvider"
    );
  }
  return context;
}
