import { CustomBadgeColor } from "@/components/applications/common/CustomBadge";
import { TaskConfigFormSchemaType } from "@/components/applications/tasks/tasks-configuration/TaskFormSchema";

/**
 * Task entity type definition for frontend
 */
export type Task = {
  // Core identification
  id: string;
  name: string;
  description?: string;
  category: TaskCategory;
  priority: number; // 1-9 (1=lowest, 9=highest)

  // Ownership and permissions
  owner: {
    id: string;
    name: string;
  };
  assignedTo?: Array<{
    id: string;
    name: string;
  }>; // Array of user/identity objects (supports groups/teams)
  tenantId: string;

  // Application reference
  application: {
    id: string;
    name: string;
  };

  persistenceStatus: "PERSISTED" | "TRANSIENT";
  // Status
  executionStatus: ExecutionStatus;

  businessStatus: string | null;

  // Configuration (JSONB)
  taskConfig?: TaskConfigFormSchemaType; // Task-specific configuration (replaces taskType)

  // Binding type
  bindingType: BindingType;

  // Scheduling
  scheduleType?: ScheduleType;
  cronExpression: string | null; // For CRON schedule type
  intervalSeconds: number | null; // For INTERVAL schedule type
  // executionDateTime?: number; // For ONCE and INTERVAL schedule types

  // Schedule timing (all timestamps in epoch milliseconds)
  earliestStartTime: number | null;
  latestStartTime: number | null;
  latestFinishTime: number | null;
  nextExecution: number | null;
  lastExecution: number | null;

  // Execution tracking (all timestamps in epoch milliseconds)
  misfireAction: "EXECUTE_IMMEDIATELY" | "SKIP" | null; // Action to take if a scheduled execution is missed
  threadStopAction: "INTERRUPT" | "WAIT" | null; // Action to take if task thread needs to be stopped
  isResilient: boolean | null; // Whether the task should attempt to recover from failures
  lastRunStartTimestamp: number | null;
  lastRunFinishTimestamp: number | null;
  executionNodeId: string | null;

  // Metadata (all timestamps in epoch milliseconds)
  createdAt: number;
  createdBy: {
    id: string;
    name: string;
  };
  updatedAt: number;
  updatedBy: {
    id: string;
    name: string;
  };
  version: number; // Optimistic locking version
};

// ==================== Enums ====================

/**
 * Task category - IGA synchronization task types.
 * These map directly to SyncTaskType in the backend proto.
 *
 * IMPORT         — Full import: fetch accounts, create/update shadows, correlate, execute reactions
 * RECONCILIATION — Import + deletion detection (marks absent accounts as DELETED)
 * DISCOVERY      — Preview mode: fetch accounts and show what WOULD happen, without executing reactions
 */
export const TaskCategory = {
  IMPORT: "IMPORT",
  RECONCILIATION: "RECONCILIATION",
  DISCOVERY: "DISCOVERY",
} as const;
export type TaskCategory = (typeof TaskCategory)[keyof typeof TaskCategory];

/**
 * Execution status - current state of task execution
 */
export const ExecutionStatus = {
  RUNNABLE: "RUNNABLE",   // Ready to execute
  RUNNING: "RUNNING",     // Currently executing
  WAITING: "WAITING",     // Waiting for condition/resource
  SUSPENDED: "SUSPENDED", // Temporarily paused
  COMPLETED: "COMPLETED", // Successfully finished
  SKIPPED: "SKIPPED",     // Never attempted: another execution held the advisory lock
  CANCELLED: "CANCELLED", // Explicitly stopped by an operator
  FAILED: "FAILED",       // Execution failed
} as const;
export type ExecutionStatus =
  (typeof ExecutionStatus)[keyof typeof ExecutionStatus];

/**
 * Schedule type - how the task is scheduled
 */
