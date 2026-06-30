import { AccessItem } from '@/data/mock-access-portal';
import { RequestEligibility, FilterRule } from '@/types/access-portal';
import { UserProfile } from '@/types/access-portal';

export interface EligibilityResult {
  isEligible: boolean;
  reasons: string[];
  warnings: string[];
  requiresApproval: boolean;
  approvalLevel: 'standard' | 'elevated' | 'executive';
}

export class AccessEligibilityEngine {
  /**
   * Check if user is eligible to request an access item
   */
  static checkEligibility(
    accessItem: AccessItem,
    user: UserProfile,
    eligibilityRules: RequestEligibility
  ): EligibilityResult {
    const result: EligibilityResult = {
      isEligible: true,
      reasons: [],
      warnings: [],
      requiresApproval: false,
      approvalLevel: 'standard',
    };


    return result;
  }

  /**
   * Evaluate custom filter rules
   */
  private static evaluateCustomRules(
    rules: FilterRule[],
    accessItem: AccessItem,
    user: UserProfile
  ): { passed: boolean; reasons: string[] } {
    const result = { passed: true, reasons: [] as string[] };
    
    for (const rule of rules) {
      const passed = this.evaluateRule(rule, accessItem, user);
      if (!passed) {
        result.passed = false;
        result.reasons.push(`Rule failed: ${rule.field} ${rule.operator} ${rule.value}`);
      }
    }
    
    return result;
  }

  /**
   * Evaluate a single filter rule
   */
  private static evaluateRule(
    rule: FilterRule,
    accessItem: AccessItem,
    user: UserProfile
  ): boolean {
    const fieldValue = (accessItem as any)[rule.field] || (user as any)[rule.field];
    
    switch (rule.operator) {
      case 'equals':
        return fieldValue === rule.value;
      case 'notEquals':
        return fieldValue !== rule.value;
      case 'contains':
        return String(fieldValue).toLowerCase().includes(String(rule.value).toLowerCase());
      case 'in':
        return Array.isArray(rule.value) && rule.value.includes(fieldValue);
      case 'notIn':
        return Array.isArray(rule.value) && !rule.value.includes(fieldValue);
      case 'greaterThan':
        return Number(fieldValue) > Number(rule.value);
      case 'lessThan':
        return Number(fieldValue) < Number(rule.value);
      default:
        return true;
    }
  }

  /**
   * Get eligibility badge color
   */
  static getEligibilityBadgeColor(result: EligibilityResult): string {
    if (!result.isEligible) return 'destructive';
    if (result.warnings.length > 0) return 'warning';
    return 'success';
  }

  /**
   * Get eligibility summary text
   */
  static getEligibilitySummary(result: EligibilityResult): string {
    if (!result.isEligible) {
      return 'Not Eligible';
    }
    if (result.requiresApproval) {
      return `Requires ${result.approvalLevel} approval`;
    }
    if (result.warnings.length > 0) {
      return 'Eligible with conditions';
    }
    return 'Eligible';
  }
}
