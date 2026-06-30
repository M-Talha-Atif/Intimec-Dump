import { IdentityType } from "../IdentityAttributeMappingContent";

export interface PreviewResult {
  id: string;
  sourceAttribute: string;
  rawValue: string;
  transformedValue: string;
  status: "success" | "warning" | "error";
  notes: string;
  source: string;
}

export const getMockResultsForIdentityType = (
  type: IdentityType
): PreviewResult[] => {
  switch (type) {
    case "employee":
      return [
        {
          id: "1",
          sourceAttribute: "cn",
          rawValue: "john.doe",
          transformedValue: "JOHN.DOE",
          status: "success",
          notes: "Uppercase transformation applied",
          source: "Active Directory",
        },
        {
          id: "2",
          sourceAttribute: "mail",
          rawValue: "John.Doe@Company.COM",
          transformedValue: "john.doe@company.com",
          status: "success",
          notes: "Lowercase transformation applied",
          source: "HR System",
        },
        {
          id: "3",
          sourceAttribute: "displayName",
          rawValue: "",
          transformedValue: "Unknown User",
          status: "warning",
          notes: "Fallback value used - source attribute was empty",
          source: "Active Directory",
        },
        {
          id: "4",
          sourceAttribute: "department",
          rawValue: "IT-DEPT-001",
          transformedValue: "Information Technology",
          status: "success",
          notes: "Department code resolved to full name",
          source: "HR System",
        },
        {
          id: "5",
          sourceAttribute: "manager",
          rawValue: "CN=Jane Smith,OU=Users,DC=company,DC=com",
          transformedValue: "",
          status: "error",
          notes: "Manager DN could not be resolved to email",
          source: "Active Directory",
        },
      ];
    case "non-human":
      return [
        {
          id: "6",
          sourceAttribute: "servicePrincipalName",
          rawValue: "svc-web-app@company.com",
          transformedValue: "svc-web-app",
          status: "success",
          notes: "Domain suffix removed",
          source: "Azure AD",
        },
        {
          id: "7",
          sourceAttribute: "keyLastRotated",
          rawValue: "2024-01-15T10:30:00Z",
          transformedValue: "EXPIRED",
          status: "warning",
          notes: "Key rotation overdue by 45 days",
          source: "AWS IAM",
        },
        {
          id: "8",
          sourceAttribute: "owner",
          rawValue: "dev-team@company.com",
          transformedValue: "dev-team@company.com",
          status: "success",
          notes: "No transformation required",
          source: "GitHub",
        },
      ];
    case "non-employee":
      return [
        {
          id: "9",
          sourceAttribute: "contractorId",
          rawValue: "EXT-2024-001",
          transformedValue: "EXT-2024-001",
          status: "success",
          notes: "No transformation required",
          source: "Workday",
        },
        {
          id: "10",
          sourceAttribute: "contractEndDate",
          rawValue: "2024-12-31",
          transformedValue: "2024-12-31T23:59:59Z",
          status: "success",
          notes: "Date format normalized to ISO 8601",
          source: "Contractor Portal",
        },
        {
          id: "11",
          sourceAttribute: "sponsor",
          rawValue: "jane.manager",
          transformedValue: "",
          status: "error",
          notes:
            "Sponsor username could not be resolved to full employee record",
          source: "Vendor Management System",
        },
      ];
  }
};
