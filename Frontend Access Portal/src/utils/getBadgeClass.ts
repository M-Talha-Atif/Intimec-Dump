/**
 * Centralized badge class utilities for consistent, dark-mode-aware badge styling.
 * 
 * Usage: <Badge className={cn(getCategoryBadgeClass(value), "border text-xs")}>{label}</Badge>
 */

// Re-export existing risk helpers for backward compatibility
export { getRiskBadgeClass, getRiskIconColor } from './getRiskColor';

const DEFAULT_CLASS = "bg-muted text-muted-foreground border-border";

const green = "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800";
const yellow = "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800";
const red = "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800";
const blue = "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800";
const orange = "bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800";
const purple = "bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800";
const indigo = "bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800";
const emerald = "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
const sky = "bg-sky-100 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-800";
const slate = "bg-slate-100 dark:bg-slate-800/40 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-700";

/**
 * Status badge classes: active, inactive, suspended, stale, pending, expired,
 * completed, failed, draft, orphaned, open, escalated, approved, in-progress, 
 * in review, queued, paused, running
 */
export const getStatusBadgeClass = (status: string): string => {
  const classes: Record<string, string> = {
    active: green,
    healthy: green,
    ok: green,
    enabled: green,
    compliant: green,
    completed: green,
    resolved: green,
    approved: green,
    provisioned: blue,
    'in-progress': blue,
    'in progress': blue,
    'in review': blue,
    running: blue,
    current: blue,
    inactive: slate,
    disabled: slate,
    archived: slate,
    suspended: yellow,
    stale: orange,
    pending: yellow,
    'pending review': yellow,
    'pending-approval': yellow,
    draft: yellow,
    paused: yellow,
    queued: slate,
    expired: red,
    failed: red,
    rejected: red,
    revoked: red,
    open: red,
    escalated: red,
    orphaned: red,
    'policy_violation': red,
    'exception active': orange,
    new: red,
    acknowledged: slate,
  };
  return classes[status?.toLowerCase()] || DEFAULT_CLASS;
};

/**
 * Severity badge classes: critical, high, medium, low, info, warn, error
 */
export const getSeverityBadgeClass = (severity: string): string => {
  const classes: Record<string, string> = {
    critical: red,
    high: orange,
    error: red,
    medium: yellow,
    warn: yellow,
    warning: yellow,
    low: blue,
    info: blue,
  };
  return classes[severity?.toLowerCase()] || DEFAULT_CLASS;
};

/**
 * Priority badge classes: critical, high, medium, low
 */
export const getPriorityBadgeClass = (priority: string): string => {
  const classes: Record<string, string> = {
    critical: red,
    high: red,
    medium: yellow,
    low: blue,
  };
  return classes[priority?.toLowerCase()] || DEFAULT_CLASS;
};

/**
 * Impact badge classes: high, medium, low + action impact types
 */
export const getImpactBadgeClass = (impact: string): string => {
  const classes: Record<string, string> = {
    high: red,
    medium: yellow,
    low: green,
    'new access': blue,
    'modified access': yellow,
    'removed access': red,
  };
  return classes[impact?.toLowerCase()] || DEFAULT_CLASS;
};

/**
 * Identity type badge classes: employee, contractor, service account, partner
 */
export const getTypeBadgeClass = (type: string): string => {
  const classes: Record<string, string> = {
    employee: sky,
    contractor: purple,
    'service account': slate,
    partner: emerald,
  };
  return classes[type?.toLowerCase()] || DEFAULT_CLASS;
};

/**
 * Action badge classes: approved, rejected, pending, provisioned, revoked
 */
export const getActionBadgeClass = (action: string): string => {
  const classes: Record<string, string> = {
    approved: green,
    certified: green,
    provisioned: blue,
    pending: yellow,
    rejected: red,
    revoked: red,
    denied: red,
  };
  return classes[action?.toLowerCase()] || DEFAULT_CLASS;
};

/**
 * Event type badge classes for monitoring
 */
export const getEventTypeBadgeClass = (type: string): string => {
  const classes: Record<string, string> = {
    provisioning: green,
    access_request: purple,
    connector: orange,
    certification: blue,
    workflow: indigo,
  };
  return classes[type?.toLowerCase()] || DEFAULT_CLASS;
};

/**
 * Stage badge classes for environments: dev, uat, staging, prod
 */
export const getStageBadgeClass = (stage: string): string => {
  const classes: Record<string, string> = {
    dev: green,
    uat: blue,
    staging: orange,
    prod: red,
  };
  return classes[stage?.toLowerCase()] || DEFAULT_CLASS;
};

/**
 * Privilege level badge classes: admin, write, read
 */
export const getPrivilegeBadgeClass = (privilege: string): string => {
  const classes: Record<string, string> = {
    admin: red,
    write: yellow,
    read: blue,
  };
  return classes[privilege?.toLowerCase()] || DEFAULT_CLASS;
};

/**
 * Boolean / risk flag badge classes
 */
export const getRiskFlagBadgeClass = (isRisky: boolean): string => {
  return isRisky ? red : green;
};
