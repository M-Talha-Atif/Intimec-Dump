export interface EntitlementIntelligenceKpiResponse {
  tenantId: string;
  totalEntitlements: number;
  activeEntitlements: number;
  orphanedEntitlements: number;
  unclassifiedEntitlements: number;
  highRiskEntitlements: number;
  averageUsersPerEntitlement: number;
  timestamp: number;
}

export interface EntitlementApplicationCountItem {
  applicationId: string;
  applicationName: string;
  entitlementCount: number;
}

export interface EntitlementApplicationCountResponse {
  tenantId: string;
  applications: EntitlementApplicationCountItem[];
  timestamp: number;
}

export interface EntitlementClassificationKpiResponse {
  tenantId: string;
  ownershipGaps: number;
  unclassified: number;
  requestabilityRate: number;
  requestableEntitlements: number;
  timestamp: number;
}

export interface EntitlementRiskKpiResponse {
  tenantId: string;
  highRiskEntitlements: number;
  sodExposure: number;
  complianceTagged: number;
  dataSensitive: number;
  timestamp: number;
}

export interface EntitlementSprawlKpiResponse {
  tenantId: string;
  sprawlIndex: number;
  staleEntitlements: number;
  overProvisionedCount: number;
  directAssignmentCount: number;
  timestamp: number;
}

export interface EntitlementRiskDistributionResponse {
  tenantId: string;
  highRiskEntitlements: number;
  mediumRiskEntitlements: number;
  lowRiskEntitlements: number;
  timestamp: number;
}