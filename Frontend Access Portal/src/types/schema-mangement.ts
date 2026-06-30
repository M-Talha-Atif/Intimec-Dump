export interface EntitiesSchemaManagementResponse {
  id: string;
  schemaName: string;
  schemaCode: string;
  identityType: string;
  description: string;
  version: number;
  isActive: boolean;
  isDefault: boolean;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  fieldsLength: number;
}

// Entity type for UI representation
export interface EntityType {
  id: string;
  name: string;
  count: number;
  icon: string;
  description: string;
  identityType: string;
}

// Schema statistics for dashboard
export interface SchemaStats {
  label: string;
  value: string;
  trend: string;
  color: string;
}

// Future interface for schema-wide statistics (across all entities)
export interface SchemaWideStatistics {
  totalEntities: number;
  totalAttributes: number;
  averageCoverage: number;
  totalHighRiskFields: number;
  entitiesWithIssues: number;
  lastUpdated: string;
}

// Schema attribute representation
export interface SchemaAttribute {
  id: string;
  displayName: string;
  systemKey: string;
  dataType: string;
  isEditable: boolean;
  isRequired: boolean;
  isSensitive: boolean;
  defaultValue: string | object | null;
  description: string;
  complianceTags: string[];
  usageContext: string;
  category?: string;
  validationRules?: string[];
  lastModified?: string;
  modifiedBy?: string;
  syncStatus?: string;
  isSystemAttribute?: boolean;
  sourceMapping?: string; // Source system mapping path for sync functionality
  isUnique?: boolean; // New field for uniqueness constraint
  isCoreField?: boolean; // Indicates if this is a core system attribute
}

// Recent changes tracking
export interface RecentChange {
  id: number;
  type: "create" | "update" | "delete";
  action: string;
  field: string;
  actor: string;
  timestamp: string;
  description: string;
}

// Overview metrics for entity dashboard
export interface OverviewMetrics {
  totalAttributes: number;
  coverage: number;
  requiredFields: number;
  issues: number;
  sensitiveFields: number;
  customFields: number;
  lastSync: string;
}

// Entity data structure
export interface EntityData {
  attributes: SchemaAttribute[];
  overviewMetrics: OverviewMetrics;
  detailedRecentChanges: RecentChange[];
  lastUpdated: string;
}

// Schema management state
export interface SchemaManagementState {
  activeEntity: string;
  activeTab: string;
  isSyncing: boolean;
  entityTypes: EntityType[];
  stats: SchemaStats[];
  schemaStatistics: SchemaWideStatistics | null; // Future: Statistics for all entities in schema
  tenantStatistics: TenantStatisticsResponse | null; // Current tenant statistics
  entityStatistics: SchemaStatisticsResponse | null; // Current entity statistics
  entityData: { [entityId: string]: EntityData };
  searchTerm: string;
  filterType: string;
  isAIRecommendationsOpen: boolean;
  // Simplified loading and error states
  loadingStates: {
    entities: boolean;
    entityFields: { [entityId: string]: boolean };
    tenantStatistics: boolean;
    entityStatistics: boolean;
    addAttribute: boolean;
    updateAttribute: boolean;
    deleteAttribute: boolean;
  };
  errors: {
    entities: string | null;
    entityFields: { [entityId: string]: string | null };
    tenantStatistics: string | null;
    entityStatistics: string | null;
    addAttribute: string | null;
    updateAttribute: string | null;
    deleteAttribute: string | null;
  };
}

