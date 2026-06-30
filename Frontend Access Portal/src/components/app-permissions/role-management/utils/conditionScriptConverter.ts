import { RuleGroup, RuleCondition } from "@/types/dynamicRules";

/**
 * Converts visual rule conditions to backend script format
 * Generates scripts like: user.status == 'ACTIVE' && user.mfaEnabled == true
 */

const USER_FIELD_MAPPING: Record<string, string> = {
  department: "user.department",
  title: "user.title",
  location: "user.location",
  manager: "user.manager",
  employeeType: "user.employeeType",
  costCenter: "user.costCenter",
  businessUnit: "user.businessUnit",
  securityClearance: "user.securityClearance",
  startDate: "user.startDate",
  endDate: "user.endDate",
  isActive: "user.status",
  country: "user.country",
  region: "user.region",
  // Add User entity fields
  username: "user.username",
  email: "user.email",
  firstName: "user.firstName",
  lastName: "user.lastName",
  displayName: "user.displayName",
  status: "user.status",
  tenantId: "user.tenantId",
  mfaEnabled: "user.mfaEnabled",
  isPasswordExpired: "user.isPasswordExpired",
  failedLoginAttempts: "user.failedLoginAttempts",
  lastLoginAt: "user.lastLoginAt",
  passwordChangedAt: "user.passwordChangedAt",
  createdAt: "user.createdAt",
  updatedAt: "user.updatedAt",
  emailVerifiedAt: "user.emailVerifiedAt",
  lockedUntil: "user.lockedUntil",
};

const OPERATOR_MAPPING: Record<string, string> = {
  equals: "==",
  not_equals: "!=",
  contains: "contains",
  not_contains: "!contains",
  starts_with: "startsWith",
  ends_with: "endsWith",
  in: "in",
  not_in: "!in",
  greater_than: ">",
  less_than: "<",
  exists: "!= null",
  not_exists: "== null",
};

function formatValue(value: string | string[] | number, valueType: string): string {
  if (valueType === "boolean") {
    return String(value).toLowerCase();
  }
  
  if (valueType === "number") {
    return String(value);
  }
  
  if (Array.isArray(value)) {
    return `[${value.map(v => `'${v}'`).join(", ")}]`;
  }
  
  // String values need quotes
  return `'${value}'`;
}

function convertConditionToScript(condition: RuleCondition): string {
  if (!condition.field || !condition.operator) {
    return "";
  }

  const fieldPath = USER_FIELD_MAPPING[condition.field] || `user.${condition.field}`;
  const operator = OPERATOR_MAPPING[condition.operator] || condition.operator;
  
  // Handle special operators
  if (operator === "exists" || operator === "!= null") {
    return `${fieldPath} != null`;
  }
  
  if (operator === "not_exists" || operator === "== null") {
    return `${fieldPath} == null`;
  }
  
  if (operator === "contains") {
    return `${fieldPath}.contains(${formatValue(condition.value, condition.valueType)})`;
  }
  
  if (operator === "startsWith") {
    return `${fieldPath}.startsWith(${formatValue(condition.value, condition.valueType)})`;
  }
  
  if (operator === "endsWith") {
    return `${fieldPath}.endsWith(${formatValue(condition.value, condition.valueType)})`;
  }
  
  const formattedValue = formatValue(condition.value, condition.valueType);
  return `${fieldPath} ${operator} ${formattedValue}`;
}

function convertGroupToScript(group: RuleGroup): string {
  const conditions = group.conditions;
  
  if (conditions.length === 0) {
    return "";
  }
  
  if (conditions.length === 1) {
    return convertConditionToScript(conditions[0]);
  }
  
  // Build script with individual operators between conditions
  const scriptParts: string[] = [];
  
  for (let i = 0; i < conditions.length; i++) {
    const condition = conditions[i] as any;
    const conditionScript = convertConditionToScript(condition);
    
    if (conditionScript) {
      scriptParts.push(conditionScript);
      
      // Add logical operator if not the last condition
      if (i < conditions.length - 1) {
        const logicalOp = condition.logicalOperator === "OR" ? " || " : " && ";
        scriptParts.push(logicalOp);
      }
    }
  }
  
  return scriptParts.join("");
}

export function convertVisualConditionsToScript(conditions: RuleGroup): string {
  const script = convertGroupToScript(conditions);
  return script || "";
}
