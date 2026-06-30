// Scope Analysis Service for Campaign Creation
import {  mockUsers, mockRoles, mockApplications, mockEntitlements, mockSoDPolicies, mockReviewers } from '@/components/access-review/campaigns/data/mock-iga-entities';

export interface ScopeConfig {
  campaignType: string;
  userFilters?: {
    departments?: string[];
    jobTitles?: string[];
    locations?: string[];
    riskScoreMin?: number;
    riskScoreMax?: number;
    includeHighRisk?: boolean;
    includeSoDViolations?: boolean;
    dormantDays?: number;
    excludeServiceAccounts?: boolean;
  };
  roleFilters?: {
    roleIds?: string[];
    riskLevels?: string[];
    includeSoDConflicts?: boolean;
  };
  applicationFilters?: {
    applicationIds?: string[];
    categories?: string[];
    criticalities?: string[];
  };
  entitlementFilters?: {
    entitlementIds?: string[];
    riskLevels?: string[];
    privilegedOnly?: boolean;
  };
  sodFilters?: {
    policyIds?: string[];
    severities?: string[];
  };
}

export interface ScopeAnalysisResult {
  estimatedItems: number;
  estimatedReviewers: number;
  riskDistribution: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  breakdown: {
    users?: number;
    roles?: number;
    applications?: number;
    entitlements?: number;
  };
  warnings: string[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ReviewerSuggestion {
  id: string;
  name: string;
  email: string;
  estimatedItems: number;
  capacity: number;
  utilizationPercent: number;
}

export const scopeAnalysisService = {
  async analyzeCampaignScope(scopeConfig: ScopeConfig): Promise<ScopeAnalysisResult> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    let estimatedItems = 0;
    const breakdown: any = {};
    const riskDistribution = { critical: 0, high: 0, medium: 0, low: 0 };
    const warnings: string[] = [];

    // Calculate based on campaign type and filters
    if (scopeConfig.campaignType === 'user-based' || scopeConfig.campaignType === 'hybrid') {
      let userCount = mockUsers.length;
      
      if (scopeConfig.userFilters?.departments?.length) {
        userCount = Math.floor(userCount * (scopeConfig.userFilters.departments.length / mockDepartments.length));
      }
      
      if (scopeConfig.userFilters?.includeHighRisk) {
        userCount = Math.floor(userCount * 0.15); // Assume 15% are high risk
      }

      breakdown.users = userCount;
      estimatedItems += userCount * 12; // Assume 12 entitlements per user
    }

    if (scopeConfig.campaignType === 'role-based' || scopeConfig.campaignType === 'hybrid') {
      let roleCount = mockRoles.length;
      
      if (scopeConfig.roleFilters?.roleIds?.length) {
        roleCount = scopeConfig.roleFilters.roleIds.length;
      }

      breakdown.roles = roleCount;
      estimatedItems += roleCount * 8; // Assume 8 members per role
    }

    if (scopeConfig.campaignType === 'application-based' || scopeConfig.campaignType === 'hybrid') {
      let appCount = mockApplications.length;
      
      if (scopeConfig.applicationFilters?.applicationIds?.length) {
        appCount = scopeConfig.applicationFilters.applicationIds.length;
      }

      breakdown.applications = appCount;
      estimatedItems += appCount * 25; // Assume 25 users per app
    }

    if (scopeConfig.campaignType === 'entitlement-based') {
      let entCount = mockEntitlements.length;
      
      if (scopeConfig.entitlementFilters?.entitlementIds?.length) {
        entCount = scopeConfig.entitlementFilters.entitlementIds.length;
      }

      breakdown.entitlements = entCount;
      estimatedItems += entCount * 15; // Assume 15 users per entitlement
    }

    if (scopeConfig.campaignType === 'sod-based') {
      const sodCount = scopeConfig.sodFilters?.policyIds?.length || mockSoDPolicies.length;
      breakdown.sodViolations = sodCount;
      estimatedItems += sodCount * 5; // Assume 5 violations per policy
    }

    // Risk distribution (mock percentages)
    riskDistribution.critical = Math.floor(estimatedItems * 0.05);
    riskDistribution.high = Math.floor(estimatedItems * 0.15);
    riskDistribution.medium = Math.floor(estimatedItems * 0.35);
    riskDistribution.low = estimatedItems - riskDistribution.critical - riskDistribution.high - riskDistribution.medium;

    // Estimate reviewers needed (assuming 30 items per reviewer)
    const estimatedReviewers = Math.ceil(estimatedItems / 30);

    // Generate warnings
    if (estimatedItems > 500) {
      warnings.push('Large campaign scope detected. Consider splitting into multiple campaigns.');
    }
    if (estimatedReviewers > 20) {
      warnings.push('High number of reviewers required. Review assignment strategy carefully.');
    }
    if (estimatedItems < 10) {
      warnings.push('Very small campaign scope. Ensure filters are configured correctly.');
    }

    return {
      estimatedItems,
      estimatedReviewers,
      riskDistribution,
      breakdown,
      warnings,
    };
  },

  async previewScopeItems(scopeConfig: ScopeConfig, limit: number = 10): Promise<any[]> {
    await new Promise(resolve => setTimeout(resolve, 300));

    // Return sample items based on campaign type
    const items: any[] = [];

    if (scopeConfig.campaignType === 'user-based') {
      return mockUsers.slice(0, limit).map(user => ({
        type: 'user',
        ...user,
        entitlementsCount: Math.floor(Math.random() * 20) + 5,
      }));
    }

    if (scopeConfig.campaignType === 'role-based') {
      return mockRoles.slice(0, limit).map(role => ({
        type: 'role',
        ...role,
      }));
    }

    if (scopeConfig.campaignType === 'application-based') {
      return mockApplications.slice(0, limit).map(app => ({
        type: 'application',
        ...app,
      }));
    }

    return items;
  },

  async validateScope(scopeConfig: ScopeConfig): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate campaign type is selected
    if (!scopeConfig.campaignType) {
      errors.push('Campaign type must be selected');
    }

    // Validate that at least some scope is defined
    const hasUserFilters = scopeConfig.userFilters && Object.keys(scopeConfig.userFilters).length > 0;
    const hasRoleFilters = scopeConfig.roleFilters && Object.keys(scopeConfig.roleFilters).length > 0;
    const hasAppFilters = scopeConfig.applicationFilters && Object.keys(scopeConfig.applicationFilters).length > 0;
    const hasEntFilters = scopeConfig.entitlementFilters && Object.keys(scopeConfig.entitlementFilters).length > 0;
    const hasSodFilters = scopeConfig.sodFilters && Object.keys(scopeConfig.sodFilters).length > 0;

    if (!hasUserFilters && !hasRoleFilters && !hasAppFilters && !hasEntFilters && !hasSodFilters) {
      warnings.push('No filters applied. Campaign will include all items of the selected type.');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  },

  async suggestReviewers(scopeConfig: ScopeConfig, strategy: string): Promise<ReviewerSuggestion[]> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const analysis = await this.analyzeCampaignScope(scopeConfig);
    const itemsPerReviewer = Math.ceil(analysis.estimatedItems / analysis.estimatedReviewers);

    return mockReviewers.slice(0, analysis.estimatedReviewers).map((reviewer, index) => ({
      id: reviewer.id,
      name: reviewer.name,
      email: reviewer.email,
      estimatedItems: Math.min(itemsPerReviewer, reviewer.capacity),
      capacity: reviewer.capacity,
      utilizationPercent: Math.min(100, Math.round((itemsPerReviewer / reviewer.capacity) * 100)),
    }));
  },
};