// Actions for schema management reducer
export type SchemaManagementAction =
  | { type: "SET_ACTIVE_ENTITY"; payload: string }
  | { type: "SET_ACTIVE_TAB"; payload: string }
  | { type: "SET_IS_SYNCING"; payload: boolean }
  | { type: "SET_SEARCH_TERM"; payload: string }
  | { type: "SET_FILTER_TYPE"; payload: string }
  | { type: "SET_AI_RECOMMENDATIONS_OPEN"; payload: boolean }
  | { type: "LOAD_TENANT_STATISTICS_START" }
  | {
      type: "LOAD_TENANT_STATISTICS_SUCCESS";
      payload: TenantStatisticsResponse;
    }
  | { type: "LOAD_TENANT_STATISTICS_ERROR"; payload: string }
  | { type: "LOAD_ENTITIES_START" }
  | { type: "LOAD_ENTITIES_SUCCESS"; payload: EntityType[] }
  | { type: "LOAD_ENTITIES_ERROR"; payload: string }
  | { type: "LOAD_ENTITY_FIELDS_START"; payload: string } // entityId
  | {
      type: "LOAD_ENTITY_FIELDS_SUCCESS";
      payload: { entityId: string; fields: SchemaAttribute[] };
    }
  | {
      type: "LOAD_ENTITY_FIELDS_ERROR";
      payload: { entityId: string; error: string };
    }
  | { type: "LOAD_ENTITY_STATISTICS_START" }
  | {
      type: "LOAD_ENTITY_STATISTICS_SUCCESS";
      payload: SchemaStatisticsResponse;
    }
  | { type: "LOAD_ENTITY_STATISTICS_ERROR"; payload: string }
  | {
      type: "UPDATE_ENTITY_DATA";
      payload: { entityId: string; data: Partial<EntityData> };
    }
  | {
      type: "ADD_ATTRIBUTE";
      payload: { entityId: string; attribute: SchemaAttribute };
    }
  | {
      type: "UPDATE_ATTRIBUTE";
      payload: {
        entityId: string;
        attributeId: string;
        updates: Partial<SchemaAttribute>;
      };
    }
  | {
      type: "DELETE_ATTRIBUTE";
      payload: { entityId: string; attributeId: string };
    }
  | {
      type: "SYNC_ATTRIBUTE";
      payload: { entityId: string; attributeId: string };
    };

// API Request/Response interfaces

export interface CreateAttributeRequest {
  displayName: string;
  systemKey: string;
  dataType: string;
  description: string;
  isRequired: boolean;
  isSensitive: boolean;
  isWritable: boolean;
  defaultValue?: string | object | null;
  isUnique: boolean;
}

export interface UpdateAttributeRequest {
  displayName?: string;
  description?: string;
  isRequired?: boolean;
  isSensitive?: boolean;
  isWritable?: boolean;
  defaultValue?: string | object | null;
  clearDefaultValue?: boolean;
}

export interface SchemaStatisticsResponse {
  identityType: string;
  totalAttributes: number;
  requiredAttributes: number;
  optionalAttributes: number;
  dataTypeDistribution: {
    STRING: number;
    NUMBER: number;
    BOOLEAN: number;
    OBJECT: number;
    DATE: number;
  };
  attributesWithDefaultValues: number;
  sensitiveAttributes: number;
  uniqueAttributes: number;
  writableAttributes: number;
  readOnlyAttributes: number;
}

export interface TenantStatisticsResponse {
  totalIdentities: number;
  identitiesByType: {
    EMPLOYEE: number;
    NON_EMPLOYEE: number;
    NON_HUMAN: number;
  };
  statisticsByType: {
    NON_EMPLOYEE: {
      totalCount: number;
      activeCount: number;
      inactiveCount: number;
      suspendedCount: number;
      terminatedCount: number;
      pendingCount: number;
      expiredCount: number;
      archivedCount: number;
      extendedAttributesCount: number;
      extendedAttributeUsage: Record<string, number>;
    };
    NON_HUMAN: {
      totalCount: number;
      activeCount: number;
      inactiveCount: number;
      suspendedCount: number;
      terminatedCount: number;
      pendingCount: number;
      expiredCount: number;
      archivedCount: number;
      extendedAttributesCount: number;
      extendedAttributeUsage: Record<string, number>;
    };
    EMPLOYEE: {
      totalCount: number;
      activeCount: number;
      inactiveCount: number;
      suspendedCount: number;
      terminatedCount: number;
      pendingCount: number;
      expiredCount: number;
      archivedCount: number;
      extendedAttributesCount: number;
      extendedAttributeUsage: Record<string, number>;
    };
  };
  totalExtendedAttributes: number;
  extendedAttributeUsage: Record<string, number>;
  activeIdentities: number;
  inactiveIdentities: number;
  totalCount?: number;
  activeCount?: number;
  suspendedCount?: number;
  terminatedCount?: number;
  pendingCount?: number;
  expiredCount?: number;
  archivedCount?: number;
  extendedAttributesCount?: number;
}

export interface EntityFieldResponse {
  id: string;
  schemaId: string;
  displayName: string;
  systemKey: string;
  dataType: string;
  description: string;
  isCoreField: boolean;
  isRequired: boolean;
  isSensitive: boolean;
  isWritable: boolean;
  usageContext: string;
  sourceSystem: string;
  displayOrder: number;
  complianceTags: string[];
  createdAt: number;
  updatedAt: number;
  isUnique: boolean;
  defaultValue?: string | object | null;
}
