import { ObjectTypeFilter, FilterRule } from '@/types/access-portal';
import { AccessItem } from '@/data/mock-access-portal';

/**
 * Type mapping between item types and specificItems keys
 */
const TYPE_MAPPING: Record<string, keyof ObjectTypeFilter['specificItems']> = {
  'application': 'applications',
  'role': 'roles',
  'internal-role': 'groups',
  'entitlement': 'entitlements',
};

/**
 * Evaluate object type filter
 */
export const evaluateObjectTypeFilter = (
  item: AccessItem,
  filter: ObjectTypeFilter | undefined,
  tileCategory: string
): boolean => {
  // Category check first
  if (item.category !== tileCategory) {
    return false;
  }

  // If filter disabled or not present, allow all
  if (!filter || !filter.enabled) {
    return true;
  }

  // Check if item type is allowed
  if (filter.objectTypes.length > 0 && !filter.objectTypes.includes(item.type as any)) {
    return false;
  }

  // Check specific items
  const specificKey = TYPE_MAPPING[item.type];
  if (specificKey && filter.specificItems[specificKey]) {
    const allowedIds = filter.specificItems[specificKey];
    
    if (allowedIds && allowedIds.length > 0) {
      // If specific items are defined, item must be in the list
      return allowedIds.includes(item.id);
    }
  }

  return true;
};

/**
 * Evaluate visual filters with proper AND/OR logic
 */
export const evaluateVisualFilters = (
  item: AccessItem, 
  visualFilters: FilterRule[]
): boolean => {
  if (visualFilters.length === 0) return true;

  // Start with first rule
  let result = evaluateFilterRule(item, visualFilters[0]);

  // Apply remaining rules with their logical operators
  for (let i = 1; i < visualFilters.length; i++) {
    const rule = visualFilters[i];
    const ruleResult = evaluateFilterRule(item, rule);

    if (rule.logicalOperator === 'OR') {
      result = result || ruleResult;
    } else {
      // Default to AND
      result = result && ruleResult;
    }
  }

  return result;
};

/**
 * Evaluate a single filter rule
 */
const evaluateFilterRule = (item: any, rule: FilterRule): boolean => {
  const fieldValue = getFieldValue(item, rule.field);
  const ruleValue = rule.value;

  // Handle empty/null values
  if (fieldValue === undefined || fieldValue === null) {
    return false;
  }

  switch (rule.operator) {
    case 'equals':
      return String(fieldValue).toLowerCase() === String(ruleValue).toLowerCase();

    case 'notEquals':
      return String(fieldValue).toLowerCase() !== String(ruleValue).toLowerCase();

    case 'contains':
      if (typeof fieldValue === 'string') {
        return fieldValue.toLowerCase().includes(String(ruleValue).toLowerCase());
      }
      if (Array.isArray(fieldValue)) {
        return fieldValue.some(v =>
          String(v).toLowerCase().includes(String(ruleValue).toLowerCase())
        );
      }
      return false;

    case 'in':
      const inValues = String(ruleValue).split(',').map(v => v.trim().toLowerCase());
      return inValues.includes(String(fieldValue).toLowerCase());

    case 'notIn':
      const notInValues = String(ruleValue).split(',').map(v => v.trim().toLowerCase());
      return !notInValues.includes(String(fieldValue).toLowerCase());

    case 'greaterThan':
      return Number(fieldValue) > Number(ruleValue);

    case 'lessThan':
      return Number(fieldValue) < Number(ruleValue);

    default:
      return true;
  }
};

/**
 * Get field value from item (supports nested paths)
 */
const getFieldValue = (item: any, field: string): any => {
  const parts = field.split('.');
  let value = item;

  for (const part of parts) {
    if (value && typeof value === 'object' && part in value) {
      value = value[part];
    } else {
      return undefined;
    }
  }

  return value;
};

/**
 * Combine object type and visual filters
 */
export const combineFilters = (
  item: AccessItem,
  objectTypeFilter: ObjectTypeFilter | undefined,
  visualFilters: FilterRule[],
  tileCategory: string
): boolean => {
  // Apply object type filter first
  if (!evaluateObjectTypeFilter(item, objectTypeFilter, tileCategory)) {
    return false;
  }

  // Apply visual filters
  if (visualFilters && visualFilters.length > 0) {
    return evaluateVisualFilters(item, visualFilters);
  }

  return true;
};

/**
 * Get filtered item count by type
 */
export const getFilteredItemCount = (
  items: AccessItem[],
  filter: ObjectTypeFilter | undefined,
  category: string
): { total: number; byType: Record<string, number> } => {
  const byType: Record<string, number> = {
    application: 0,
    role: 0,
    'internal-role': 0,
    entitlement: 0,
  };

  let total = 0;

  items.forEach(item => {
    if (evaluateObjectTypeFilter(item, filter, category)) {
      total++;
      byType[item.type] = (byType[item.type] || 0) + 1;
    }
  });

  return { total, byType };
};