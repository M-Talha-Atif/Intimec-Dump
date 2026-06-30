import type { IdentityType } from "../types/index";

export const AVAILABLE_SOURCES_BY_TYPE: Record<IdentityType, string[]> = {
  employee: [
    "HR System",
    "Active Directory",
    "Workday",
    "Google Workspace",
    "Office 365",
  ],
  "non-human": [
    "Azure AD",
    "AWS IAM",
    "GitHub",
    "Kubernetes",
    "Active Directory",
  ],
  "non-employee": [
    "Workday",
    "Contractor Portal",
    "Vendor Management System",
    "Active Directory",
  ],
};

export const CORRELATION_TARGET_ATTRIBUTES_BY_TYPE: Record<
  IdentityType,
  string[]
> = {
  employee: ["employeeId", "email", "username", "fullName", "department"],
  "non-human": ["serviceAccountId", "name", "owner", "identityType"],
  "non-employee": ["contractorId", "email", "sponsor", "contractType"],
};

export const CONFLICT_RESOLUTION_OPTIONS = [
  { value: "first-wins", label: "First Wins" },
  { value: "last-wins", label: "Last Wins" },
  { value: "manual-review", label: "Manual Review" },
] as const;

export const RULE_TYPES = [
  { value: "primary", label: "Primary" },
  { value: "secondary", label: "Secondary" },
] as const;
