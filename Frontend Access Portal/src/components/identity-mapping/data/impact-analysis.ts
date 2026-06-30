import { IdentityType } from "./identity-mapping";

export interface ImpactIssue {
  id: string;
  type: "mapping-conflict" | "data-quality" | "performance" | "compliance";
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  affectedCount: number;
  source: string;
}

export interface AttributeImpact {
  attribute: string;
  impacted: number;
  total: number;
}

export interface SourceImpact {
  name: string;
  value: number;
  color: string;
}

export interface ImpactAnalysisData {
  totalIdentities: number;
  impactedIdentities: number;
  impactRate: number;
  issues: ImpactIssue[];
  attributeImpact: AttributeImpact[];
  sourceImpact: SourceImpact[];
}

export const mockImpactAnalysisData: Record<IdentityType, ImpactAnalysisData> =
  {
    employee: {
      totalIdentities: 15247,
      impactedIdentities: 3891,
      impactRate: 25.5,
      issues: [
        {
          id: "1",
          type: "mapping-conflict",
          severity: "critical",
          title: "Manager Attribute Conflict",
          description:
            "HR System and Active Directory have conflicting manager assignments",
          affectedCount: 234,
          source: "HR System vs Active Directory",
        },
        {
          id: "2",
          type: "data-quality",
          severity: "high",
          title: "Missing Email Addresses",
          description: "Employee records without valid email addresses",
          affectedCount: 156,
          source: "HR System",
        },
        {
          id: "3",
          type: "compliance",
          severity: "medium",
          title: "Department Code Inconsistency",
          description: "Department codes do not match standard classification",
          affectedCount: 89,
          source: "Workday",
        },
      ],
      attributeImpact: [
        { attribute: "manager", impacted: 234, total: 15247 },
        { attribute: "email", impacted: 156, total: 15247 },
        { attribute: "department", impacted: 89, total: 15247 },
        { attribute: "employeeType", impacted: 67, total: 15247 },
        { attribute: "location", impacted: 45, total: 15247 },
      ],
      sourceImpact: [
        { name: "HR System", value: 45, color: "#8884d8" },
        { name: "Active Directory", value: 30, color: "#82ca9d" },
        { name: "Workday", value: 15, color: "#ffc658" },
        { name: "Google Workspace", value: 10, color: "#ff7300" },
      ],
    },
    "non-human": {
      totalIdentities: 2847,
      impactedIdentities: 425,
      impactRate: 14.9,
      issues: [
        {
          id: "4",
          type: "performance",
          severity: "high",
          title: "Key Rotation Delays",
          description:
            "Service accounts with overdue key rotations affecting mappings",
          affectedCount: 78,
          source: "AWS IAM",
        },
        {
          id: "5",
          type: "mapping-conflict",
          severity: "medium",
          title: "Owner Assignment Conflicts",
          description:
            "Multiple systems claiming ownership of service accounts",
          affectedCount: 45,
          source: "Azure AD vs GitHub",
        },
      ],
      attributeImpact: [
        { attribute: "keyRotationStatus", impacted: 78, total: 2847 },
        { attribute: "owner", impacted: 45, total: 2847 },
        { attribute: "lastUsed", impacted: 32, total: 2847 },
        { attribute: "provider", impacted: 23, total: 2847 },
      ],
      sourceImpact: [
        { name: "AWS IAM", value: 40, color: "#8884d8" },
        { name: "Azure AD", value: 25, color: "#82ca9d" },
        { name: "GitHub", value: 20, color: "#ffc658" },
        { name: "Kubernetes", value: 15, color: "#ff7300" },
      ],
    },
    "non-employee": {
      totalIdentities: 1456,
      impactedIdentities: 187,
      impactRate: 12.8,
      issues: [
        {
          id: "6",
          type: "compliance",
          severity: "critical",
          title: "Expired Contract Access",
          description:
            "Non-employees with active access beyond contract end dates",
          affectedCount: 67,
          source: "Contractor Portal",
        },
        {
          id: "7",
          type: "data-quality",
          severity: "high",
          title: "Missing Sponsor Information",
          description: "Contractor records without assigned sponsors",
          affectedCount: 34,
          source: "Vendor Management System",
        },
      ],
      attributeImpact: [
        { attribute: "contractExpiry", impacted: 67, total: 1456 },
        { attribute: "sponsor", impacted: 34, total: 1456 },
        { attribute: "accessExpiry", impacted: 28, total: 1456 },
        { attribute: "contractType", impacted: 15, total: 1456 },
      ],
      sourceImpact: [
        { name: "Contractor Portal", value: 50, color: "#8884d8" },
        { name: "Vendor Management", value: 30, color: "#82ca9d" },
        { name: "Workday", value: 15, color: "#ffc658" },
        { name: "Active Directory", value: 5, color: "#ff7300" },
      ],
    },
  };
