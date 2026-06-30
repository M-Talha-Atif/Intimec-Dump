/**
 * Node Output Schemas
 * Defines what data each node type produces for use in conditions and variable substitution
 */

export interface FieldDefinition {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  example?: string;
}

export interface NodeOutputSchema {
  nodeType: string;
  displayName: string;
  icon: string;
  fields: FieldDefinition[];
}

export const NODE_OUTPUT_SCHEMAS: NodeOutputSchema[] = [
  {
    nodeType: 'trigger.manual',
    displayName: 'Manual Trigger',
    icon: '▶️',
    fields: [
      { name: 'userId', type: 'string', description: 'User ID who triggered workflow', example: 'user-456' },
      { name: 'tenantId', type: 'string', description: 'Tenant ID from context', example: 'tenant-789' },
      { name: 'username', type: 'string', description: 'Username who triggered workflow', example: 'john.doe' },
      { name: 'executionId', type: 'string', description: 'Unique execution ID', example: 'exec-123' },
      { name: 'workflowId', type: 'string', description: 'Workflow definition ID', example: 'workflow-456' },
    ],
  },
  {
    nodeType: 'approval.single',
    displayName: 'Approval (Single User)',
    icon: '✋',
    fields: [
      { name: 'decision', type: 'string', description: 'Approval decision', example: 'APPROVED | REJECTED' },
      { name: 'approved', type: 'boolean', description: 'Whether request was approved', example: 'true' },
      { name: 'rejected', type: 'boolean', description: 'Whether request was rejected', example: 'false' },
      { name: 'approvedBy', type: 'string', description: 'ID of user who approved', example: 'user-123' },
      { name: 'comments', type: 'string', description: 'Approval comments', example: 'Looks good' },
      { name: 'respondedAt', type: 'string', description: 'When approval was given', example: '2025-12-17T10:30:00Z' },
    ],
  },
  {
    nodeType: 'approval.multi',
    displayName: 'Approval (Multiple Users)',
    icon: '👥',
    fields: [
      { name: 'decision', type: 'string', description: 'Overall approval decision', example: 'APPROVED | REJECTED' },
      { name: 'approved', type: 'boolean', description: 'Whether all required approvals received', example: 'true' },
      { name: 'rejected', type: 'boolean', description: 'Whether any rejection occurred', example: 'false' },
      { name: 'approvedCount', type: 'number', description: 'Number of approved requests', example: '3' },
      { name: 'rejectedCount', type: 'number', description: 'Number of rejected requests', example: '1' },
      { name: 'pendingCount', type: 'number', description: 'Number of pending requests', example: '0' },
      { name: 'totalApprovers', type: 'number', description: 'Total number of approval requests', example: '4' },
      { name: 'approvedUserIds', type: 'array', description: 'List of user IDs that were approved (User-Manager Pairs mode)', example: '["user-1", "user-2"]' },
      { name: 'rejectedUserIds', type: 'array', description: 'List of user IDs that were rejected (User-Manager Pairs mode)', example: '["user-3"]' },
      { name: 'approvedOwnerIds', type: 'array', description: 'List of owner IDs who approved (Role Owner Approval mode)', example: '["owner-1", "owner-2"]' },
      { name: 'rejectedOwnerIds', type: 'array', description: 'List of owner IDs who rejected (Role Owner Approval mode)', example: '["owner-3"]' },
      { name: 'policy', type: 'string', description: 'Approval policy used', example: 'ALL | ANY | THRESHOLD | FAIL_FAST' },
      { name: 'lastComments', type: 'string', description: 'Comments from last response', example: 'Approved by team' },
      { name: 'respondedAt', type: 'string', description: 'When last approval was given', example: '2025-12-17T10:30:00Z' },
    ],
  },
  {
    nodeType: 'approval.dynamic',
    displayName: 'Approval (Dynamic)',
    icon: '🔄',
    fields: [
      { name: 'decision', type: 'string', description: 'Approval decision', example: 'APPROVED | REJECTED' },
      { name: 'approved', type: 'boolean', description: 'Whether request was approved', example: 'true' },
      { name: 'rejected', type: 'boolean', description: 'Whether request was rejected', example: 'false' },
      { name: 'approvedBy', type: 'string', description: 'ID of user who approved', example: 'user-123' },
      { name: 'comments', type: 'string', description: 'Approval comments', example: 'Approved by role owner' },
      { name: 'respondedAt', type: 'string', description: 'When approval was given', example: '2025-12-17T10:30:00Z' },
    ],
  },
  {
    nodeType: 'action.http',
    displayName: 'HTTP Request',
    icon: '🌐',
    fields: [
      { name: 'httpResponse', type: 'object', description: 'Full HTTP response body', example: '{ "status": "success" }' },
      { name: 'httpStatusCode', type: 'number', description: 'HTTP status code', example: '200' },
      { name: 'httpSuccess', type: 'boolean', description: 'Whether request succeeded', example: 'true' },
      { name: 'httpHeaders', type: 'object', description: 'Response headers', example: '{ "content-type": "application/json" }' },
    ],
  },
  {
    nodeType: 'condition.if',
    displayName: 'If/Else Condition',
    icon: '🔀',
    fields: [
      { name: 'conditionMet', type: 'boolean', description: 'Whether condition was true', example: 'true' },
      { name: 'evaluatedValue', type: 'string', description: 'Actual value that was checked', example: 'APPROVED' },
      { name: 'evaluatedField', type: 'string', description: 'Field name that was evaluated', example: 'approvalDecision' },
    ],
  },
  {
    nodeType: 'condition.switch',
    displayName: 'Switch/Case',
    icon: '🔀',
    fields: [
      { name: 'selectedBranch', type: 'string', description: 'The case label that matched (used for edge routing)', example: 'engineering' },
      { name: 'switchValue', type: 'string', description: 'The actual value from the switch expression', example: 'Engineering' },
      { name: 'matchedValue', type: 'string', description: 'The case value that matched (null if default)', example: 'engineering' },
      { name: 'evaluationMessage', type: 'string', description: 'Details about the evaluation', example: 'Matched: engineering for value: Engineering' },
    ],
  },
  {
    nodeType: 'delay.wait',
    displayName: 'Delay',
    icon: '⏰',
    fields: [
      { name: 'delayStarted', type: 'string', description: 'When delay started', example: '2025-12-17T10:00:00Z' },
      { name: 'delayCompleted', type: 'string', description: 'When delay completed', example: '2025-12-17T10:05:00Z' },
      { name: 'delayDuration', type: 'number', description: 'Delay duration in ms', example: '300000' },
    ],
  },
  {
    nodeType: 'control.foreach',
    displayName: 'ForEach Loop',
    icon: '🔁',
    fields: [
      { name: 'item', type: 'object', description: 'Current item in iteration (variable name configurable)', example: '{ "id": "user-1", "name": "John" }' },
      { name: 'index', type: 'number', description: 'Current iteration index (0-based)', example: '0' },
      { name: 'isFirst', type: 'boolean', description: 'True if first iteration', example: 'true' },
      { name: 'isLast', type: 'boolean', description: 'True if last iteration', example: 'false' },
      { name: 'hasMore', type: 'boolean', description: 'True if more items remain', example: 'true' },
      { name: 'totalItems', type: 'number', description: 'Total number of items (-1 for while loops)', example: '5' },
    ],
  },
  {
    nodeType: 'control.foreach-end',
    displayName: 'ForEach End',
    icon: '↩️',
    fields: [
      { name: 'results', type: 'array', description: 'All collected results from iterations', example: '[{ "decision": "APPROVED" }, { "decision": "REJECTED" }]' },
      { name: 'approvedList', type: 'array', description: 'Items where approval decision was APPROVED', example: '[{ "userId": "u1", "decision": "APPROVED" }]' },
      { name: 'rejectedList', type: 'array', description: 'Items where approval decision was REJECTED', example: '[{ "userId": "u2", "decision": "REJECTED" }]' },
      { name: 'approvedCount', type: 'number', description: 'Number of approved items', example: '3' },
      { name: 'rejectedCount', type: 'number', description: 'Number of rejected items', example: '1' },
      { name: 'totalCount', type: 'number', description: 'Total number of processed items', example: '4' },
      { name: 'allApproved', type: 'boolean', description: 'True if ALL items were approved', example: 'false' },
      { name: 'anyApproved', type: 'boolean', description: 'True if at least one item was approved', example: 'true' },
      { name: 'allRejected', type: 'boolean', description: 'True if ALL items were rejected', example: 'false' },
      { name: 'anyRejected', type: 'boolean', description: 'True if at least one item was rejected', example: 'true' },
      { name: 'continueLoop', type: 'boolean', description: 'Whether loop should continue', example: 'true' },
    ],
  },
  {
    nodeType: 'gateway.switch',
    displayName: 'Dynamic Switch',
    icon: '🔀',
    fields: [
      { name: 'switchItem', type: 'object', description: 'Current item being processed', example: '{ "id": "role-1", "type": "admin" }' },
      { name: 'switchItemIndex', type: 'number', description: 'Index of current item', example: '0' },
      { name: 'switchCase', type: 'string', description: 'Name of matched case', example: 'Admin Roles' },
      { name: 'routingPlan', type: 'array', description: 'Full routing plan for all items', example: '[{ "itemIndex": 0, "branchId": "node-1" }]' },
    ],
  },
  {
    nodeType: 'gateway.switch-join',
    displayName: 'Switch Join',
    icon: '⬇️',
    fields: [
      { name: 'switchResults', type: 'array', description: 'Results from all switch branches', example: '[{ "item": {...}, "caseName": "Admin", "branchOutput": {...} }]' },
      { name: 'allBranchesComplete', type: 'boolean', description: 'Whether all branches completed', example: 'true' },
    ],
  },
  {
    nodeType: 'gateway.dynamic-split',
    displayName: 'Dynamic Parallel Split',
    icon: '⚡',
    fields: [
      { name: 'dynamicItem', type: 'object', description: 'Current item being processed in this branch', example: '{ "id": "role-1", "name": "Admin" }' },
      { name: 'dynamicItemIndex', type: 'number', description: 'Index of current item', example: '0' },
      { name: 'dynamicTotalItems', type: 'number', description: 'Total number of items being processed', example: '5' },
    ],
  },
  {
    nodeType: 'gateway.dynamic-join',
    displayName: 'Dynamic Parallel Join',
    icon: '⬇️',
    fields: [
      { name: 'dynamicResults', type: 'array', description: 'Results from all parallel branches', example: '[{ "branchIndex": 0, "item": {...}, "output": {...}, "isSuccessful": true }]' },
      { name: 'allBranchesComplete', type: 'boolean', description: 'Whether all branches completed', example: 'true' },
      { name: 'completedBranches', type: 'number', description: 'Number of completed branches', example: '5' },
      { name: 'totalBranches', type: 'number', description: 'Total number of branches', example: '5' },
    ],
  },
];

