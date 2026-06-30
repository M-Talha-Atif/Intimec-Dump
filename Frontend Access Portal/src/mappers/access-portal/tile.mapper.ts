import { CategoryTileConfig, FilterRule, ObjectTypeFilter } from '@/types/access-portal';

/**
 * Maps backend TileResponseDTO to frontend CategoryTileConfig
 */
export function mapBackendTileToCategoryTile(
  backendTile: any,
  order: number = 0
): CategoryTileConfig {
  return {
    id: backendTile.id,
    title: backendTile.title,
    description: backendTile.description || '',
    icon: backendTile.icon || 'Briefcase',
    category: backendTile.category || '',
    visibility: [],
    isActive: backendTile.tileActive ?? true,
    // Access type toggles 
    allowApplications: backendTile.allowApplications ?? false,
    allowInternalRoles: backendTile.allowInternalRoles ?? false,
    allowBusinessRoles: backendTile.allowBusinessRoles ?? false,
    allowEntitlements: backendTile.allowEntitlements ?? false,

    order,
    itemCount: backendTile.itemCount ?? 0,
    approvalRate: backendTile.approvalRate ?? 0,
    avgApprovalTime: 0,
    requestEligibility: {
      allowedRoles: backendTile.allowedRoleCodes
        ? Array.from(backendTile.allowedRoleCodes).map(String)
        : [],
      allowedDepartments: backendTile.allowedDepartments || [],
      blockedUsers: backendTile.blockedUsers || [],
      requireManagerApproval: backendTile.requireManagerApproval ?? true,
      maxRiskLevel: mapRiskLevel(backendTile.maximumRiskLevel),
      workflowId: backendTile.workflowId,
    },

    requestTypeConfig: {
      allowRequestForOthers: backendTile.allowRequestForOthers ?? false,
      requireJustificationForOthers: backendTile.allowJustificationForOthers ?? false,
    },

    objectTypeFilter: mapObjectTypeFilter(backendTile),

    visualFilters: mapVisualFilters(backendTile.visualFilters || []),

    tenantId: backendTile.tenantId || 'N/A',
    createdAt: backendTile.createdAt || new Date().toISOString(),
    updatedAt: backendTile.updatedAt || new Date().toISOString(),


    usageStats: {
      viewCount: 0,
      requestCount: 0,
      avgResponseTime: 0,
    },
  };
}

/**
 * Maps frontend CategoryTileConfig to backend TileRequestDTO
 */
export function mapCategoryTileToBackendRequest(tile: Partial<CategoryTileConfig>): any {

  console.log('[mapCategoryTileToBackendRequest] Input tile visual filters:', tile.visualFilters);

  return {
    title: tile.title,
    description: tile.description,
    icon: tile.icon,
    category: tile.category,
    tileActive: tile.isActive ?? true,
    requireManagerApproval: tile.requestEligibility?.requireManagerApproval ?? false,
    workflowId: tile.requestEligibility?.workflowId ?? null,
    maximumRiskLevel: tile.requestEligibility?.maxRiskLevel?.toUpperCase() || 'CRITICAL',
    allowRequestForOthers: tile.requestTypeConfig?.allowRequestForOthers ?? false,
    objectFilteringEnabled: tile.objectTypeFilter?.enabled ?? false,
    allowApplications: tile.objectTypeFilter?.objectTypes?.includes('application') ?? false,
    allowBusinessRoles: tile.objectTypeFilter?.objectTypes?.includes('role') ?? false,
    allowInternalRoles: tile.objectTypeFilter?.objectTypes?.includes('internal-role') ?? false,
    allowEntitlements: tile.objectTypeFilter?.objectTypes?.includes('entitlement') ?? false,

    // Map allowed roles
    allowedRoles:
      tile.requestEligibility?.allowedRoles?.map((roleCode) => ({
        roleCode,
      })) || [],

    // Map access scope items
    accessScopeItems: mapAccessScopeItems(tile.objectTypeFilter),

    // Map visual filters
    visualFilters: mapVisualFiltersToBackend(tile.visualFilters || []),
  };
}

