import { IdentityType } from "./identity-mapping";

// One mapped attribute or correlation condition extracted from stateAfter/stateBefore
export interface MappingDetail {
  identity: string;       // identity-side attribute key
  source: string;         // account/source attribute key or expression
  transformation?: string; // e.g. UPPERCASE, DIRECT, SCRIPT
  sourceApp?: string;     // connector/application name or ID
}

// One condition inside a correlation ruleGroup
export interface CorrelationCondition {
  field: string;         // identity attribute
  operator: string;      // =, contains, startsWith, …
  value: string;         // account attribute key
}

// Full raw audit log from the backend (kept on the entry for the detail panel)
export interface RawAuditLog {
  id: string;
  actorName?: string;
  actorType?: string;
  event?: string;
  objectType?: string;
  objectId?: string;
  timestamp?: string;
  status?: string;
  risk?: string;
  details?: Record<string, unknown>;
  stateBefore?: unknown;
  stateAfter?: unknown;
  metadata?: Record<string, unknown>;
  errorDetails?: string;
  tenantId?: string;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: "CREATE" | "UPDATE" | "DELETE" | "BULK_UPDATE" | "SYNC";
  user: string;
  userRole: string;
  /** Human-readable summary of what was mapped, e.g. "emailAddress → mail (5 attrs)" */
  mapping: string;
  /** Human-readable description of what changed */
  changes: string;
  sourceSystem: string;
  identityType: IdentityType;
  /** Count of identities/accounts potentially affected */
  impact: number;
  /** Deprecated plain-text details — use rawEntry instead */
  details: string;
  /** Full backend payload for the detail panel */
  rawEntry?: RawAuditLog;
  /** Extracted attribute/correlation details for before state */
  stateBefore?: MappingDetail[] | CorrelationCondition[];
  /** Extracted attribute/correlation details for after state */
  stateAfter?: MappingDetail[] | CorrelationCondition[];
  /** "Attribute Mapping" | "Correlation Rule" */
  entryType?: string;
}