/**
 * Get schema for a specific node type
 */
export function getNodeSchema(nodeType: string): NodeOutputSchema | undefined {
  return NODE_OUTPUT_SCHEMAS.find(schema => schema.nodeType === nodeType);
}

/**
 * Get all fields available from a list of node types
 */
export function getAvailableFields(nodeTypes: string[]): Map<string, FieldDefinition[]> {
  const fieldsByNode = new Map<string, FieldDefinition[]>();
  
  nodeTypes.forEach(nodeType => {
    const schema = getNodeSchema(nodeType);
    if (schema) {
      fieldsByNode.set(schema.displayName, schema.fields);
    }
  });
  
  return fieldsByNode;
}

// ==================== EVENT PAYLOAD SCHEMAS ====================
// These define what fields are available in Kafka event payloads
// Users can pick from these when configuring ForEach loops and mappings

export interface EventPayloadField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  example?: string;
  /** For arrays, describes the structure of each item */
  itemFields?: EventPayloadField[];
  /** For objects, describes nested properties */
  properties?: EventPayloadField[];
}

export interface EventPayloadSchema {
  eventType: string;
  displayName: string;
  description: string;
  fields: EventPayloadField[];
}

/**
 * Event payload schemas for Kafka events
 * These help users understand what data is available from each event type
 */