/**
 * Helper: Map risk level from backend to frontend
 */
function mapRiskLevel(backendRiskLevel?: string): 'low' | 'medium' | 'high' | 'critical' {
  if (!backendRiskLevel) return 'critical';
  const level = backendRiskLevel.toLowerCase();
  if (['low', 'medium', 'high', 'critical'].includes(level)) {
    return level as 'low' | 'medium' | 'high' | 'critical';
  }
  return 'critical';
}

/**
 * Helper: Map object type filter from backend
 */
function mapObjectTypeFilter(backendTile: any): ObjectTypeFilter {
  const objectTypes: Array<'application' | 'role' | 'internal-role' | 'entitlement'> = [];

  if (backendTile.allowApplications) objectTypes.push('application');
  if (backendTile.allowBusinessRoles) objectTypes.push('role');
  if (backendTile.allowInternalRoles) objectTypes.push('internal-role');
  if (backendTile.allowEntitlements) objectTypes.push('entitlement');

  // Map access scope items to specific items
  const specificItems: ObjectTypeFilter['specificItems'] = {
    applications: [],
    roles: [],
    groups: [],
    entitlements: [],
  };

  if (backendTile.accessScopeItems && Array.isArray(backendTile.accessScopeItems)) {
    backendTile.accessScopeItems.forEach((item: any) => {
      switch (item.itemType) {
        case 'APPLICATION':
          specificItems.applications?.push(item.itemCode);
          break;
        case 'BUSINESS_ROLE':
          specificItems.roles?.push(item.itemCode);
          break;
        case 'INTERNAL_ROLE':
          specificItems.groups?.push(item.itemCode);
          break;
        case 'ENTITLEMENT':
          specificItems.entitlements?.push(item.itemCode);
          break;
        default:
          console.warn(`Unknown itemType: ${item.itemType}`);
      }
    });
  }

  return {
    id: backendTile.id || `filter-${Date.now()}`,
    enabled: backendTile.objectFilteringEnabled || false,
    objectTypes,
    specificItems,
    includeChildItems: true,
  };
}

/**
 * Helper: Map access scope items to backend format
 */
function mapAccessScopeItems(filter?: ObjectTypeFilter): any[] {
  if (!filter || !filter.specificItems) return [];

  const items: any[] = [];

  // Map applications
  if (filter.specificItems.applications && filter.specificItems.applications.length > 0) {
    filter.specificItems.applications.forEach((itemCode) => {
      items.push({
        itemType: 'APPLICATION',
        itemCode,
      });
    });
  }

  // Map roles (business roles)
  if (filter.specificItems.roles && filter.specificItems.roles.length > 0) {
    filter.specificItems.roles.forEach((itemCode) => {
      items.push({
        itemType: 'BUSINESS_ROLE',
        itemCode,
      });
    });
  }

  // Map groups to INTERNAL_ROLE
  if (filter.specificItems.groups && filter.specificItems.groups.length > 0) {
    filter.specificItems.groups.forEach((itemCode) => {
      items.push({
        itemType: 'INTERNAL_ROLE', // Backend expects INTERNAL_ROLE
        itemCode,
      });
    });
  }

  // Map entitlements
  if (filter.specificItems.entitlements && filter.specificItems.entitlements.length > 0) {
    filter.specificItems.entitlements.forEach((itemCode) => {
      items.push({
        itemType: 'ENTITLEMENT',
        itemCode,
      });
    });
  }

  console.log('Mapped access scope items:', items); // Debug log

  return items;
}

/**
 * Helper: Map visual filters from backend
 * FIXED: Generate truly unique IDs and deduplicate
 */
/**
 * Helper: Map visual filters from backend
 * FIXED: Preserve logical operators correctly for each rule
 */
