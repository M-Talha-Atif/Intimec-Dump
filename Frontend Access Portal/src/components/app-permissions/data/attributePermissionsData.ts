export interface AttributePermission {
  id: string;
  attribute: string;
  category: string;
  dataType: string;
  sensitivity: "low" | "medium" | "high" | "critical";
  defaultAccess: "visible" | "masked" | "redacted" | "hidden";
  roleOverrides: Record<string, string>;
}

export const mockAttributePermissions: AttributePermission[] = [
  {
    id: "emp-id",
    attribute: "Employee ID",
    category: "Identity",
    dataType: "string",
    sensitivity: "medium",
    defaultAccess: "visible",
    roleOverrides: {
      "helpdesk-admin": "visible",
      "security-auditor": "masked",
    },
  },
  {
    id: "ssn",
    attribute: "Social Security Number",
    category: "Personal",
    dataType: "string",
    sensitivity: "critical",
    defaultAccess: "redacted",
    roleOverrides: { "hr-admin": "visible", "helpdesk-admin": "masked" },
  },
  {
    id: "salary",
    attribute: "Salary",
    category: "Financial",
    dataType: "number",
    sensitivity: "high",
    defaultAccess: "hidden",
    roleOverrides: { "hr-admin": "visible", manager: "visible" },
  },
  {
    id: "email",
    attribute: "Email Address",
    category: "Contact",
    dataType: "string",
    sensitivity: "low",
    defaultAccess: "visible",
    roleOverrides: {},
  },
  {
    id: "phone",
    attribute: "Phone Number",
    category: "Contact",
    dataType: "string",
    sensitivity: "medium",
    defaultAccess: "visible",
    roleOverrides: { "security-auditor": "masked" },
  },
  {
    id: "birth-date",
    attribute: "Date of Birth",
    category: "Personal",
    dataType: "date",
    sensitivity: "high",
    defaultAccess: "masked",
    roleOverrides: { "hr-admin": "visible" },
  },
  {
    id: "department",
    attribute: "Department",
    category: "Organizational",
    dataType: "string",
    sensitivity: "low",
    defaultAccess: "visible",
    roleOverrides: {},
  },
  {
    id: "manager",
    attribute: "Manager",
    category: "Organizational",
    dataType: "string",
    sensitivity: "low",
    defaultAccess: "visible",
    roleOverrides: {},
  },
  {
    id: "security-clearance",
    attribute: "Security Clearance",
    category: "Security",
    dataType: "string",
    sensitivity: "critical",
    defaultAccess: "hidden",
    roleOverrides: { "security-admin": "visible" },
  },
];

export const attributeCategories = [
  "Identity",
  "Personal",
  "Financial",
  "Contact",
  "Organizational",
  "Security",
];
export const sensitivityLevels = ["low", "medium", "high", "critical"];
export const accessLevels = ["visible", "masked", "redacted", "hidden"];
