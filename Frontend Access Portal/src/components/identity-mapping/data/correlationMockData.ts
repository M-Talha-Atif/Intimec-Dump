import { CorrelationRule, IdentityType } from "../types/index";

export const getInitialRulesForIdentityType = (
  type: IdentityType
): CorrelationRule[] => {
  switch (type) {
    case "employee":
      return [
        {
          id: "1",
          name: "Primary Employee Core",
          type: "primary",
          priority: 1,
          enabled: true,
          sourceAttribute: "employeeId",
          targetAttribute: "employeeId",
          joinCondition: 'employeeId == employeeId AND status == "Active"',
          conflictResolution: "first-wins",
          sources: ["HR System", "Active Directory"],
          isValid: true,
          validationErrors: [],
        },
        {
          id: "2",
          name: "Secondary Email Correlate",
          type: "secondary",
          priority: 2,
          enabled: true,
          sourceAttribute: "email",
          targetAttribute: "email",
          joinCondition: "LOWER(email) == LOWER(email)",
          conflictResolution: "manual-review",
          sources: ["HR System", "Google Workspace"],
          isValid: false,
          validationErrors: ["Email format validation required"],
        },
      ];
    case "non-human":
      return [
        {
          id: "3",
          name: "Service Account Primary",
          type: "primary",
          priority: 1,
          enabled: true,
          sourceAttribute: "servicePrincipalName",
          targetAttribute: "serviceAccountId",
          joinCondition: "servicePrincipalName == serviceAccountId",
          conflictResolution: "first-wins",
          sources: ["Azure AD", "AWS IAM"],
          isValid: true,
          validationErrors: [],
        },
      ];
    case "non-employee":
      return [
        {
          id: "4",
          name: "Contractor ID Correlation",
          type: "primary",
          priority: 1,
          enabled: true,
          sourceAttribute: "contractorId",
          targetAttribute: "contractorId",
          joinCondition:
            'contractorId == contractorId AND contractStatus == "Active"',
          conflictResolution: "first-wins",
          sources: ["Workday", "Contractor Portal"],
          isValid: true,
          validationErrors: [],
        },
      ];
    default:
      return [];
  }
};
