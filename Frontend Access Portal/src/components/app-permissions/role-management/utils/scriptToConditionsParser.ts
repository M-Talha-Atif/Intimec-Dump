/**
 * Parse a script condition back to visual conditions
 * Supports basic patterns like: user.field == 'value' && user.field2 > 10
 */

import { RuleCondition } from "@/types/dynamicRules";
import { v4 as uuidv4 } from "uuid";

interface ParsedCondition {
  field: string;
  operator: string;
  value: string | number | boolean;
  logicalOperator?: "AND" | "OR";
}

/**
 * Parse script condition to visual conditions
 * Handles patterns like:
 * - user.field == 'value'
 * - user.field != 'value'
 * - user.field > 10
 * - user.field.contains('text')
 * - Combined with && or ||
 */
export function parseScriptToConditions(script: string): RuleCondition[] {
  if (!script || !script.trim()) {
    return [];
  }

  try {
    // Split by && and || while preserving the operator
    const tokens: { condition: string; nextOperator?: "AND" | "OR" }[] = [];
    let currentCondition = "";
    let i = 0;

    while (i < script.length) {
      if (script[i] === "&" && script[i + 1] === "&") {
        tokens.push({ condition: currentCondition.trim(), nextOperator: "AND" });
        currentCondition = "";
        i += 2;
      } else if (script[i] === "|" && script[i + 1] === "|") {
        tokens.push({ condition: currentCondition.trim(), nextOperator: "OR" });
        currentCondition = "";
        i += 2;
      } else {
        currentCondition += script[i];
        i++;
      }
    }
    
    if (currentCondition.trim()) {
      tokens.push({ condition: currentCondition.trim() });
    }

    // Parse each condition
    const conditions: RuleCondition[] = [];

    for (const token of tokens) {
      const parsed = parseCondition(token.condition);
      if (parsed) {
        conditions.push({
          id: uuidv4(),
          field: parsed.field,
          operator: parsed.operator as any,
          value: parsed.value,
          valueType: typeof parsed.value === "boolean" ? "boolean" : 
                     typeof parsed.value === "number" ? "number" : "string",
          logicalOperator: token.nextOperator,
        } as any);
      }
    }

    return conditions;
  } catch (error) {
    console.error("Error parsing script to conditions:", error);
    return [];
  }
}

/**
 * Parse a single condition like "user.email == 'test@example.com'"
 */
function parseCondition(condition: string): ParsedCondition | null {
  if (!condition) return null;

  // Remove 'user.' prefix
  condition = condition.replace(/^user\./, "").trim();

  // Handle .contains(), .startsWith(), .endsWith()
  const methodMatch = condition.match(/^(\w+)\.(contains|startsWith|endsWith)\(['"](.+?)['"]\)/);
  if (methodMatch) {
    return {
      field: methodMatch[1],
      operator: methodMatch[2],
      value: methodMatch[3],
    };
  }

  // Handle comparison operators: ==, !=, >, <, >=, <=
  const operatorRegex = /(==|!=|>=|<=|>|<)/;
  const match = condition.match(/^(\w+)\s*(==|!=|>=|<=|>|<)\s*(.+)$/);
  
  if (match) {
    const field = match[1];
    const operator = match[2];
    let value: string | number | boolean = match[3].trim();

    // Parse value type
    // Remove quotes for strings
    if ((value.startsWith("'") && value.endsWith("'")) || 
        (value.startsWith('"') && value.endsWith('"'))) {
      value = value.slice(1, -1);
    } 
    // Parse boolean
    else if (value === "true" || value === "false") {
      value = value === "true";
    }
    // Parse number
    else if (!isNaN(Number(value))) {
      value = Number(value);
    }

    // Map operators to our format
    let mappedOperator = operator;
    switch (operator) {
      case "==":
        mappedOperator = "equals";
        break;
      case "!=":
        mappedOperator = "notEquals";
        break;
      case ">":
        mappedOperator = "greaterThan";
        break;
      case "<":
        mappedOperator = "lessThan";
        break;
      case ">=":
        mappedOperator = "greaterThanOrEqual";
        break;
      case "<=":
        mappedOperator = "lessThanOrEqual";
        break;
    }

    return {
      field,
      operator: mappedOperator,
      value,
    };
  }

  return null;
}
