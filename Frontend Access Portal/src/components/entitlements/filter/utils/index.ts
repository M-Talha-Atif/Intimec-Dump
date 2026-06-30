import type { Entitlement } from "../../data/mock-entitlements";
import type { Filters } from "../types";

/**
 * Apply filters to entitlements array
 */
export const applyFilters = (
  entitlements: Entitlement[],
  filters: Filters
): Entitlement[] => {
  return entitlements.filter((entitlement) => {
    // Apply ownership filter
    if (filters.ownership !== "all") {
      const hasOwner = entitlement.owner && entitlement.owner.trim() !== "";
      if (filters.ownership === "owned" && !hasOwner) {
        return false;
      }
      if (filters.ownership === "unowned" && hasOwner) {
        return false;
      }
    }

    // Apply requestable filter
    if (filters.requestable !== "all") {
      const isRequestable = entitlement.requestable === true;
      if (filters.requestable === "yes" && !isRequestable) {
        return false;
      }
      if (filters.requestable === "no" && isRequestable) {
        return false;
      }
    }

    // Apply governance filter
    if (filters.governance && filters.governance.length > 0) {
      const hasGovernanceMatch = filters.governance.some((govFilter) => {
        switch (govFilter) {
          case "orphaned":
            return entitlement.lifecycle === "Orphaned";
          case "unclassified":
            return (
              !entitlement.classification ||
              entitlement.classification.length === 0
            );
          case "critical":
            return (
              entitlement.riskLevel === "Critical" ||
              entitlement.risk === "High"
            );
          default:
            return false;
        }
      });
      if (!hasGovernanceMatch) {
        return false;
      }
    }

    // Apply classification filter
    if (filters.classification && filters.classification.length > 0) {
      const hasClassificationMatch = filters.classification.some(
        (classFilter) =>
          entitlement.classification?.includes(
            classFilter as "High Risk" | "PII" | "GDPR" | "SOX"
          )
      );
      if (!hasClassificationMatch) {
        return false;
      }
    }

    // Apply entitlement type filter
    if (filters.entitlementType && filters.entitlementType.length > 0) {
      const hasTypeMatch = filters.entitlementType.includes(
        entitlement.type || ""
      );
      if (!hasTypeMatch) {
        return false;
      }
    }

    return true;
  });
};