export const mockAuditData: Record<IdentityType, AuditEntry[]> = {
  employee: [
    {
      id: "1",
      timestamp: "2024-07-10T14:30:25Z",
      action: "UPDATE",
      user: "Sarah Johnson",
      userRole: "IAM Administrator",
      mapping: "email → email",
      changes: "Added fallback value: noreply@company.com",
      sourceSystem: "HR System",
      identityType: "employee",
      impact: 1247,
      details:
        "Updated transformation rule to include fallback for missing email addresses",
    },
    {
      id: "2",
      timestamp: "2024-07-10T11:15:42Z",
      action: "CREATE",
      user: "Mike Chen",
      userRole: "Security Analyst",
      mapping: "department → department",
      changes: "Created new mapping with uppercase transformation",
      sourceSystem: "Active Directory",
      identityType: "employee",
      impact: 847,
      details: "New department mapping created to standardize department names",
    },
    {
      id: "3",
      timestamp: "2024-07-10T09:45:18Z",
      action: "DELETE",
      user: "Admin User",
      userRole: "System Administrator",
      mapping: "oldEmployeeId → employeeId",
      changes: "Removed deprecated mapping",
      sourceSystem: "Legacy HR",
      identityType: "employee",
      impact: 0,
      details: "Removed mapping for decommissioned legacy HR system",
    },
    {
      id: "4",
      timestamp: "2024-07-09T16:20:35Z",
      action: "BULK_UPDATE",
      user: "Sarah Johnson",
      userRole: "IAM Administrator",
      mapping: "Multiple mappings",
      changes: "Updated 5 mappings with new validation rules",
      sourceSystem: "Multiple",
      identityType: "employee",
      impact: 3542,
      details: "Bulk update to add regex validation to string attributes",
    },
    {
      id: "5",
      timestamp: "2024-07-09T13:10:22Z",
      action: "SYNC",
      user: "System",
      userRole: "Automated Process",
      mapping: "All active mappings",
      changes: "Synchronized mappings with source systems",
      sourceSystem: "All Sources",
      identityType: "employee",
      impact: 15247,
      details: "Scheduled synchronization completed successfully",
    },
    {
      id: "6",
      timestamp: "2024-07-09T10:30:15Z",
      action: "UPDATE",
      user: "HR Manager",
      userRole: "HR Administrator",
      mapping: "manager → manager",
      changes: "Updated manager resolution logic",
      sourceSystem: "Workday",
      identityType: "employee",
      impact: 2341,
      details:
        "Enhanced manager hierarchy resolution to handle complex org structures",
    },
  ],
  "non-human": [
    {
      id: "1",
      timestamp: "2024-07-10T14:30:25Z",
      action: "UPDATE",
      user: "Sarah Johnson",
      userRole: "IAM Administrator",
      mapping: "serviceAccountType → serviceAccountType",
      changes: "Added fallback value: generic",
      sourceSystem: "AWS IAM",
      identityType: "non-human",
      impact: 456,
      details:
        "Updated transformation rule to include fallback for missing service account types",
    },
    {
      id: "2",
      timestamp: "2024-07-10T11:15:42Z",
      action: "CREATE",
      user: "DevOps Lead",
      userRole: "Infrastructure Admin",
      mapping: "keyRotationStatus → keyRotationStatus",
      changes: "Created new mapping with status validation",
      sourceSystem: "Kubernetes",
      identityType: "non-human",
      impact: 234,
      details: "New key rotation mapping created to track compliance status",
    },
    {
      id: "3",
      timestamp: "2024-07-10T09:45:18Z",
      action: "DELETE",
      user: "Security Admin",
      userRole: "Security Administrator",
      mapping: "oldServiceId → serviceId",
      changes: "Removed deprecated mapping",
      sourceSystem: "Legacy AWS",
      identityType: "non-human",
      impact: 0,
      details: "Removed mapping for decommissioned legacy AWS accounts",
    },
    {
      id: "7",
      timestamp: "2024-07-09T08:45:30Z",
      action: "CREATE",
      user: "DevOps Lead",
      userRole: "Infrastructure Admin",
      mapping: "keyRotationStatus → keyRotationStatus",
      changes: "Added key rotation status mapping",
      sourceSystem: "AWS IAM",
      identityType: "non-human",
      impact: 156,
      details: "New mapping to track service account key rotation compliance",
    },
  ],
  "non-employee": [
    {
      id: "1",
      timestamp: "2024-07-10T14:30:25Z",
      action: "UPDATE",
      user: "Vendor Manager",
      userRole: "Vendor Administrator",
      mapping: "contractExpiry → accessExpiry",
      changes: "Added contract validation logic",
      sourceSystem: "Contractor Portal",
      identityType: "non-employee",
      impact: 234,
      details: "Updated transformation rule to validate contract expiry dates",
    },
    {
      id: "2",
      timestamp: "2024-07-10T11:15:42Z",
      action: "CREATE",
      user: "HR Coordinator",
      userRole: "HR Specialist",
      mapping: "sponsorId → sponsor",
      changes: "Created new sponsor mapping with validation",
      sourceSystem: "Vendor Management System",
      identityType: "non-employee",
      impact: 145,
      details: "New sponsor mapping created to track contractor relationships",
    },
    {
      id: "8",
      timestamp: "2024-07-09T07:15:45Z",
      action: "UPDATE",
      user: "Vendor Manager",
      userRole: "Vendor Administrator",
      mapping: "contractExpiry → accessExpiry",
      changes: "Updated contract expiry mapping logic",
      sourceSystem: "Contractor Portal",
      identityType: "non-employee",
      impact: 89,
      details:
        "Modified mapping to automatically calculate access expiry based on contract dates",
    },
  ],
};

// Create sorted entries for each identity type
Object.keys(mockAuditData).forEach((key) => {
  const identityType = key as IdentityType;
  mockAuditData[identityType] = mockAuditData[identityType].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
});