export const ScheduleType = {
  MANUAL: "MANUAL", // Manually triggered only
  ONCE: "ONCE", // Execute once at specific time
  CRON: "CRON", // Cron expression schedule
  INTERVAL: "INTERVAL", // Fixed interval (seconds)
} as const;
export type ScheduleType = (typeof ScheduleType)[keyof typeof ScheduleType];

/**
 * Binding type - how strictly task adheres to schedule
 * LOOSE: Task can catch up if missed (e.g., CRON can execute late)
 * TIGHT: Task must execute exactly on schedule or fail
 */
export const BindingType = {
  LOOSE: "LOOSE",
  TIGHT: "TIGHT",
} as const;
export type BindingType = (typeof BindingType)[keyof typeof BindingType];

/**
 * Target object type - what kind of objects the task operates on
 */
export const TargetObjectType = {
  ACCOUNT: "ACCOUNT", // User accounts
  ENTITLEMENT: "ENTITLEMENT", // Permissions/roles
  GENERIC: "GENERIC", // Generic objects
} as const;
export type TargetObjectType =
  (typeof TargetObjectType)[keyof typeof TargetObjectType];

// ==================== Helper Types ====================

/**
 * Task creation request (subset of Task for API POST)
 */
export type CreateTaskRequest = Pick<
  Task,
  "name" | "description" | "category" | "priority" | "assignedTo"
> & {
  applicationId: string;
  taskConfig?: Record<string, unknown>;
  scheduleType?: ScheduleType;
  cronExpression?: string;
  intervalSeconds?: number;
  bindingType?: BindingType;
  targetObject?: TargetObjectType[];
};

/**
 * Task update request
 */
export type UpdateTaskRequest = Partial<
  Omit<Task, "id" | "createdAt" | "createdBy" | "version">
>;

/**
 * Task filter/query parameters
 */
export type TaskQueryParams = {
  category?: TaskCategory;
  status?: ExecutionStatus;
  scheduleType?: ScheduleType;
  applicationId?: string;
  ownerId?: string;
  assignedToUserId?: string;
  page?: number;
  size?: number;
  sort?: string;
};

export const executionStatusColors: Partial<
  Record<ExecutionStatus, CustomBadgeColor>
> = {
  RUNNING: "blue",
  WAITING: "yellow",
  SUSPENDED: "gray",
  COMPLETED: "green",
  SKIPPED: "gray",
  FAILED: "red",
};

export const taskOperations = [
  "addition",
  "deletion",
  "modification",
  "quarantine",
  "none",
] as const;

export const taskLogLevel = ["INFO", "WARN", "ERROR"] as const;

export type TaskLog = {
  timestamp: number; // epoch timestamp
  level: (typeof taskLogLevel)[number];
  message: string;
  exception?: string; // optional, for error logs
  isLastMessage?: boolean; // optional, indicates if this is the last message in a sequence

  // to be added
  // objectId: string; // e.g., account ID or entitlement ID
  // operation: (typeof importOperations)[number]; // type of operation
  // objectOfInterest: "account" | "entitlement";
};

export type TaskReport = {
  id: string;
  processedCount: number;
  totalChanges: number;
  additions: number;
  deletions: number;
  modifications: number;
  quarantined: number;
  startedAt: number;
  endedAt: number | null;
  status: ExecutionStatus;
};

export type TaskRun = {
  executionId: string;
  taskId: string;
  status: ExecutionStatus;
  startTime: number;
  endTime: number;
  durationMs: number;
  createdAt: number;
  errorMessage: string | null;
  stackTrace: string | null;

  // Synchronization statistics
  processedCount: number | null;
  createdCount: number | null;
  updatedCount: number | null;
  deletedCount: number | null;
  linkedCount: number | null;
  failedCount: number | null;
  skippedCount: number | null;
  entitlementsImported: number | null;

  // Progress estimation
  estimatedTotalCount: number | null;

  // Preview fields
  preview: boolean;
  previewDetails: string | null;
};
