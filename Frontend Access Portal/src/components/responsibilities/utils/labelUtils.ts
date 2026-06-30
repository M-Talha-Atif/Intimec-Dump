/**
 * Label utility functions for displaying human-readable labels across responsibilities components
 */

/**
 * Get label for connector type
 */
export const getConnectorLabel = (type: string): string => {
  switch (type) {
    case "saas":
      return "SaaS";
    case "on-prem":
      return "On-Prem";
    case "cloud":
      return "Cloud";
    default:
      return type;
  }
};

/**
 * Get label for role type
 */
export const getRoleTypeLabel = (type: string): string => {
  switch (type) {
    case "business":
      return "Business";
    case "functional":
      return "Functional";
    case "application":
      return "Application";
    default:
      return type;
  }
};

/**
 * Get label for scope
 */
export const getScopeLabel = (scope: string): string => {
  switch (scope) {
    case "system":
      return "System";
    case "connector":
      return "Connector";
    case "platform":
      return "Platform";
    default:
      return scope;
  }
};

/**
 * Get label for compliance status
 */
export const getComplianceLabel = (status: string): string => {
  switch (status) {
    case "compliant":
      return "Compliant";
    case "violations":
      return "Violations Found";
    case "review_needed":
      return "Review Needed";
    default:
      return status;
  }
};

/**
 * Get label for task type
 */
export const getTaskTypeLabel = (type: string): string => {
  switch (type) {
    case "role_approval":
      return "Role Approval";
    case "certification":
      return "Certification";
    case "workflow":
      return "Workflow";
    case "delegation":
      return "Delegation";
    default:
      return type;
  }
};
