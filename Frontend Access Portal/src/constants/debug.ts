import type {
  DebugLevel,
  PresetFilter,
  RetentionOption,
  PurgeFrequencyOption,
  DebugProfile,
  ComponentDebugConfig,
  ComponentToggles,
  RetentionSettings,
  StreamingSettings,
} from "@/types/debug";

export const DEBUG_LEVELS: DebugLevel[] = [
  { value: "OFF", label: "OFF", color: "text-gray-500" },
  { value: "ERROR", label: "ERROR", color: "text-red-600" },
  { value: "WARN", label: "WARN", color: "text-yellow-600" },
  { value: "INFO", label: "INFO", color: "text-blue-600" },
  { value: "DEBUG", label: "DEBUG", color: "text-purple-600" },
  {
    value: "TRACE",
    label: "TRACE",
    color: "text-gray-700",
    tooltip: "Ultra-detailed logs for development and deep diagnostics",
  },
];

export const PRESET_FILTERS: PresetFilter[] = [
  {
    value: "critical-only",
    label: "Critical Only",
    description: "Show only ERROR level events across all components",
  },
  {
    value: "connector-errors",
    label: "Show Only Connector Errors",
    description: "Focus on connector-specific error events",
  },
  {
    value: "verbose-workflow",
    label: "Verbose Workflow Debug",
    description: "Maximum verbosity for workflow troubleshooting",
  },
  {
    value: "authentication-only",
    label: "Authentication Only",
    description: "Show authentication events and SSO operations",
  },
  {
    value: "connector-provisioning",
    label: "Connector Debug + Provisioning Info",
    description: "Connector DEBUG with Provisioning INFO level",
  },
  {
    value: "access-reviews-errors",
    label: "Access Reviews – Errors & Warnings",
    description: "Access request processing errors and warnings",
  },
  {
    value: "api-events-verbose",
    label: "API Events – High Verbosity",
    description: "Maximum detail for webhook and API operations",
  },
  {
    value: "workflow-failures",
    label: "Workflow Failures Only",
    description: "Show only workflow execution failures",
  },
  {
    value: "all-info-plus",
    label: "All Components – Info+",
    description: "INFO level and above for all components",
  },
  {
    value: "all-trace-logs",
    label: "All TRACE Logs",
    description: "Ultra-detailed TRACE level for all components",
  },
  {
    value: "workflows-trace",
    label: "Workflows + TRACE",
    description: "TRACE level for workflow troubleshooting",
  },
  {
    value: "custom",
    label: "Custom Configuration",
    description: "Manually configured debug levels",
  },
];

export const RETENTION_OPTIONS: RetentionOption[] = [
  { value: "24h", label: "24 Hours" },
  { value: "3d", label: "3 Days" },
  { value: "7d", label: "7 Days" },
  { value: "14d", label: "14 Days" },
  { value: "custom", label: "Custom Range" },
];

export const PURGE_FREQUENCY_OPTIONS: PurgeFrequencyOption[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "manual", label: "Manual Only" },
];

export const DEBUG_PROFILES: DebugProfile[] = [
  {
    id: "default-dev",
    name: "Default Dev Logs",
    description: "Standard development logging",
  },
  {
    id: "silent",
    name: "Silent Mode",
    description: "Minimal logging for production",
  },
  {
    id: "incident",
    name: "Incident Response Mode",
    description: "Maximum verbosity for troubleshooting",
  },
];

export const DEFAULT_COMPONENTS: ComponentDebugConfig[] = [
  {
    name: "Connectors",
    description: "Application connector operations",
    level: "INFO",
  },
  {
    name: "Workflows",
    description: "Workflow engine and execution",
    level: "WARN",
  },
  {
    name: "Provisioning",
    description: "Account provisioning operations",
    level: "ERROR",
  },
  {
    name: "Access Requests",
    description: "Access request processing",
    level: "INFO",
  },
  {
    name: "Webhooks/API",
    description: "External API integrations",
    level: "ERROR",
  },
  {
    name: "Authentication",
    description: "Authentication and SSO operations",
    level: "WARN",
  },
];

export const DEFAULT_COMPONENT_TOGGLES: ComponentToggles = {
  Connectors: {
    retryLogging: true,
    maskPII: false,
    includeStacktrace: true,
    includeWorkflowContext: false,
  },
  Workflows: {
    retryLogging: true,
    maskPII: true,
    includeStacktrace: true,
    includeWorkflowContext: true,
  },
  Provisioning: {
    retryLogging: false,
    maskPII: true,
    includeStacktrace: false,
    includeWorkflowContext: false,
  },
  "Access Requests": {
    retryLogging: true,
    maskPII: true,
    includeStacktrace: false,
    includeWorkflowContext: true,
  },
  "Webhooks/API": {
    retryLogging: false,
    maskPII: true,
    includeStacktrace: true,
    includeWorkflowContext: false,
  },
  Authentication: {
    retryLogging: true,
    maskPII: true,
    includeStacktrace: true,
    includeWorkflowContext: false,
  },
};

export const DEFAULT_RETENTION_SETTINGS: RetentionSettings = {
  duration: "7d",
  autoPurge: true,
  purgeFrequency: "weekly",
  hasRegulatoryTags: false,
};

export const DEFAULT_STREAMING_SETTINGS: StreamingSettings = {
  maxLogRate: 100,
  maxMemoryBuffer: 256,
  enableAIExplainer: true,
};

export const DEFAULT_CORRELATION_KEYS = [
  "requestId",
  "workflowId",
  "identityId",
];
