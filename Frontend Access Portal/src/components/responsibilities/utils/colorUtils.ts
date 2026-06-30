/**
 * Color utility functions for badge variants across responsibilities components
 */

export type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

/**
 * Get badge variant for environment type
 */
export const getEnvColor = (env: string): BadgeVariant => {
  switch (env) {
    case "prod":
      return "default";
    case "test":
      return "secondary";
    case "dev":
      return "outline";
    default:
      return "outline";
  }
};

/**
 * Get badge variant for risk level
 */
export const getRiskColor = (risk: string): BadgeVariant => {
  switch (risk) {
    case "critical":
      return "destructive";
    case "high":
      return "default";
    case "medium":
      return "secondary";
    default:
      return "outline";
  }
};

/**
 * Get badge variant for severity level
 */
export const getSeverityColor = (severity: string): BadgeVariant => {
  switch (severity) {
    case "critical":
      return "destructive";
    case "high":
      return "default";
    case "medium":
      return "secondary";
    default:
      return "outline";
  }
};

export const getSeverityBadgeClass = (severity: string) => {
  const classes = {
    critical: "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400",
    high: "bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400",
    medium: "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400",
    low: "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400",
  };

  const severityLower = severity?.toLowerCase() || "";

  return (
    classes[severityLower as keyof typeof classes] ||
    "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400"
  );
};

/**
 * Get badge variant for status
 */
export const getStatusColor = (status: string): BadgeVariant => {
  switch (status) {
    case "active":
      return "default";
    case "inactive":
      return "secondary";
    case "pending":
      return "destructive";
    default:
      return "outline";
  }
};

/**
 * Get badge variant for scope
 */
export const getScopeColor = (scope: string): BadgeVariant => {
  switch (scope) {
    case "system":
      return "destructive";
    case "connector":
      return "default";
    case "platform":
      return "secondary";
    default:
      return "outline";
  }
};

/**
 * Get badge variant for priority
 */
export const getPriorityColor = (
  priority: string,
): BadgeVariant => {
  switch (priority) {
    case "critical":
      return "destructive";
    case "high":
      return "default";
    case "medium":
      return "secondary";
    default:
      return "outline";
  }
};

/**
 * Get text color class for risk score
 */
export const getRiskScoreColor = (score: number): string => {
  if (score >= 70) return "text-destructive";
  if (score >= 40) return "text-warning";
  return "text-muted-foreground";
};

/**
 * Get badge variant for compliance status
 */
export const getComplianceColor = (status: string): BadgeVariant => {
  switch (status) {
    case "compliant":
      return "default";
    case "violations":
      return "destructive";
    case "review_needed":
      return "secondary"; // Changed from warning as warning might not be a valid BadgeVariant in some design systems, using secondary as safe fallback or if warning is valid it remains
    default:
      return "secondary";
  }
};