function mapVisualFilters(backendFilters: any[]): FilterRule[] {
  console.log('[mapVisualFilters] Input backend filters:', backendFilters);
  
  if (!backendFilters || backendFilters.length === 0) {
    console.log('[mapVisualFilters] No filters to map');
    return [];
  }

  const rules: FilterRule[] = [];
  const seenRules = new Set<string>();

  backendFilters.forEach((filter: any, filterIndex: number) => {
    if (filter.rules && Array.isArray(filter.rules)) {
      filter.rules.forEach((rule: any, ruleIndex: number) => {
        // Create unique key (without logical operator to avoid duplicates)
        const uniqueKey = `${rule.fieldName}-${rule.operator}-${rule.value}`;
        
        if (seenRules.has(uniqueKey)) {
          console.warn('[mapVisualFilters] Skipping duplicate rule:', rule);
          return;
        }
        
        seenRules.add(uniqueKey);

        const uniqueId = `rule-${filterIndex}-${ruleIndex}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // CRITICAL FIX: First rule should have undefined logicalOperator
        // All subsequent rules should use their actual logicalOperator from backend
        const logicalOperator = ruleIndex === 0 
          ? undefined 
          : (rule.logicalOperator as 'AND' | 'OR' | undefined) || 'AND';

        rules.push({
          id: uniqueId,
          field: rule.fieldName || 'riskLevel',
          operator: mapOperator(rule.operator),
          value: rule.value || '',
          logicalOperator: logicalOperator,
        });

        console.log(`[mapVisualFilters] Rule ${ruleIndex}:`, {
          field: rule.fieldName,
          backendLogicalOp: rule.logicalOperator,
          frontendLogicalOp: logicalOperator,
        });
      });
    }
  });

  console.log('[mapVisualFilters] Final mapped rules:', rules);
  return rules;
}

/**
 * Helper: Map visual filters to backend format
 */
/**
 * Helper: Map visual filters to backend format
 * CRITICAL: Ensure rules are properly nested inside visualFilters
 */
function mapVisualFiltersToBackend(frontendRules: FilterRule[]): any[] {
  console.log('[mapVisualFiltersToBackend] Input rules:', frontendRules);

  if (!frontendRules || frontendRules.length === 0) {
    console.log('[mapVisualFiltersToBackend] No rules to map');
    return [];
  }

  // Deduplicate rules by creating a unique key
  const uniqueRules = new Map<string, FilterRule>();

  frontendRules.forEach(rule => {
    // Create unique key: field + operator + value
    const key = `${rule.field}-${rule.operator}-${rule.value}`;

    if (!uniqueRules.has(key)) {
      uniqueRules.set(key, rule);
    } else {
      console.warn('[mapVisualFiltersToBackend] Skipping duplicate rule:', rule);
    }
  });

  const deduplicatedRules = Array.from(uniqueRules.values());
  console.log('[mapVisualFiltersToBackend] Deduplicated rules:', deduplicatedRules);

  const mappedFilter = {
    filterName: 'Primary Filter',
    rules: deduplicatedRules.map((rule, index) => ({
      logicalOperator: index === 0 ? null : (rule.logicalOperator || 'AND'),
      fieldName: rule.field,
      operator: mapOperatorToBackend(rule.operator),
      value: rule.value,
    })),
  };

  console.log('[mapVisualFiltersToBackend] Final output:', [mappedFilter]);

  return [mappedFilter];
}

/**
 * Helper: Map operator from backend to frontend
 */
function mapOperator(
  backendOperator: string
): 'equals' | 'notEquals' | 'contains' | 'in' | 'notIn' | 'greaterThan' | 'lessThan' {
  const operatorMap: Record<string, any> = {
    EQ: 'equals',
    NE: 'notEquals',
    CONTAINS: 'contains',
    IN: 'in',
    NOT_IN: 'notIn',
    GT: 'greaterThan',
    LT: 'lessThan',
  };
  return operatorMap[backendOperator] || 'equals';
}

/**
 * Helper: Map operator from frontend to backend
 */
function mapOperatorToBackend(frontendOperator: string): string {
  const operatorMap: Record<string, string> = {
    equals: 'EQ',
    notEquals: 'NE',
    contains: 'CONTAINS',
    in: 'IN',
    notIn: 'NOT_IN',
    greaterThan: 'GT',
    lessThan: 'LT',
  };
  return operatorMap[frontendOperator] || 'EQ';
}