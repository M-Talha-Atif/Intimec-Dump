import { Entitlement } from "../../data/mock-entitlements";

export const calculateHealthScore = (entitlement: Entitlement): number => {
  // Mock calculation - in real app this would be more sophisticated
  let score = 100;

  // Deduct points for high risk
  if (entitlement.riskLevel === "High" || entitlement.risk === "High") {
    score -= 30;
  } else if (
    entitlement.riskLevel === "Medium" ||
    entitlement.risk === "Medium"
  ) {
    score -= 15;
  }

  // Deduct points for deprecated lifecycle
  if (entitlement.lifecycle === "Deprecated") {
    score -= 20;
  }

  // Deduct points if no description
  if (!entitlement.description || entitlement.description.trim().length < 10) {
    score -= 10;
  }

  return Math.max(0, score);
};

export const validateEntitlement = (entitlement: Entitlement): string[] => {
  const errors: string[] = [];

  if (!entitlement.displayName?.trim()) {
    errors.push("Entitlement name is required");
  }

  if (!entitlement.application?.trim()) {
    errors.push("Application is required");
  }

  if (!entitlement.type?.trim()) {
    errors.push("Entitlement type is required");
  }

  return errors;
};
