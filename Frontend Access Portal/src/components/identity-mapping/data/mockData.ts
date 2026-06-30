import { AttributeMapping, Source, IdentityType } from "../types/index";
import { SYNC_STATUSES } from "./constants";

export const getInitialSourcesForIdentityType = (
  type: IdentityType
): Source[] => {
  switch (type) {
    case "employee":
      return [
        {
          id: "hr-system",
          name: "HR System",
          type: "HR System",
          syncStatus: SYNC_STATUSES.SYNCED,
          priority: 1,
        },
        {
          id: "workday",
          name: "Workday",
          type: "HR System",
          syncStatus: SYNC_STATUSES.SYNCED,
          priority: 2,
        },
        {
          id: "active-directory",
          name: "Active Directory",
          type: "Directory",
          syncStatus: SYNC_STATUSES.OUT_OF_SYNC,
          priority: 3,
        },
        {
          id: "google-workspace",
          name: "Google Workspace",
          type: "Productivity",
          syncStatus: SYNC_STATUSES.SYNCED,
          priority: 4,
        },
        {
          id: "office-365",
          name: "Office 365",
          type: "Productivity",
          syncStatus: SYNC_STATUSES.SYNCED,
          priority: 5,
        },
      ];
    case "non-human":
      return [
        {
          id: "active-directory",
          name: "Active Directory",
          type: "Directory",
          syncStatus: SYNC_STATUSES.SYNCED,
          priority: 1,
        },
        {
          id: "github",
          name: "GitHub",
          type: "DevOps",
          syncStatus: SYNC_STATUSES.SYNCED,
          priority: 2,
        },
        {
          id: "kubernetes",
          name: "Kubernetes",
          type: "Container Platform",
          syncStatus: SYNC_STATUSES.OUT_OF_SYNC,
          priority: 3,
        },
        {
          id: "aws-iam",
          name: "AWS IAM",
          type: "Cloud Provider",
          syncStatus: SYNC_STATUSES.SYNCED,
          priority: 4,
        },
        {
          id: "azure-ad",
          name: "Azure AD",
          type: "Identity Provider",
          syncStatus: SYNC_STATUSES.SYNCED,
          priority: 5,
        },
      ];
    case "non-employee":
      return [
        {
          id: "workday",
          name: "Workday",
          type: "HR System",
          syncStatus: SYNC_STATUSES.SYNCED,
          priority: 1,
        },
        {
          id: "contractor-portal",
          name: "Contractor Portal",
          type: "External System",
          syncStatus: SYNC_STATUSES.SYNCED,
          priority: 2,
        },
        {
          id: "vendor-management",
          name: "Vendor Management System",
          type: "External System",
          syncStatus: SYNC_STATUSES.OUT_OF_SYNC,
          priority: 3,
        },
        {
          id: "active-directory",
          name: "Active Directory",
          type: "Directory",
          syncStatus: SYNC_STATUSES.SYNCED,
          priority: 4,
        },
      ];
    default:
      return [];
  }
};

export const getMockMappingsForIdentityType = (
  type: IdentityType
): AttributeMapping[] => {
  switch (type) {
    case "employee":
      return [
        {
          id: "1",
          sourceAttribute: "cn",
          targetAttribute: "displayName",
          transformation: "uppercase",
          source: "Active Directory",
          priority: 1,
          identityType: "employee",
          type: "string",
          isValid: false,
          validationErrors: ["Target attribute not found in schema"],
        },
        {
          id: "2",
          sourceAttribute: "mail",
          targetAttribute: "email",
          transformation: "lowercase",
          fallbackValue: "noreply@company.com",
          source: "HR System",
          priority: 2,
          identityType: "employee",
          type: "string",
          isValid: true,
        },
      ];
    case "non-human":
      return [
        {
          id: "3",
          sourceAttribute: "servicePrincipalName",
          targetAttribute: "serviceAccountId",
          transformation: "none",
          source: "Azure AD",
          priority: 1,
          identityType: "non-human",
          type: "string",
          isValid: true,
        },
        {
          id: "4",
          sourceAttribute: "keyLastRotated",
          targetAttribute: "keyRotationStatus",
          transformation: "script",
          transformationScript:
            "if ({{sourceValue}}) { const daysSinceRotation = Math.floor((Date.now() - new Date({{sourceValue}}).getTime()) / (1000 * 60 * 60 * 24)); return daysSinceRotation > 90 ? 'EXPIRED' : 'VALID'; } return 'UNKNOWN';",
          condition: "keyAge > 90",
          source: "AWS IAM",
          priority: 2,
          identityType: "non-human",
          type: "string",
          isValid: true,
        },
      ];
    case "non-employee":
      return [
        {
          id: "5",
          sourceAttribute: "contractorEmployeeId",
          targetAttribute: "contractorId",
          transformation: "none",
          source: "Workday",
          priority: 1,
          identityType: "non-employee",
          type: "string",
          isValid: true,
        },
        {
          id: "6",
          sourceAttribute: "contractEndDate",
          targetAttribute: "accessExpiry",
          transformation: "none",
          source: "Contractor Portal",
          priority: 2,
          identityType: "non-employee",
          type: "string",
          isValid: true,
        },
      ];
    default:
      return [];
  }
};
