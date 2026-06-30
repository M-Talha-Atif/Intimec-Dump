"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
  useCallback,
} from "react";
import {
  getPinnedLogs,
  createPinnedLog,
  deletePinnedLog,
  type PinnedLogResponse,
  resolvePinnedLog,
  getResolvedLogs,
  deleteResolvedLog,
} from "@/lib/pinned-logs";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { NormalizedFilterState } from "@/types/filters";

// --- TYPES ---

// pin Item
export interface PinnedLogItem {
  documentId: string;
  name: string;
  description: string;
  data: LogItem;
  updatedAt: number | null;
  pinnerId: string | null;
  pinnedAt: number | null;
  resolvedAt: number | null;
  updatedBy: string | null;
  resolved: boolean | null;
  pinned: boolean | null;
  resolvedBy?: string | null;
}
export interface LogItem {
  documentId: string;
  id: string;
  timestamp: string;
  description: string;
  level: string;
  source: string;
  category: string;
  objectType: string;
  objectId: string;
  message: string;
  correlationId: string;
  details: RawLogData;
}

export interface DebugFiltersType {
  eventType: string[];
  objectType: string[];
  source: string[];
  timeRange: string;
}

// New interface for the logs search API request
interface LogsSearchRequest {
  globalSearch?: string;
  level?: string[];
  microservice?: string[];
  objectType?: string[];
  category?: string;
  customFields?: Record<string, unknown>;
  dateFrom?: number;
  dateTo?: number;
  page: number;
  size: number;
  sortBy: string;
  sortOrder: string;
}

// Interface for log data from API
interface RawLogData {
  documentId: string;
  level: string;
  source: string;
  microservice: string;
  category: string;
  message: string;
  timestamp: number;
  isPinned: boolean;
  pinnerId: string;
  pinnedAt: number;
  pinnedName: string;
  pinnedDescription: string;
  isResolved: boolean;
  resolverId: string;
  resolvedAt: number;
  correlationId: string;
  id: string;
  // Keep the old fields for backward compatibility if needed
  _id?: string;
  "@timestamp"?: string;
  objectType?: string;
  "object.type"?: string;
  objectId?: string;
  "object.id"?: string;
  "trace.id"?: string;
  [key: string]: unknown;
}

// Interface for the logs search API response
interface LogsSearchResponse {
  logs: RawLogData[];
  pagination: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  queryMetadata: {
    executionTimeMs: number;
    shardsTotal: number;
    shardsSuccessful: number;
    shardsFailed: number;
    timedOut: boolean;
  };
}

// pin Item
// export interface PinnedLogItem {
//   documentId: string;
//   name: string;
//   description: string;
//   data: LogItem;
//   updatedAt: number | null;
//   pinnerId: string | null;
//   pinnedAt: number | null;
//   resolvedAt: number | null;
//   updatedBy: string | null;
//   resolved: boolean | null;
//   pinned: boolean | null;
// }
// --- TRANSFORM FUNCTION ---

// --- HELPER FUNCTION for time conversion ---
const calculateStartTime = (timeRange: string): number | null => {
  if (!timeRange) return null; // No time filter when empty

  const now = Date.now();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  switch (timeRange) {
    case "15m":
      return now - 15 * minute;
    case "1h":
      return now - 1 * hour;
    case "6h":
      return now - 6 * hour;
    case "24h":
      return now - 24 * hour;
    case "7d":
      return now - 7 * day;
    default:
      return null;
  }
};

// --- CONSTANTS ---
const DEFAULT_PAGE_SIZE = 25; // Default number of logs to fetch per request

// Pagination interface
export interface PaginationState {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// --- CONTEXT TYPE ---
export interface DebuggingContextType {
  // State
  isExporting: boolean;

  isLiveMode: boolean;
  activeTab: string;
  searchQuery: string;
  selectedFilters: DebugFiltersType;
  logs: LogItem[];
  loading: boolean;
  searchLoading: boolean;
  pinnedLoading: boolean;
  resolvedLoading: boolean;
  error: string | null;
  pinnedItems: PinnedLogItem[];
  resolvedItems: PinnedLogItem[];
  showPinnedModal: boolean;
  showResolvedModal: boolean;
  showPinModal: boolean;
  logToPin: LogItem | null;
  connectionStatus: "connected" | "connecting" | "disconnected";

  // Pagination
  pagination: PaginationState;

