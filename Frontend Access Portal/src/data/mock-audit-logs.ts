export interface AuditLog {
  id: string;
  timestamp: string | number; // Updated to support both ISO strings and epoch timestamps
  eventType:
    | "create"
    | "update"
    | "delete"
    | "approve"
    | "reject"
    | "provision"
    | "revoke"
    | "certify"
    | "escalate"
    | "fail";
  objectType:
    | "user"
    | "role"
    | "application"
    | "entitlement"
    | "group"
    | "policy"
    | "workflow"
    | "request";
  objectId: string;
  objectName: string;
  actor: {
    id: string;
    name: string;
    type: "user" | "system" | "service";
  };
  target?: {
    id: string;
    name: string;
    type: string;
  };
  description: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  ipAddress: string;
  userAgent?: string;
  sessionId: string;
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

export const mockAuditLogs: AuditLog[] = [
  {
    id: "audit-001",
    timestamp: "2024-06-16T09:30:45.123Z",
    eventType: "create",
    objectType: "user",
    objectId: "user-789",
    objectName: "Sarah Chen",
    actor: {
      id: "admin-001",
      name: "System Administrator",
      type: "user",
    },
    description:
      "New user account created for Sarah Chen in Engineering department",
    riskLevel: "low",
    ipAddress: "192.168.1.45",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    sessionId: "sess-abc123",
    correlationId: "corr-new-hire-789",
    complianceFlags: ["GDPR", "SOX"],
    metadata: {
      department: "Engineering",
      manager: "john.doe@company.com",
      startDate: "2024-06-16",
      employeeType: "full-time",
    },
    afterState: {
      status: "active",
      department: "Engineering",
      roles: ["Employee"],
    },
    outcome: "success",
    resourceOwner: "HR Department",
    department: "Engineering",
  },
  {
    id: "audit-002",
    timestamp: 1753886445879, // Epoch timestamp example
    eventType: "approve",
    objectType: "request",
    objectId: "req-456",
    objectName: "SAP Finance Access Request",
    actor: {
      id: "manager-002",
      name: "Michael Johnson",
      type: "user",
    },
    target: {
      id: "user-123",
      name: "Alice Smith",
      type: "user",
    },
    description: "Access request approved for SAP Finance module",
    riskLevel: "high",
    ipAddress: "10.0.0.88",
    sessionId: "sess-def456",
    correlationId: "corr-sap-access-456",
    complianceFlags: ["SOX", "Internal Controls"],
    metadata: {
      requestedAccess: "SAP_FINANCE_WRITE",
      justification: "Quarter-end reporting requirements",
      validityPeriod: 90,
      approvalLevel: "L2",
    },
    beforeState: {
      status: "pending",
      approvals: ["L1_APPROVED"],
      lastLoginAt: "2025-07-31T09:34:49.432009Z", // ISO timestamp example in state
      updatedAt: 1753886445879, // Epoch timestamp example in state
    },
    afterState: {
      status: "approved",
      approvals: ["L1_APPROVED", "L2_APPROVED"],
      lastLoginAt: "2025-07-31T09:38:09.893171700Z", // Updated ISO timestamp
      updatedAt: 1753886445999, // Updated epoch timestamp
      approvedAt: "1722326711789", // Numeric string timestamp
    },
    outcome: "success",
    resourceOwner: "Finance Team",
    department: "Finance",
  },
  {
    id: "audit-003",
    timestamp: "1722326711789", // Numeric string timestamp example
    eventType: "fail",
    objectType: "application",
    objectId: "app-salesforce",
    objectName: "Salesforce CRM",
    actor: {
      id: "system-provisioner",
      name: "Identity Provisioning Service",
      type: "system",
    },
    target: {
      id: "user-456",
      name: "David Wilson",
      type: "user",
    },
    description: "Failed to provision user account in Salesforce CRM",
    riskLevel: "medium",
    ipAddress: "172.16.0.10",
    sessionId: "sess-sys789",
    correlationId: "corr-sf-provision-456",
    complianceFlags: ["GDPR"],
    metadata: {
      retryAttempt: 3,
      maxRetries: 5,
      provisioningType: "automatic",
    },
    beforeState: {
      status: "provisioning",
      createdAt: 1753886445000,
      attempts: [
        {
          timestamp: "2025-07-31T09:30:00.000Z",
          result: "pending"
        }
      ]
    },
    afterState: {
      status: "failed",
      lastError: "Connection timeout",
      updatedAt: "1753886445879",
      failedAt: "2025-07-31T09:35:00.000Z",
      attempts: [
        {
          timestamp: "2025-07-31T09:30:00.000Z",
          result: "pending"
        },
        {
          timestamp: "2025-07-31T09:35:00.000Z",
          result: "failed"
        }
      ]
    },
    outcome: "failure",
    errorMessage: "Connection timeout to Salesforce API after 30 seconds",
    resourceOwner: "Sales Operations",
    department: "Sales",
  },
  {
    id: "audit-004",
    timestamp: "2024-06-16T06:20:33.012Z",
    eventType: "escalate",
    objectType: "request",
    objectId: "req-789",
    objectName: "Emergency Database Access",
    actor: {
      id: "system-workflow",
      name: "Workflow Engine",
      type: "system",
    },
    target: {
      id: "user-789",
      name: "Emergency Response Team",
      type: "user",
    },
    description: "Emergency access request escalated due to SLA breach",
    riskLevel: "critical",
    ipAddress: "172.16.0.5",
    sessionId: "sess-emer123",
    correlationId: "corr-emergency-789",
    complianceFlags: ["Emergency Access", "SOX"],
    metadata: {
      originalRequestTime: "2024-06-16T04:20:33.012Z",
      slaBreachTime: "2024-06-16T06:20:33.012Z",
      escalationLevel: "L3",
      emergencyType: "system_outage",
    },
    beforeState: {
      status: "pending_approval",
      currentApprover: "manager-level-2",
    },
    afterState: {
      status: "escalated",
      currentApprover: "security-team",
    },
    outcome: "success",
    resourceOwner: "Database Team",
    department: "IT Operations",
  },
  {
    id: "audit-005",
    timestamp: "2024-06-15T16:30:45.345Z",
    eventType: "revoke",
    objectType: "entitlement",
    objectId: "ent-admin-privileges",
    objectName: "Administrator Privileges",
    actor: {
      id: "compliance-officer",
      name: "Jane Compliance",
      type: "user",
    },
    target: {
      id: "user-contractor-123",
      name: "John Contractor",
      type: "user",
    },
    description:
      "Administrative privileges revoked due to contract termination",
    riskLevel: "high",
    ipAddress: "192.168.2.100",
    sessionId: "sess-comp456",
    correlationId: "corr-term-123",
    complianceFlags: ["SOX", "Least Privilege"],
    metadata: {
      terminationDate: "2024-06-15",
      contractorType: "temporary",
      revocationReason: "contract_end",
    },
    beforeState: {
      entitlements: ["ADMIN_READ", "ADMIN_WRITE", "USER_MGMT"],
      status: "active",
    },
    afterState: {
      entitlements: [],
      status: "revoked",
    },
    outcome: "success",
    resourceOwner: "Security Team",
    department: "Security",
  },
];

export const getAuditLogsByFilter = (filters: {
  eventType?: string;
  objectType?: string;
  riskLevel?: string;
  actor?: string;
  dateFrom?: string;
  dateTo?: string;
  searchTerm?: string;
}) => {
  let filtered = [...mockAuditLogs];

  if (filters.eventType && filters.eventType !== "all") {
    filtered = filtered.filter((log) => log.eventType === filters.eventType);
  }

  if (filters.objectType && filters.objectType !== "all") {
    filtered = filtered.filter((log) => log.objectType === filters.objectType);
  }

  if (filters.riskLevel && filters.riskLevel !== "all") {
    filtered = filtered.filter((log) => log.riskLevel === filters.riskLevel);
  }

  if (filters.searchTerm) {
    const term = filters.searchTerm.toLowerCase();
    filtered = filtered.filter(
      (log) =>
        log.description.toLowerCase().includes(term) ||
        log.objectName.toLowerCase().includes(term) ||
        log.actor.name.toLowerCase().includes(term) ||
        log.target?.name.toLowerCase().includes(term)
    );
  }

  return filtered.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
};
