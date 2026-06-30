export interface RuleCondition {
  id: string;
  field: string;
  operator:
    | "equals"
    | "not_equals"
    | "contains"
    | "not_contains"
    | "starts_with"
    | "ends_with"
    | "in"
    | "not_in"
    | "greater_than"
    | "less_than"
    | "exists"
    | "not_exists";
  value: string | string[] | number;
  valueType: "text" | "number" | "list" | "boolean" | "date";
}

export interface RuleGroup {
  id: string;
  operator: "AND" | "OR";
  conditions: RuleCondition[];
  groups?: RuleGroup[];
}

export interface DynamicAssignmentRule {
  id: string;
  name: string;
  description?: string;
  roleId: string;
  isActive: boolean;
  priority: number;
  schedule?: {
    type: "immediate" | "daily" | "weekly" | "monthly";
    time?: string; // HH:MM format
    dayOfWeek?: number; // 0-6, Sunday = 0
    dayOfMonth?: number; // 1-31
  };
  conditions: RuleGroup;
  actions: {
    assignRole: boolean;
    removeRole?: boolean;
    sendNotification?: boolean;
    requireApproval?: boolean;
  };
  createdAt: string;
  createdBy: string;
  lastModified: string;
  lastRun?: string;
  nextRun?: string;
}

export interface UserAttribute {
  field: string;
  label: string;
  type: "text" | "number" | "list" | "boolean" | "date";
  options?: string[]; // For list types
  description?: string;
}

export const USER_ATTRIBUTES: UserAttribute[] = [
  {
    field: "department",
    label: "Department",
    type: "list",
    options: ["IT", "Finance", "HR", "Marketing", "Security", "Operations"],
    description: "User's department",
  },
  {
    field: "title",
    label: "Job Title",
    type: "text",
    description: "User's job title or position",
  },
  {
    field: "location",
    label: "Location",
    type: "list",
    options: [
      "New York",
      "London",
      "Toronto",
      "San Francisco",
      "Berlin",
      "Tokyo",
    ],
    description: "User's work location",
  },
  {
    field: "manager",
    label: "Manager",
    type: "text",
    description: "User's direct manager",
  },
  {
    field: "employeeType",
    label: "Employee Type",
    type: "list",
    options: ["Full-time", "Part-time", "Contractor", "Intern"],
    description: "Type of employment",
  },
  {
    field: "costCenter",
    label: "Cost Center",
    type: "text",
    description: "User's cost center code",
  },
  {
    field: "businessUnit",
    label: "Business Unit",
    type: "list",
    options: ["Sales", "Engineering", "Support", "Research"],
    description: "Business unit assignment",
  },
  {
    field: "securityClearance",
    label: "Security Clearance",
    type: "list",
    options: ["Public", "Internal", "Confidential", "Restricted"],
    description: "Security clearance level",
  },
  {
    field: "startDate",
    label: "Start Date",
    type: "date",
    description: "Employee start date",
  },
  {
    field: "status",
    label: "Status",
    type: "list",
    options: ["active", "inactive", "pending", "suspended"],
    description: "User account status",
  },
];

export const RULE_OPERATORS = {
  text: [
    { value: "equals", label: "Equals" },
    { value: "not_equals", label: "Does not equal" },
    { value: "contains", label: "Contains" },
    { value: "not_contains", label: "Does not contain" },
    { value: "starts_with", label: "Starts with" },
    { value: "ends_with", label: "Ends with" },
    { value: "exists", label: "Exists" },
    { value: "not_exists", label: "Does not exist" },
  ],
  number: [
    { value: "equals", label: "Equals" },
    { value: "not_equals", label: "Does not equal" },
    { value: "greater_than", label: "Greater than" },
    { value: "less_than", label: "Less than" },
    { value: "exists", label: "Exists" },
    { value: "not_exists", label: "Does not exist" },
  ],
  list: [
    { value: "equals", label: "Equals" },
    { value: "not_equals", label: "Does not equal" },
    { value: "in", label: "Is one of" },
    { value: "not_in", label: "Is not one of" },
  ],
  boolean: [{ value: "equals", label: "Is" }],
  date: [
    { value: "equals", label: "Equals" },
    { value: "greater_than", label: "After" },
    { value: "less_than", label: "Before" },
  ],
};