  // Actions
  UnPinnedLog: (id: string) => Promise<void>;
  UnResolvedLog: (id: string) => Promise<void>;
  exportLogsAsJson: () => void;
  exportLogsAsCsv: () => void;

  setIsLiveMode: (value: boolean) => void;
  setActiveTab: (tab: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedFilters: (filters: DebugFiltersType) => void;
  setShowPinnedModal: (show: boolean) => void;
  setShowResolvedModal: (show: boolean) => void;
  handleResolvePinnedItem: (itemId: string) => void;
  handleUpdatePinnedItem: (
    itemId: string,
    newDescription: string
  ) => Promise<boolean>;
  handlePinLog: (logId: string) => void;
  handlePinSubmit: (name: string, description: string) => void;
  closePinModal: () => void;
  refreshLogs: () => Promise<void>;
  isLogPinned: (logId: string) => boolean;

  // Pagination actions
  goToPage: (page: number) => void;
  changePageSize: (size: number) => void;
}

function convertNormalizedFiltersToDebugFilters(
  filters: NormalizedFilterState
): DebugFiltersType {
  const debugFilters: DebugFiltersType = {
    eventType: filters.level || [],
    objectType: filters.objectType || [],
    source: filters.source || [],
    timeRange: filters.timeRange?.[0] || "", // Take first value as radio selection
  };
  return debugFilters;
}

// --- CONTEXT ---
const DebuggingContext = createContext<DebuggingContextType | null>(null);

export function DebuggingProvider({ children }: { children: ReactNode }) {
  // --- STATE MANAGEMENT ---
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [activeTab, setActiveTab] = useState("all-logs");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const searchParams = useSearchParams();
  const [selectedFilters, setSelectedFilters] = useState<DebugFiltersType>({
    eventType: [],
    objectType: [],
    source: [],
    timeRange: "",
  });

  const [logs, setLogs] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(false); // Start with false to show page structure
  const [searchLoading, setSearchLoading] = useState(false); // Track search-specific loading
  const [pinnedLoading, setPinnedLoading] = useState(false); // Track pinned items loading
  const [resolvedLoading, setResolvedLoading] = useState(false); // Track resolved items loading
  const [error, setError] = useState<string | null>(null);
  const [pinnedItems, setPinnedItems] = useState<PinnedLogItem[]>([]);
  const [resolvedItems, setResolvedItems] = useState<PinnedLogItem[]>([]);
  const [showPinnedModal, setShowPinnedModal] = useState(false);
  const [showResolvedModal, setShowResolvedModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [logToPin, setLogToPin] = useState<LogItem | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "connecting" | "disconnected"
  >("disconnected");
  const [isExporting, setIsExporting] = useState(false);

  // Pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    page: 0,
    size: DEFAULT_PAGE_SIZE,
    totalElements: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false,
  });

  // NOTE: Pagination state is removed from the context.

  useEffect(() => {
    const NormalizedFilters: NormalizedFilterState = {};
    searchParams.entries().forEach(([key, value]) => {
      if (key.startsWith("filter_")) {
        const filterKey = key.replace("filter_", "");
        if (!NormalizedFilters[filterKey]) {
          NormalizedFilters[filterKey] = [];
        }
        NormalizedFilters[filterKey].push(value);
      }
    });

    const searchQuery = searchParams.get("search") || "";
    setSearchQuery(searchQuery);

    // Handle pagination from URL
    const page = Number(searchParams.get("page")) || 0;
    const size = Number(searchParams.get("size")) || DEFAULT_PAGE_SIZE;
    setPagination((prev) => ({
      ...prev,
      page,
      size,
    }));

    setSelectedFilters((prevFilters) => {
      const newFilters =
        convertNormalizedFiltersToDebugFilters(NormalizedFilters);
      // Only update if there are changes to avoid unnecessary re-renders
      return JSON.stringify(prevFilters) !== JSON.stringify(newFilters)
        ? newFilters
        : prevFilters;
    });
  }, [searchParams]);

