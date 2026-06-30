export interface ApiAuditLog {
  id: string;
  actorId: string | null;
  actorType: string;
  actorName: string;
  objectId: string | null;
  objectType: string;
  event: string;
  status: "success" | "failure" | "pending";
  risk: "low" | "medium" | "high" | "critical";
  timestamp: string | number; // Updated to support both ISO strings and epoch timestamps
  details: {
    message?: string;
    ipAddress?: string;
    userAgent?: string;
    identifier?: string;
    [key: string]: unknown;
  };
  stateBefore: Record<string, unknown>;
  stateAfter: Record<string, unknown>;
  metadata: Record<string, unknown>;
  errorDetails?: string | null;
  governance: {
    owner: string | null;
    department: string | null;
  };
  targetObject: {
    type: string;
    objectId?: string;
    objectName?: string;
    [key: string]: unknown;
  };
}

export interface AuditLogFilters {
  event?: string; // Changed from eventType
  objectType?: string;
  excludeObjectType?: string; // Comma-separated list of objectTypes to exclude
  risk?: string; // Changed from riskLevel
  status?: string; // New status filter
  search?: string; // Changed from searchTerm to search
  dateFrom?: string; // New date from filter
  dateTo?: string; // New date to filter
  page?: number;
  size?: number;
}

export interface AuditLogResponse {
  logs: {
    content: ApiAuditLog[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
    pageable: {
      pageNumber: number;
      pageSize: number;
      sort: {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
      };
      offset: number;
      paged: boolean;
      unpaged: boolean;
    };
    numberOfElements: number;
    empty: boolean;
  };
  availableEvents: string[];
  availableObjectTypes: string[];
  availableRisks: string[];
  availableStatuses: string[]; // New available statuses
}

// Transformed interface for UI compatibility
export interface TransformedAuditLog {
  id: string;
  timestamp: string | number; // Updated to support both ISO strings and epoch timestamps
  eventType: string;
  objectType: string;
  objectId: string | null;
  objectName: string;
  actor: {
    id: string | null;
    name: string;
    type: string;
  };
  target?: {
    id: string | null;
    name: string;
    type: string;
  };
  description: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  ipAddress?: string;
  location?: string;
  userAgent?: string;
  sessionId?: string;
  correlationId?: string;
  complianceFlags: string[];
  metadata: Record<string, unknown>;
  beforeState?: Record<string, unknown>;
  afterState?: Record<string, unknown>;
  outcome: "success" | "failure" | "pending";
  errorMessage?: string;
  resourceOwner?: string;
  department?: string;
}

export interface AuditLogsContextType {
  // Filter states
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  
  pendingSearchTerm: string;
  setPendingSearchTerm: (value: string) => void;
  commitSearch: (value?: string) => void;

  selectedEventTypes: string[];
  setSelectedEventTypes: (value: string[]) => void;
  selectedObjectTypes: string[];
  setSelectedObjectTypes: (value: string[]) => void;
  selectedRiskLevels: string[];
  setSelectedRiskLevels: (value: string[]) => void;
  selectedStatuses: string[];
  setSelectedStatuses: (value: string[]) => void;
  dateFrom: string; // New date from filter
  setDateFrom: (value: string) => void;
  dateTo: string; // New date to filter
  setDateTo: (value: string) => void;

  // Pagination states
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void; // New page size setter
  totalPages: number;
  totalElements: number;

  // Filter options from backend
  availableEvents: string[];
  availableObjectTypes: string[];
  availableRisks: string[];
  availableStatuses: string[]; // New available statuses

  // UI states
  expandedRows: Set<string>;
  toggleRowExpansion: (logId: string) => void;

  // Selection states
  selectedRows: Set<string>;
  toggleRowSelection: (logId: string) => void;
  selectAllRows: () => void;
  clearAllSelections: () => void;
  isAllSelected: boolean;
  isPartiallySelected: boolean;

  // API data
  logs: TransformedAuditLog[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  exportLogs: (format: "csv" | "json") => void;
  exportSingleLog: (log: TransformedAuditLog, format: "csv" | "json") => void;
  exportSelectedLogs: (selectedLogs: TransformedAuditLog[], format: "csv" | "json") => void;

  // Computed values
  totalLogs: number;
  criticalEvents: number;
  failures: number;
}
