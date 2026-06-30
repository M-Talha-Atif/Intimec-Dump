export interface UserAttribute {
  field: string;
  label: string;
  type: "text" | "number" | "list" | "boolean" | "date";
  options?: string[];
}

export interface RuleOperator {
  value: string;
  label: string;
}

export const USER_ATTRIBUTES: UserAttribute[] = [
  // Core User Entity Fields
  {
    field: "username",
    label: "Username",
    type: "text",
  },
  {
    field: "email",
    label: "Email",
    type: "text",
  },
  {
    field: "firstName",
    label: "First Name",
    type: "text",
  },
  {
    field: "lastName",
    label: "Last Name",
    type: "text",
  },
  {
    field: "displayName",
    label: "Display Name",
    type: "text",
  },
  {
    field: "status",
    label: "Status",
    type: "list",
    options: ["ACTIVE", "INACTIVE", "LOCKED"],
  },
  {
    field: "tenantId",
    label: "Tenant ID",
    type: "text",
  },
  {
    field: "mfaEnabled",
    label: "MFA Enabled",
    type: "boolean",
  },
  {
    field: "isPasswordExpired",
    label: "Password Expired",
    type: "boolean",
  },
  {
    field: "failedLoginAttempts",
    label: "Failed Login Attempts",
    type: "number",
  },
  {
    field: "lastLoginAt",
    label: "Last Login At",
    type: "date",
  },
  {
    field: "passwordChangedAt",
    label: "Password Changed At",
    type: "date",
  },
  {
    field: "createdAt",
    label: "Created At",
    type: "date",
  },
  {
    field: "updatedAt",
    label: "Updated At",
    type: "date",
  },
  {
    field: "emailVerifiedAt",
    label: "Email Verified At",
    type: "date",
  },
  {
    field: "lockedUntil",
    label: "Locked Until",
    type: "date",
  },
  // Additional fields for extended use cases
  {
    field: "department",
    label: "Department",
    type: "list",
    options: ["IT", "HR", "Finance", "Marketing", "Sales", "Operations"],
  },
  {
    field: "location",
    label: "Location",
    type: "list",
    options: ["New York", "London", "Tokyo", "Sydney", "Remote"],
  },
  {
    field: "country",
    label: "Country",
    type: "list",
    options: ["USA", "UK", "Japan", "Australia", "Canada", "Germany"],
  },
];

export const RULE_OPERATORS: Record<string, RuleOperator[]> = {
  text: [
    { value: "equals", label: "Equals" },
    { value: "not_equals", label: "Not Equals" },
    { value: "contains", label: "Contains" },
    { value: "not_contains", label: "Does Not Contain" },
    { value: "starts_with", label: "Starts With" },
    { value: "ends_with", label: "Ends With" },
    { value: "is_empty", label: "Is Empty" },
    { value: "is_not_empty", label: "Is Not Empty" },
  ],
  number: [
    { value: "equals", label: "Equals" },
    { value: "not_equals", label: "Not Equals" },
    { value: "greater_than", label: "Greater Than" },
    { value: "less_than", label: "Less Than" },
    { value: "greater_than_or_equal", label: "Greater Than or Equal" },
    { value: "less_than_or_equal", label: "Less Than or Equal" },
    { value: "between", label: "Between" },
  ],
  list: [
    { value: "equals", label: "Equals" },
    { value: "not_equals", label: "Not Equals" },
    { value: "in", label: "In" },
    { value: "not_in", label: "Not In" },
  ],
  boolean: [
    { value: "equals", label: "Equals" },
    { value: "not_equals", label: "Not Equals" },
  ],
  date: [
    { value: "equals", label: "Equals" },
    { value: "not_equals", label: "Not Equals" },
    { value: "before", label: "Before" },
    { value: "after", label: "After" },
    { value: "between", label: "Between" },
  ],
};

export const SCHEDULE_TYPES = [
  { value: "immediate", label: "Immediate" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

export const SCRIPT_LANGUAGES = [
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "shell", label: "Shell" },
  { value: "groovy", label: "Groovy" },
  { value: "beanshell", label: "BeanShell" },
] as const;