export const EVENT_PAYLOAD_SCHEMAS: EventPayloadSchema[] = [
  // Role Service Events
  {
    eventType: 'role.assigned',
    displayName: 'Role Assigned',
    description: 'Triggered when roles are assigned to users (e.g., from access-portal cart checkout)',
    fields: [
      { name: 'eventType', type: 'string', description: 'The event type identifier', example: 'role.assigned' },
      { name: 'roleId', type: 'string', description: 'ID of the role being assigned', example: 'role-abc-123' },
      { name: 'roleName', type: 'string', description: 'Human-readable name of the role', example: 'Developer' },
      { name: 'ownerIds', type: 'array', description: 'User IDs of the role owners who can approve', example: '["owner-1", "owner-2"]' },
      { name: 'requesterId', type: 'string', description: 'User ID who initiated the request', example: 'user-xyz-789' },
      { name: 'tenantId', type: 'string', description: 'Tenant identifier', example: 'tenant-001' },
      { 
        name: 'managers', 
        type: 'array', 
        description: 'List of user-manager pairs for each user requesting the role (for manager approvals)',
        example: '[{"userId": "user1", "managerId": "mgr1", "userName": "John Doe"}]',
        itemFields: [
          { name: 'userId', type: 'string', description: 'User requesting the role' },
          { name: 'managerId', type: 'string', description: 'Manager who needs to approve for this user' },
          { name: 'userName', type: 'string', description: 'Name of the user' }
        ]
      },
      { name: 'userIds', type: 'array', description: 'List of user IDs requesting the role', example: '["user1", "user2", "user3"]' },
      { name: 'timestamp', type: 'string', description: 'When the event occurred', example: '2026-01-30T10:00:00Z' }
    ]
  },
  {
    eventType: 'role.revoked',
    displayName: 'Role Revoked',
    description: 'Triggered when roles are revoked from users',
    fields: [
      { name: 'eventType', type: 'string', description: 'The event type identifier', example: 'role.revoked' },
      { name: 'roleId', type: 'string', description: 'ID of the role being revoked', example: 'role-abc-123' },
      { name: 'roleName', type: 'string', description: 'Human-readable name of the role', example: 'Developer' },
      { name: 'ownerIds', type: 'array', description: 'User IDs of the role owners', example: '["owner-1", "owner-2"]' },
      { name: 'requesterId', type: 'string', description: 'User ID who initiated the revocation', example: 'admin-001' },
      { name: 'userIds', type: 'array', description: 'List of user IDs losing the role', example: '["user1", "user2"]' },
      { name: 'reason', type: 'string', description: 'Reason for revocation', example: 'Access review decision' },
      { name: 'timestamp', type: 'string', description: 'When the event occurred', example: '2026-01-30T10:00:00Z' }
    ]
  },
  {
    eventType: 'permission.assigned',
    displayName: 'Permission Assigned',
    description: 'Triggered when permissions are assigned to a role',
    fields: [
      { name: 'eventType', type: 'string', description: 'The event type identifier', example: 'permission.assigned' },
      { name: 'roleId', type: 'string', description: 'ID of the role receiving permissions', example: 'role-abc-123' },
      { name: 'roleName', type: 'string', description: 'Name of the role', example: 'Developer' },
      { name: 'permissionIds', type: 'array', description: 'IDs of permissions being assigned', example: '["perm-1", "perm-2"]' },
      { name: 'ownerIds', type: 'array', description: 'Role owners who can approve', example: '["owner-1"]' },
      { name: 'requesterId', type: 'string', description: 'User who made the request', example: 'user-001' },
      { name: 'timestamp', type: 'string', description: 'When the event occurred', example: '2026-01-30T10:00:00Z' }
    ]
  },
  {
    eventType: 'permission.bulk.assigned',
    displayName: 'Bulk Permission Assigned',
    description: 'Triggered when multiple permissions are assigned to a role in bulk',
    fields: [
      { name: 'eventType', type: 'string', description: 'The event type identifier', example: 'permission.bulk.assigned' },
      { name: 'roleId', type: 'string', description: 'ID of the role', example: 'role-abc-123' },
      { name: 'roleName', type: 'string', description: 'Name of the role', example: 'Admin' },
      {
        name: 'permissions',
        type: 'array',
        description: 'List of permissions with their details',
        example: '[{"permissionId": "perm-1", "applicationId": "app-1", "type": "READ"}]',
        itemFields: [
          { name: 'permissionId', type: 'string', description: 'Permission ID' },
          { name: 'applicationId', type: 'string', description: 'Target application' },
          { name: 'type', type: 'string', description: 'Permission type (READ, WRITE, etc.)' }
        ]
      },
      { name: 'ownerIds', type: 'array', description: 'Role owners', example: '["owner-1"]' },
      { name: 'requesterId', type: 'string', description: 'User who made the request', example: 'user-001' },
      { name: 'timestamp', type: 'string', description: 'When the event occurred', example: '2026-01-30T10:00:00Z' }
    ]
  },
  // Access Service Events
  {
    eventType: 'access.requested',
    displayName: 'Access Requested',
    description: 'Triggered when a user requests access to an application',
    fields: [
      { name: 'eventType', type: 'string', description: 'The event type identifier', example: 'access.requested' },
      { name: 'applicationId', type: 'string', description: 'ID of the application', example: 'app-abc-123' },
      { name: 'applicationName', type: 'string', description: 'Name of the application', example: 'Salesforce' },
      { name: 'requesterId', type: 'string', description: 'User requesting access', example: 'user-001' },
      { name: 'managerId', type: 'string', description: 'Manager of the requester', example: 'mgr-001' },
      { name: 'ownerIds', type: 'array', description: 'Application owners', example: '["owner-1", "owner-2"]' },
      { name: 'accessLevel', type: 'string', description: 'Requested access level', example: 'READ_WRITE' },
      { name: 'justification', type: 'string', description: 'Business justification', example: 'Need for project X' },
      { name: 'timestamp', type: 'string', description: 'When the event occurred', example: '2026-01-30T10:00:00Z' }
    ]
  },
  // User Service Events
  {
    eventType: 'user.created',
    displayName: 'User Created',
    description: 'Triggered when a new user account is created',
    fields: [
      { name: 'eventType', type: 'string', description: 'The event type identifier', example: 'user.created' },
      { name: 'userId', type: 'string', description: 'ID of the new user', example: 'user-new-001' },
      { name: 'username', type: 'string', description: 'Username', example: 'john.doe' },
      { name: 'email', type: 'string', description: 'User email', example: 'john.doe@company.com' },
      { name: 'department', type: 'string', description: 'Department', example: 'Engineering' },
      { name: 'managerId', type: 'string', description: 'User\'s manager', example: 'mgr-001' },
      { name: 'jobTitle', type: 'string', description: 'Job title', example: 'Software Engineer' },
      { name: 'location', type: 'string', description: 'Office location', example: 'New York' },
      { name: 'timestamp', type: 'string', description: 'When the event occurred', example: '2026-01-30T10:00:00Z' }
    ]
  },
  {
    eventType: 'user.updated',
    displayName: 'User Updated',
    description: 'Triggered when user attributes change (e.g., department transfer)',
    fields: [
      { name: 'eventType', type: 'string', description: 'The event type identifier', example: 'user.updated' },
      { name: 'userId', type: 'string', description: 'ID of the user', example: 'user-001' },
      { name: 'changes', type: 'object', description: 'Changed attributes', example: '{"department": "Sales", "managerId": "mgr-002"}' },
      { name: 'previousValues', type: 'object', description: 'Previous values', example: '{"department": "Engineering", "managerId": "mgr-001"}' },
      { name: 'timestamp', type: 'string', description: 'When the event occurred', example: '2026-01-30T10:00:00Z' }
    ]
  },
  {
    eventType: 'user.deactivated',
    displayName: 'User Deactivated',
    description: 'Triggered when a user account is deactivated (e.g., termination)',
    fields: [
      { name: 'eventType', type: 'string', description: 'The event type identifier', example: 'user.deactivated' },
      { name: 'userId', type: 'string', description: 'ID of the deactivated user', example: 'user-001' },
      { name: 'username', type: 'string', description: 'Username', example: 'john.doe' },
      { name: 'reason', type: 'string', description: 'Reason for deactivation', example: 'Termination' },
      { name: 'managerId', type: 'string', description: 'User\'s manager', example: 'mgr-001' },
      { name: 'roleIds', type: 'array', description: 'Roles to be revoked', example: '["role-1", "role-2"]' },
      { name: 'timestamp', type: 'string', description: 'When the event occurred', example: '2026-01-30T10:00:00Z' }
    ]
  },
  // Certification Events
  {
    eventType: 'cert.campaign.started',
    displayName: 'Certification Campaign Started',
    description: 'Triggered when an access certification campaign begins',
    fields: [
      { name: 'eventType', type: 'string', description: 'The event type identifier', example: 'cert.campaign.started' },
      { name: 'campaignId', type: 'string', description: 'Campaign ID', example: 'campaign-q1-2026' },
      { name: 'campaignName', type: 'string', description: 'Campaign name', example: 'Q1 2026 Access Review' },
      { name: 'reviewerIds', type: 'array', description: 'Assigned reviewers', example: '["reviewer-1", "reviewer-2"]' },
      { name: 'dueDate', type: 'string', description: 'Campaign due date', example: '2026-03-31' },
      { name: 'itemCount', type: 'number', description: 'Number of items to review', example: '150' },
      { name: 'timestamp', type: 'string', description: 'When the event occurred', example: '2026-01-30T10:00:00Z' }
    ]
  },
  // Policy Events
  {
    eventType: 'policy.violation.detected',
    displayName: 'Policy Violation Detected',
    description: 'Triggered when a SoD or other policy violation is detected',
    fields: [
      { name: 'eventType', type: 'string', description: 'The event type identifier', example: 'policy.violation.detected' },
      { name: 'violationId', type: 'string', description: 'Unique violation ID', example: 'violation-001' },
      { name: 'policyId', type: 'string', description: 'Policy that was violated', example: 'sod-policy-001' },
      { name: 'policyName', type: 'string', description: 'Policy name', example: 'Finance SoD' },
      { name: 'userId', type: 'string', description: 'User with the violation', example: 'user-001' },
      { name: 'conflictingRoles', type: 'array', description: 'Roles causing the conflict', example: '["AP Clerk", "AP Approver"]' },
      { name: 'severity', type: 'string', description: 'Violation severity', example: 'HIGH' },
      { name: 'ownerIds', type: 'array', description: 'Policy owners to notify', example: '["owner-1"]' },
      { name: 'timestamp', type: 'string', description: 'When the event occurred', example: '2026-01-30T10:00:00Z' }
    ]
  }
];

/**
 * Get payload schema for a specific event type
 */
export function getEventPayloadSchema(eventType: string): EventPayloadSchema | undefined {
  return EVENT_PAYLOAD_SCHEMAS.find(schema => schema.eventType === eventType);
}

/**
 * Get all array fields from an event schema (useful for ForEach collection picker)
 */
export function getEventArrayFields(eventType: string): EventPayloadField[] {
  const schema = getEventPayloadSchema(eventType);
  if (!schema) return [];
  return schema.fields.filter(f => f.type === 'array');
}

/**
 * Get item fields for a specific array field in an event
 */
export function getArrayItemFields(eventType: string, arrayFieldName: string): EventPayloadField[] {
  const schema = getEventPayloadSchema(eventType);
  if (!schema) return [];
  const arrayField = schema.fields.find(f => f.name === arrayFieldName && f.type === 'array');
  return arrayField?.itemFields || [];
}