  const exportLogsAsJson = () => {
    if (isExporting) return;

    setIsExporting(true);
    try {
      // Prepare the data for export
      const exportData = {
        exportedAt: new Date().toISOString(),
        filters: selectedFilters,
        searchQuery: debouncedSearchQuery,
        totalLogs: logs.length,
        logs: logs.map((log) => ({
          // Export all LogItem fields
          documentId: log.documentId,
          id: log.id,
          timestamp: log.timestamp,
          level: log.level,
          source: log.source,
          category: log.category,
          objectType: log.objectType,
          objectId: log.objectId && log.objectId !== "N/A" ? log.objectId : "",
          correlationId:
            log.correlationId && log.correlationId !== "N/A"
              ? log.correlationId
              : "",
          message: log.message,
          description: log.description,
          // Export all raw data details
          details: log.details,
          // Also flatten important fields from details for easier access
          rawTimestamp: log.details.timestamp,
          microservice: log.details.microservice,
          isPinned: log.details.isPinned,
          pinnerId: log.details.pinnerId,
          pinnedAt: log.details.pinnedAt,
          pinnedName: log.details.pinnedName,
          pinnedDescription: log.details.pinnedDescription,
          isResolved: log.details.isResolved,
          resolverId: log.details.resolverId,
          resolvedAt: log.details.resolvedAt,
          // Include any additional fields from the raw data
          ...Object.keys(log.details).reduce((acc, key) => {
            // Only include fields that aren't already explicitly mapped above
            if (
              ![
                "documentId",
                "level",
                "source",
                "microservice",
                "category",
                "message",
                "timestamp",
                "isPinned",
                "pinnerId",
                "pinnedAt",
                "pinnedName",
                "pinnedDescription",
                "isResolved",
                "resolverId",
                "resolvedAt",
                "correlationId",
                "id",
              ].includes(key)
            ) {
              acc[key] = log.details[key];
            }
            return acc;
          }, {} as Record<string, unknown>),
        })),
      };

      // Convert to JSON string
      const jsonString = JSON.stringify(exportData, null, 2);

      // Create blob and download
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      // Create download link
      const link = document.createElement("a");
      link.href = url;

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      link.download = `debug-logs-${timestamp}.json`;

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Successfully exported ${logs.length} logs`);
    } catch (error) {
      console.error("Error exporting logs:", error);
      toast.error("Failed to export logs", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportLogsAsCsv = () => {
    if (isExporting) return;

    setIsExporting(true);
    try {
      // Prepare CSV headers
      const headers = [
        "ID",
        "Timestamp",
        "Level",
        "Source",
        "Category",
        "Object Type",
        "Object ID",
        "Correlation ID",
        "Message",
        "Description",
      ];

      // Convert logs to CSV format
      const csvRows = [
        headers.join(","), // Header row
        ...logs.map((log) =>
          [
            `"${log.id}"`,
            `"${log.timestamp}"`,
            `"${log.level}"`,
            `"${log.source}"`,
            `"${log.category}"`,
            `"${log.objectType}"`,
            `"${log.objectId && log.objectId !== "N/A" ? log.objectId : ""}"`,
            `"${log.correlationId && log.correlationId !== "N/A"
              ? log.correlationId
              : ""
            }"`,
            `"${log.message.replace(/"/g, '""')}"`, // Escape quotes
            `"${log.description.replace(/"/g, '""')}"`, // Escape quotes
          ].join(",")
        ),
      ];

      const csvString = csvRows.join("\n");

      // Create blob and download
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);

      // Create download link
      const link = document.createElement("a");
      link.href = url;

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      link.download = `debug-logs-${timestamp}.csv`;

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Successfully exported ${logs.length} logs as CSV`);
    } catch (error) {
      console.error("Error exporting logs as CSV:", error);
      toast.error("Failed to export logs as CSV", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // --- DATA FETCHING ---
  const fetchLogs = useCallback(async () => {
    // Don't show loading spinner during live mode polling
    if (!isLiveMode) {
      setLoading(true);
    }
    setError(null);

    // console.log("Current filters:", selectedFilters);
    // console.log("Search query:", debouncedSearchQuery);

    // Calculate date range from timeRange filter
    const startTime = calculateStartTime(selectedFilters.timeRange);
    const endTime = Date.now(); // Current time as end

    // Build the new API request body
    const requestBody: LogsSearchRequest = {
      page: pagination.page,
      size: pagination.size,
      sortBy: "@timestamp",
      sortOrder: "DESC",
    };

    // Add global search if present
    if (debouncedSearchQuery) {
      requestBody.globalSearch = debouncedSearchQuery;
    }

    // Add level filter (map eventType to level) - always as array
    if (selectedFilters.eventType.length > 0) {
      requestBody.level = selectedFilters.eventType;
    }

    // Add microservice filter (map source to microservice) - always as array
    if (selectedFilters.source.length > 0) {
      requestBody.microservice = selectedFilters.source;
    }

    // Add objectType filter if present - always as array
    if (selectedFilters.objectType.length > 0) {
      requestBody.objectType = selectedFilters.objectType;
    }

    // Add objectType filter based on active tab
    switch (activeTab) {
      case "connector-logs":
        requestBody.objectType = ["connector"];
        break;
      case "workflow-logs":
        // All workflow logs have source containing "workflow" (case-insensitive wildcard)
        // This captures: com.aidentx.workflowsservice.*, WorkflowAuditAspect, WorkflowAuditPublisher, etc.
        requestBody.customFields = {
          source: "*workflow*",
        };
        break;

      case "access-portal-logs":
        requestBody.customFields = {
          source: "*access_portal*",
        };
        break;
      case "access-events":
        // You can add specific filter for access events if needed
        // requestBody.objectType = ["access"];
        break;
      case "all-logs":
      default:
        // Don't override if filters are already set
        break;
    }

    // Add date range if available
    if (startTime) {
      requestBody.dateFrom = startTime;
      requestBody.dateTo = endTime;
    }

    console.log(
      "Sending request to logs API:",
      JSON.stringify(requestBody, null, 2)
    );

    try {
      const response = await fetch("/api/logs/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      console.log("Search response:")
      console.log(response)

      if (!response.ok) {
        const errorData = await response.json();
        console.log(errorData.details?.reason || "Failed to fetch logs");
        setError(errorData.details?.reason || "Failed to fetch logs");
        return;
      }

      const data: LogsSearchResponse = await response.json();
      console.log("Logs API response:", data);

      // Transform the response to match our LogItem interface
      // The API returns { logs: [], pagination: {}, queryMetadata: {} }
      let fetchedLogs: LogItem[] = [];

      if (data.logs && Array.isArray(data.logs)) {
        fetchedLogs = data.logs.map(
          (log: RawLogData): LogItem => ({
            documentId: log.documentId || "",
            id: log.id || "",
            timestamp: log.timestamp ? log.timestamp.toString() : "",
            level: log.level ?? "UNKNOWN",
            source: log.source || log.microservice || "N/A",
            category: log.category || "general",
            objectType: log.objectType || log["object.type"] || "N/A",
            objectId: log.objectId || log["object.id"] || "N/A",
            correlationId: log.correlationId || log["trace.id"] || "N/A",
            message: log.message || "No message",
            details: log,
            description: log.message || "No message",
          })
        );

        await fetchPinnedItems();
        await fetchResolvedItems();
      }

      // Log pagination and query metadata for debugging
      if (data.pagination) {
        console.log("Pagination info:", data.pagination);
        // Only update pagination metadata, not page/size (those come from URL)
        setPagination((prev) => ({
          ...prev,
          totalElements: data.pagination.totalElements,
          totalPages: data.pagination.totalPages,
          hasNext: data.pagination.hasNext,
          hasPrevious: data.pagination.hasPrevious,
          // Keep the page and size from URL/state, don't overwrite from API
        }));
      }
      if (data.queryMetadata) {
        console.log("Query metadata:", data.queryMetadata);
      }

      // console.log("Transformed logs:", fetchedLogs);
      setLogs(fetchedLogs);
    } catch (err: unknown) {
      console.error("Error fetching logs:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      // Only hide loading spinner when not in live mode
      if (!isLiveMode) {
        setLoading(false);
      }
    }
  }, [
    isLiveMode,
    activeTab,
    selectedFilters.timeRange,
    selectedFilters.eventType,
    selectedFilters.objectType,
    selectedFilters.source,
    debouncedSearchQuery,
    pagination.page,
    pagination.size,
  ]);

  const fetchPinnedItems = async () => {
    setPinnedLoading(true);
    try {
      const response = await getPinnedLogs();

      const items = response;
      setPinnedItems(items);
    } catch (error: unknown) {
      console.error("Error fetching pinned items:", error);
    } finally {
      setPinnedLoading(false);
    }
  };

  // delete a resolved log
  const UnResolvedLog = async (id: string): Promise<void> => {
    try {
      const { unresolvedAt } = await deleteResolvedLog(id);
      const item = resolvedItems.find((item) => item.documentId === id);
      setResolvedItems((prev) => prev.filter((item) => item.documentId !== id));
      // return it in pinned items
      if (item) {
        setPinnedItems((prev) => [
          ...prev,
          {
            ...item,
            resolved: false,
            resolvedAt: 0,
            updatedAt: unresolvedAt,
          },
        ]);
      }
      toast.success("Resolved log deleted successfully");
    } catch (error: unknown) {
      console.error("Error deleting resolved log:", error);
      toast.error("Failed to delete resolved log", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  // delete a pinned log
  const UnPinnedLog = async (id: string): Promise<void> => {
    try {
      await deletePinnedLog(id);
      // Remove from pinned items
      setPinnedItems((prev) => prev.filter((item) => item.documentId !== id));

      toast.success("Pinned log deleted successfully");
    } catch (error: unknown) {
      console.error("Error deleting Pinned log:", error);
      toast.error("Failed to delete Pinned log", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  // Fetch resolved items

  const fetchResolvedItems = async () => {
    setResolvedLoading(true);
    try {
      const items = await getResolvedLogs();
      console.log("Fetched resolved items:", items);

      setResolvedItems(items);
    } catch (error: unknown) {
      console.error("Error fetching resolved items:", error);
    } finally {
      setResolvedLoading(false);
    }
  };

  // Debounce search query to avoid too many API calls
  useEffect(() => {
    if (searchQuery) {
      setSearchLoading(true); // Only show loading if there's actually a search query
    }
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setSearchLoading(false); // Hide loading after debounce
    }, 300);
    return () => {
      clearTimeout(timer);
      setSearchLoading(false);
    };
  }, [searchQuery]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    fetchPinnedItems();
    fetchResolvedItems();
  }, []);

  useEffect(() => {
    if (!isLiveMode) {
      setConnectionStatus("disconnected");
      return;
    }

    console.log("Starting live mode polling every 500ms");
    setConnectionStatus("connecting");

    // In live mode, reset to first page to see the latest logs
    setPagination((prev) => ({ ...prev, page: 0 }));

    // Initial fetch to establish connection
    fetchLogs()
      .then(() => {
        setConnectionStatus("connected");
      })
      .catch(() => {
        setConnectionStatus("disconnected");
      });

    // Set up polling interval
    const pollInterval = setInterval(async () => {
      if (isLiveMode) {
        try {
          await fetchLogs();
          setConnectionStatus("connected");
        } catch (error) {
          console.error("Live mode polling error:", error);
          setConnectionStatus("disconnected");
        }
      }
    }, 500);

    return () => {
      clearInterval(pollInterval);
      setConnectionStatus("disconnected");
    };
  }, [isLiveMode, activeTab, fetchLogs]);

  const handleResolvePinnedItem = async (itemId: string) => {
    try {
      const now = Date.now();
      setPinnedItems((prev) =>
        prev.filter((item) => item.documentId !== itemId)
      );
      toast.success("Pinned item resolved successfully");
      const resolvedItem = await resolvePinnedLog(itemId);
      setResolvedItems((prev) => [
        {
          ...pinnedItems.find((item) => item.documentId === itemId)!,
          resolved: true,
          resolvedAt: now,
          updatedAt: now,
          resolvedBy: resolvedItem?.resolverId,
          updatedBy: resolvedItem?.resolverId,
        },
        ...prev,
      ]);
    } catch (error: unknown) {
      console.error("Error deleting pinned item:", error);
      toast.error("Failed to resolve pinned item", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };
  const transformPinnedResponseToItem = (
    response: PinnedLogResponse
  ): PinnedLogItem => {
    // Use any for flexible field access
    const now = Date.now();

    return {
      documentId: response.documentId,
      data: logToPin as LogItem,
      name: response.name,
      description: response.description,
      pinned: response.pinned ?? true,
      pinnedAt: response.pinnedAt ?? now,
      pinnerId: "current_user", // Replace with actual user ID from auth context
      resolved: response.resolved ?? false,
      resolvedAt: response.resolvedAt,
      updatedAt: now,
      updatedBy: "current_user", // Replace with actual user ID from auth context
    };
  };

  const handleUpdatePinnedItem = async (
    itemId: string,
    newDescription: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      // Send PATCH request to update description
      const response = await fetch(`/api/logs/pin/${itemId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: newDescription,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update description");
      }
      const updatedItem = await response.json();

      console.log("API Response - Updated item:", updatedItem);

      const now = Date.now();
      setPinnedItems((prevItems) =>
        prevItems.map((item) =>
          item.documentId === itemId
            ? {
              ...item,
              description: newDescription,
              updatedAt: now,
              updatedBy: "current_user", // Replace with actual user ID from auth context
            }
            : item
        )
      );
    } catch (err) {
      console.error("Error updating description:", err);
      setError(
        err instanceof Error ? err.message : "Failed to update description"
      );
    } finally {
      setLoading(false);
      return true;
    }
  };

  const handlePinLog = (logId: string) => {
    const log = logs.find((l) => l.documentId === logId);
    if (log) {
      setLogToPin(log as LogItem);
      setShowPinModal(true);
    }
  };

  const handlePinSubmit = async (name: string, description: string) => {
    if (logToPin) {
      try {
        const pinnedLogRequest = {
          documentId: logToPin.documentId,
          name: name || logToPin.message,
          description:
            description ||
            `${logToPin.category}: ${logToPin.objectType && logToPin.objectType !== "N/A"
              ? logToPin.objectType
              : "Unknown"
            }:${logToPin.objectId && logToPin.objectId !== "N/A"
              ? logToPin.objectId
              : "Unknown"
            } - ${logToPin.source}`,
          // data: { ...logToPin },
        };
        const response = await createPinnedLog(pinnedLogRequest);
        const newPinnedItem = transformPinnedResponseToItem(response);
        // console.log("Created new pinned item:", newPinnedItem);
        setPinnedItems((prev) => [newPinnedItem, ...prev]);
        setShowPinModal(false);
        setLogToPin(null);
        toast.success("Log pinned successfully");
      } catch (error: unknown) {
        console.error("Error creating pinned item:", error);
        toast.error("Failed to pin log", {
          description: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  };

  const closePinModal = () => {
    setShowPinModal(false);
    setLogToPin(null);
  };

  const refreshLogs = async () => {
    await fetchLogs();
    await fetchPinnedItems();
  };

  const isLogPinned = (logId: string): boolean => {
    // First check if the log itself has isPinned flag from the API
    // const log = logs.find((l) => l.id === logId);
    // if (
    //   log &&
    //   log.details &&
    //   typeof log.details === "object" &&
    //   "isPinned" in log.details
    // ) {
    //   return Boolean(log.details.isPinned);
    // }

    // Fallback to checking pinnedItems array
    // console.log("pinnedItems:", pinnedItems);
    return pinnedItems?.some((pinnedItem) => pinnedItem?.documentId === logId);
  };

  // Pagination actions - these will be called when URL params change
  const goToPage = (page: number) => {
    // URL updates are handled by CustomPagination, we just need to update our state
    setPagination((prev) => ({ ...prev, page }));
  };

  const changePageSize = (size: number) => {
    // URL updates are handled by CustomPagination, we just need to update our state
    setPagination((prev) => ({ ...prev, size, page: 0 })); // Reset to first page when changing size
  };

  const value: DebuggingContextType = {
    // State
    isExporting,
    isLiveMode,
    activeTab,
    searchQuery,
    selectedFilters,
    logs,
    loading,
    searchLoading,
    pinnedLoading,
    resolvedLoading,
    error,
    pinnedItems,
    resolvedItems,
    showPinnedModal,
    showResolvedModal,
    showPinModal,
    logToPin,
    connectionStatus,
    pagination,

    // Actions
    UnPinnedLog,
    UnResolvedLog,
    exportLogsAsJson,
    exportLogsAsCsv,
    setIsLiveMode,
    setActiveTab,
    setSearchQuery,
    setSelectedFilters,
    setShowPinnedModal,
    setShowResolvedModal,
    handleResolvePinnedItem,
    handleUpdatePinnedItem,
    handlePinLog,
    handlePinSubmit,
    closePinModal,
    refreshLogs,
    isLogPinned,
    goToPage,
    changePageSize,
  };

  return (
    <DebuggingContext.Provider value={value}>
      {children}
    </DebuggingContext.Provider>
  );
}

export function useDebugging() {
  const context = useContext(DebuggingContext);
  if (!context) {
    throw new Error("useDebugging must be used within a DebuggingProvider");
  }
  return context;
}
