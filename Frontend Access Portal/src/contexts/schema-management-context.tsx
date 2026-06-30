"use client";
import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useCallback,
} from "react";
import {
  IDENTITY_ENTITY_TYPES,
  IDENTITY_ENTITY_DISPLAY_NAMES,
  ENTITY_TYPE_ICONS,
  ENTITY_TYPE_DESCRIPTIONS,
  IdentityEntityType
} from "@/constants/identity";
import {
  getEntityFields,
  addAttribute as addAttributeAPI,
  deleteAttribute as deleteAttributeAPI,
  updateAttribute as updateAttributeAPI,
  getStatistics as getStatisticsAPI,
  getTenantStatistics as getTenantStatisticsAPI,
} from "@/lib/schema-mangement";
import {
  CreateAttributeRequest,
  UpdateAttributeRequest,
  SchemaStatisticsResponse,
  EntityType,
  SchemaStats,
  SchemaAttribute,
  EntityData,
  SchemaManagementState,
  SchemaManagementAction,
} from "@/types/schema-mangement";

// Constant entity list - uses constants from identity.ts
const CONSTANT_ENTITIES: EntityType[] = [
  {
    id: IDENTITY_ENTITY_TYPES.EMPLOYEE,
    name: IDENTITY_ENTITY_DISPLAY_NAMES[IDENTITY_ENTITY_TYPES.EMPLOYEE],
    count: 0,
    icon: ENTITY_TYPE_ICONS[IDENTITY_ENTITY_TYPES.EMPLOYEE],
    description: ENTITY_TYPE_DESCRIPTIONS[IDENTITY_ENTITY_TYPES.EMPLOYEE],
    identityType: IDENTITY_ENTITY_TYPES.EMPLOYEE,
  },
  {
    id: IDENTITY_ENTITY_TYPES.NON_EMPLOYEE,
    name: IDENTITY_ENTITY_DISPLAY_NAMES[IDENTITY_ENTITY_TYPES.NON_EMPLOYEE],
    count: 0,
    icon: ENTITY_TYPE_ICONS[IDENTITY_ENTITY_TYPES.NON_EMPLOYEE],
    description: ENTITY_TYPE_DESCRIPTIONS[IDENTITY_ENTITY_TYPES.NON_EMPLOYEE],
    identityType: IDENTITY_ENTITY_TYPES.NON_EMPLOYEE,
  },
  {
    id: IDENTITY_ENTITY_TYPES.NON_HUMAN,
    name: IDENTITY_ENTITY_DISPLAY_NAMES[IDENTITY_ENTITY_TYPES.NON_HUMAN],
    count: 0,
    icon: ENTITY_TYPE_ICONS[IDENTITY_ENTITY_TYPES.NON_HUMAN],
    description: ENTITY_TYPE_DESCRIPTIONS[IDENTITY_ENTITY_TYPES.NON_HUMAN],
    identityType: IDENTITY_ENTITY_TYPES.NON_HUMAN,
  },
];

// Initial state
const initialStats: SchemaStats[] = [
  {
    label: "Total Entities",
    value: "8",
    trend: "±0",
    color: "text-blue-600",
  },
  {
    label: "Custom Attributes",
    value: "156",
    trend: "+12",
    color: "text-green-600",
  },
  {
    label: "Schema Coverage",
    value: "94%",
    trend: "+2%",
    color: "text-purple-600",
  },
  {
    label: "High-Risk Fields",
    value: "23",
    trend: "-3",
    color: "text-red-600",
  },
];

const initialState: SchemaManagementState = {
  activeEntity: "", // Will be set when entities are loaded
  activeTab: "attributes",
  isSyncing: false,
  entityTypes: [],
  stats: initialStats,
  schemaStatistics: null,
  entityData: {}, // Will be populated when entities are loaded
  searchTerm: "",
  filterType: "all",
  isAIRecommendationsOpen: false,
  tenantStatistics: null, // Tenant statistics data
  entityStatistics: null, // Current entity statistics data
  // Simplified loading and error states
  loadingStates: {
    entities: false,
    entityFields: {},
    tenantStatistics: false,
    entityStatistics: false,
    addAttribute: false,
    updateAttribute: false,
    deleteAttribute: false,
  },
  errors: {
    entities: null,
    entityFields: {},
    tenantStatistics: null,
    entityStatistics: null,
    addAttribute: null,
    updateAttribute: null,
    deleteAttribute: null,
  },
};

// UI State Reducer - handles UI-related state changes
const uiReducer = (
  state: SchemaManagementState,
  action: SchemaManagementAction
): SchemaManagementState => {
  switch (action.type) {
    case "SET_ACTIVE_ENTITY":
      return {
        ...state,
        activeEntity: action.payload,
        // Clear entity statistics when switching entities to ensure fresh data
        entityStatistics: null,
        loadingStates: {
          ...state.loadingStates,
          entityStatistics: false, // Reset loading state
        },
        errors: {
          ...state.errors,
          entityStatistics: null, // Clear any previous errors
        },
      };
    case "SET_ACTIVE_TAB":
      return { ...state, activeTab: action.payload };
    case "SET_IS_SYNCING":
      return { ...state, isSyncing: action.payload };
    case "SET_SEARCH_TERM":
      return { ...state, searchTerm: action.payload };
    case "SET_FILTER_TYPE":
      return { ...state, filterType: action.payload };
    case "SET_AI_RECOMMENDATIONS_OPEN":
      return { ...state, isAIRecommendationsOpen: action.payload };
    default:
      return state;
  }
};

// Entities Reducer - handles entity loading and management
const entitiesReducer = (
  state: SchemaManagementState,
  action: SchemaManagementAction
): SchemaManagementState => {
  switch (action.type) {
    case "LOAD_ENTITIES_START":
      return {
        ...state,
        loadingStates: {
          ...state.loadingStates,
          entities: true,
        },
        errors: {
          ...state.errors,
          entities: null,
        },
      };

    case "LOAD_ENTITIES_SUCCESS":
      const entityExists = action.payload.find(
        (entity) => entity.id === state.activeEntity
      );
      const shouldSetActiveEntity = !state.activeEntity || !entityExists;
      const newActiveEntity = shouldSetActiveEntity
        ? action.payload[0]?.id || ""
        : state.activeEntity;

      return {
        ...state,
        loadingStates: {
          ...state.loadingStates,
          entities: false,
        },
        errors: {
          ...state.errors,
          entities: null,
        },
        entityTypes: action.payload,
        activeEntity: newActiveEntity,
      };

    case "LOAD_ENTITIES_ERROR":
      return {
        ...state,
        loadingStates: {
          ...state.loadingStates,
          entities: false,
        },
        errors: {
          ...state.errors,
          entities: action.payload,
        },
      };

    case "LOAD_ENTITY_FIELDS_START":
      return {
        ...state,
        loadingStates: {
          ...state.loadingStates,
          entityFields: {
            ...state.loadingStates.entityFields,
            [action.payload]: true,
          },
        },
        errors: {
          ...state.errors,
          entityFields: {
            ...state.errors.entityFields,
            [action.payload]: null,
          },
        },
      };

    case "LOAD_ENTITY_FIELDS_SUCCESS":
      const { entityId: successEntityId, fields } = action.payload;
      const customFields = fields.filter((f) => !f.isSystemAttribute).length;
      return {
        ...state,
        loadingStates: {
          ...state.loadingStates,
          entityFields: {
            ...state.loadingStates.entityFields,
            [successEntityId]: false,
          },
        },
        errors: {
          ...state.errors,
          entityFields: {
            ...state.errors.entityFields,
            [successEntityId]: null,
          },
        },
        entityData: {
          ...state.entityData,
          [successEntityId]: {
            attributes: fields,
            overviewMetrics: {
              totalAttributes: fields.length,
              requiredFields: fields.filter((f) => f.isRequired).length,
              sensitiveFields: fields.filter((f) => f.isSensitive).length,
              customFields: customFields,
              coverage: 85, // Default coverage
              issues: 0, // Default issues
              lastSync: new Date().toISOString().split("T")[0],
            },
            detailedRecentChanges: [],
            lastUpdated: new Date().toISOString(),
          },
        },
      };

    case "LOAD_ENTITY_FIELDS_ERROR":
      const { entityId: errorEntityId, error } = action.payload;
      return {
        ...state,
        loadingStates: {
          ...state.loadingStates,
          entityFields: {
            ...state.loadingStates.entityFields,
            [errorEntityId]: false,
          },
        },
        errors: {
          ...state.errors,
          entityFields: {
            ...state.errors.entityFields,
            [errorEntityId]: error,
          },
        },
      };

    case "UPDATE_ENTITY_DATA":
      return {
        ...state,
        entityData: {
          ...state.entityData,
          [action.payload.entityId]: {
            ...state.entityData[action.payload.entityId],
            ...action.payload.data,
          },
        },
      };

    default:
      return state;
  }
};

// Attributes Reducer - handles attribute CRUD operations
const attributesReducer = (
  state: SchemaManagementState,
  action: SchemaManagementAction
): SchemaManagementState => {
  switch (action.type) {
    case "ADD_ATTRIBUTE":
      const entityData = state.entityData[action.payload.entityId];
      if (!entityData) return state;

      const newAttributes = [
        ...entityData.attributes,
        action.payload.attribute,
      ];
      const newRequiredFields = newAttributes.filter(
        (attr) => attr.isRequired
      ).length;
      const newSensitiveFields = newAttributes.filter(
        (attr) => attr.isSensitive
      ).length;
      const isCustomAttribute = !action.payload.attribute.isSystemAttribute;
      const newCustomAttributesCountAfterAdd = isCustomAttribute
        ? (entityData.overviewMetrics.customFields || 0) + 1
        : (entityData.overviewMetrics.customFields || 0);

      return {
        ...state,
        entityData: {
          ...state.entityData,
          [action.payload.entityId]: {
            ...entityData,
            attributes: newAttributes,
            overviewMetrics: {
              ...entityData.overviewMetrics,
              totalAttributes: (entityData.overviewMetrics.totalAttributes || 0) + 1,
              customFields: newCustomAttributesCountAfterAdd,
              requiredFields: newRequiredFields,
              sensitiveFields: newSensitiveFields,
            },
          },
        },
      };

    case "UPDATE_ATTRIBUTE":
      const targetEntityData = state.entityData[action.payload.entityId];
      if (!targetEntityData) return state;

      const updatedAttributes = targetEntityData.attributes.map((attr) =>
        attr.id === action.payload.attributeId
          ? { ...attr, ...action.payload.updates }
          : attr
      );
      const updatedRequiredFields = updatedAttributes.filter(
        (attr) => attr.isRequired
      ).length;
      const updatedSensitiveFields = updatedAttributes.filter(
        (attr) => attr.isSensitive
      ).length;

      return {
        ...state,
        entityData: {
          ...state.entityData,
          [action.payload.entityId]: {
            ...targetEntityData,
            attributes: updatedAttributes,
            overviewMetrics: {
              ...targetEntityData.overviewMetrics,
              requiredFields: updatedRequiredFields,
              sensitiveFields: updatedSensitiveFields,
            },
          },
        },
      };

    case "DELETE_ATTRIBUTE":
      const entityForDelete = state.entityData[action.payload.entityId];
      if (!entityForDelete) return state;

      const deletedAttribute = entityForDelete.attributes.find(
        (attr) => attr.id === action.payload.attributeId
      );
      const filteredAttributes = entityForDelete.attributes.filter(
        (attr) => attr.id !== action.payload.attributeId
      );
      const newRequiredFieldsCount = filteredAttributes.filter(
        (attr) => attr.isRequired
      ).length;
      const newSensitiveFieldsCount = filteredAttributes.filter(
        (attr) => attr.isSensitive
      ).length;
      const wasCustomAttribute =
        deletedAttribute && !deletedAttribute.isSystemAttribute;
      const newCustomAttributesCountAfterDelete = wasCustomAttribute
        ? (entityForDelete.overviewMetrics.customFields || 0) - 1
        : (entityForDelete.overviewMetrics.customFields || 0);

      return {
        ...state,
        entityData: {
          ...state.entityData,
          [action.payload.entityId]: {
            ...entityForDelete,
            attributes: filteredAttributes,
            overviewMetrics: {
              ...entityForDelete.overviewMetrics,
              totalAttributes: (entityForDelete.overviewMetrics.totalAttributes || 0) - 1,
              customFields: newCustomAttributesCountAfterDelete,
              requiredFields: newRequiredFieldsCount,
              sensitiveFields: newSensitiveFieldsCount,
            },
          },
        },
      };

    case "SYNC_ATTRIBUTE":
      const entityForSync = state.entityData[action.payload.entityId];
      if (!entityForSync) return state;

      const syncedAttributes = entityForSync.attributes.map((attr) =>
        attr.id === action.payload.attributeId
          ? {
            ...attr,
            syncStatus: "synced",
            lastModified: new Date().toISOString().split("T")[0],
          }
          : attr
      );

      return {
        ...state,
        entityData: {
          ...state.entityData,
          [action.payload.entityId]: {
            ...entityForSync,
            attributes: syncedAttributes,
          },
        },
      };

    default:
      return state;
  }
};

// Statistics Reducer - handles statistics loading
const statisticsReducer = (
  state: SchemaManagementState,
  action: SchemaManagementAction
): SchemaManagementState => {
  switch (action.type) {
    case "LOAD_TENANT_STATISTICS_START":
      return {
        ...state,
        loadingStates: {
          ...state.loadingStates,
          tenantStatistics: true,
        },
        errors: {
          ...state.errors,
          tenantStatistics: null,
        },
      };

    case "LOAD_TENANT_STATISTICS_SUCCESS":
      return {
        ...state,
        loadingStates: {
          ...state.loadingStates,
          tenantStatistics: false,
        },
        errors: {
          ...state.errors,
          tenantStatistics: null,
        },
        tenantStatistics: action.payload,
      };

    case "LOAD_TENANT_STATISTICS_ERROR":
      return {
        ...state,
        loadingStates: {
          ...state.loadingStates,
          tenantStatistics: false,
        },
        errors: {
          ...state.errors,
          tenantStatistics: action.payload,
        },
      };

    case "LOAD_ENTITY_STATISTICS_START":
      return {
        ...state,
        loadingStates: {
          ...state.loadingStates,
          entityStatistics: true,
        },
        errors: {
          ...state.errors,
          entityStatistics: null,
        },
      };

    case "LOAD_ENTITY_STATISTICS_SUCCESS":
      return {
        ...state,
        loadingStates: {
          ...state.loadingStates,
          entityStatistics: false,
        },
        errors: {
          ...state.errors,
          entityStatistics: null,
        },
        entityStatistics: action.payload,
      };

    case "LOAD_ENTITY_STATISTICS_ERROR":
      return {
        ...state,
        loadingStates: {
          ...state.loadingStates,
          entityStatistics: false,
        },
        errors: {
          ...state.errors,
          entityStatistics: action.payload,
        },
      };

    default:
      return state;
  }
};

// Combined reducer that delegates to specific reducers
const schemaManagementReducer = (
  state: SchemaManagementState,
  action: SchemaManagementAction
): SchemaManagementState => {
  // Try each reducer in order of specificity
  let newState = uiReducer(state, action);
  if (newState !== state) return newState;

  newState = entitiesReducer(state, action);
  if (newState !== state) return newState;

  newState = attributesReducer(state, action);
  if (newState !== state) return newState;

  newState = statisticsReducer(state, action);
  if (newState !== state) return newState;

  return state;
};

// Context
interface SchemaManagementContextValue {
  // State
  state: SchemaManagementState;

  // UI Actions
  setActiveEntity: (entityId: string) => void;
  setActiveTab: (tab: string) => void;
  setSearchTerm: (term: string) => void;
  setFilterType: (type: string) => void;

  // Data Loading
  loadEntities: () => Promise<void>;
  loadEntityFields: (entityId: string) => Promise<void>;
  loadTenantStatistics: () => Promise<void>;
  getEntityStatistics: (entityId: string) => Promise<SchemaStatisticsResponse>;

  // Attribute Operations
  addAttributeToEntity: (entityId: string, attributeData: CreateAttributeRequest) => Promise<void>;
  updateAttribute: (entityId: string, attributeId: string, updates: Partial<SchemaAttribute>) => void;
  updateAttributeFromEntity: (entityId: string, attributeId: string, attributeData: UpdateAttributeRequest) => Promise<void>;
  deleteAttributeFromEntity: (entityId: string, attributeId: string) => Promise<void>;
  syncAttribute: (entityId: string, attributeId: string) => void;

  // Utility Functions
  getEntityDisplayName: (entityId: string) => string;
  getCurrentEntityData: () => EntityData | undefined;
  getCurrentEntity: () => EntityType | undefined;
}

const SchemaManagementContext = createContext<
  SchemaManagementContextValue | undefined
>(undefined);

// Provider
interface SchemaManagementProviderProps {
  children: ReactNode;
}

export const SchemaManagementProvider: React.FC<
  SchemaManagementProviderProps
> = ({ children }) => {
  const [state, dispatch] = useReducer(schemaManagementReducer, {
    ...initialState,
  });

  const loadEntities = useCallback(async () => {
    try {
      dispatch({ type: "LOAD_ENTITIES_START" });

      // Use constant entity list instead of API call
      dispatch({ type: "LOAD_ENTITIES_SUCCESS", payload: CONSTANT_ENTITIES });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load entities";
      dispatch({ type: "LOAD_ENTITIES_ERROR", payload: errorMessage });
    }
  }, []);

  const loadEntityFields = useCallback(
    async (entityId: string) => {
      try {
        // console.log("Context - loadEntityFields called with:", {
        //   entityId,
        // });
        dispatch({ type: "LOAD_ENTITY_FIELDS_START", payload: entityId });

        // Get API-compatible entity type
        const apiEntityType = entityId as IdentityEntityType;

        // If entity type is not API-compatible, return empty fields
        if (!apiEntityType) {
          dispatch({
            type: "LOAD_ENTITY_FIELDS_SUCCESS",
            payload: { entityId, fields: [] },
          });
          return;
        }

        const apiResponse = await getEntityFields(apiEntityType);
        // console.log("Context - API response received:", apiResponse);

        // Map EntityFieldResponse to SchemaAttribute
        const schemaAttributes: SchemaAttribute[] = apiResponse.map(
          (field) => ({
            id: field.id,
            displayName: field.displayName,
            systemKey: field.systemKey,
            dataType: field.dataType,
            isEditable: field.isWritable,
            isRequired: field.isRequired,
            isSensitive: field.isSensitive,
            defaultValue: String(field.dataType).toUpperCase() === 'OBJECT'
              ? (field.defaultValue || null)
              : ((field.defaultValue != null && typeof field.defaultValue !== 'object') ? String(field.defaultValue) : ""), // Preserve objects for OBJECT types
            description: field.description,
            complianceTags: field.complianceTags,
            usageContext: field.usageContext,
            category: field.isCoreField ? "Core" : "Custom",
            validationRules: [], // Not provided in API response
            lastModified: new Date(field.updatedAt).toISOString().split("T")[0],
            modifiedBy: "system", // Not provided in API response
            isSystemAttribute: field.isCoreField,
            sourceMapping: `${field.systemKey}`, // Simplified mapping
            isUnique: field.isUnique, // Map the isUnique field
            isCoreField: field.isCoreField, // Map the isCoreField property
          })
        );

        // console.log("Context - Mapped schema attributes:", schemaAttributes);
        dispatch({
          type: "LOAD_ENTITY_FIELDS_SUCCESS",
          payload: { entityId, fields: schemaAttributes },
        });
      } catch (error) {
        console.error("Context - Error loading entity fields:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to load entity fields";
        dispatch({
          type: "LOAD_ENTITY_FIELDS_ERROR",
          payload: { entityId, error: errorMessage },
        });
      }
    },
    []
  );

  // Function to load tenant statistics
  const loadTenantStatistics = useCallback(async () => {
    try {
      dispatch({ type: "LOAD_TENANT_STATISTICS_START" });
      const statistics = await getTenantStatisticsAPI();
      dispatch({ type: "LOAD_TENANT_STATISTICS_SUCCESS", payload: statistics });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to load tenant statistics";
      dispatch({ type: "LOAD_TENANT_STATISTICS_ERROR", payload: errorMessage });
    }
  }, []);

  // Auto-load entities
  React.useEffect(() => {
    loadEntities();
  }, [loadEntities]);

  // Load tenant statistics when tenant ID changes
  React.useEffect(() => {
    loadTenantStatistics();
  }, [loadTenantStatistics]);

  const setActiveEntity = (entityId: string) => {
    dispatch({ type: "SET_ACTIVE_ENTITY", payload: entityId });
  };

  const setActiveTab = (tab: string) => {
    dispatch({ type: "SET_ACTIVE_TAB", payload: tab });
  };

  const setSearchTerm = (term: string) => {
    dispatch({ type: "SET_SEARCH_TERM", payload: term });
  };

  const setFilterType = (type: string) => {
    dispatch({ type: "SET_FILTER_TYPE", payload: type });
  };

  // Helpers declared early so they can be safely referenced in later hooks' dependency arrays
  const getCurrentEntityData = useCallback(() => {
    return state.entityData[state.activeEntity];
  }, [state.entityData, state.activeEntity]);

  const getCurrentEntity = useCallback(() => {
    return state.entityTypes.find((entity) => entity.id === state.activeEntity);
  }, [state.entityTypes, state.activeEntity]);

  const getEntityStatistics = useCallback(
    async (entityId: string): Promise<SchemaStatisticsResponse> => {
      try {
        dispatch({ type: "LOAD_ENTITY_STATISTICS_START" });

        // Get the current entity to access its identityType
        const currentEntity = getCurrentEntity();
        const entityType = currentEntity?.identityType || entityId;

        const statistics = await getStatisticsAPI(entityType as IdentityEntityType);

        dispatch({
          type: "LOAD_ENTITY_STATISTICS_SUCCESS",
          payload: statistics,
        });
        return statistics;
      } catch (error) {
        console.error("Context - Error loading entity statistics:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to load entity statistics";
        dispatch({
          type: "LOAD_ENTITY_STATISTICS_ERROR",
          payload: errorMessage,
        });
        throw error;
      }
    },
    [getCurrentEntity]
  );

  // Load entity statistics when active entity changes
  React.useEffect(() => {
    if (state.activeEntity && state.entityTypes.length > 0) {
      getEntityStatistics(state.activeEntity);
    }
  }, [state.activeEntity, state.entityTypes.length, getEntityStatistics]);

  const addAttributeToEntity = useCallback(
    async (entityId: string, attributeData: CreateAttributeRequest) => {
      try {
        // Get API-compatible entity type
        const apiEntityType = entityId as IdentityEntityType;

        // If entity type is not API-compatible, throw error
        if (!apiEntityType) {
          throw new Error(`Cannot add attributes to entity type: ${entityId}`);
        }

        // Call the API to add the attribute
        const response = await addAttributeAPI(
          apiEntityType,
          attributeData
        );

        // Convert the API response to SchemaAttribute format
        const newAttribute: SchemaAttribute = {
          id: response.id,
          displayName: response.displayName,
          systemKey: response.systemKey,
          dataType: response.dataType,
          isEditable: response.isWritable,
          isRequired: response.isRequired,
          isSensitive: response.isSensitive,
          defaultValue: String(response.dataType).toUpperCase() === 'OBJECT'
            ? (response.defaultValue || null)
            : ((response.defaultValue != null && typeof response.defaultValue !== 'object') ? String(response.defaultValue) : ""), // Preserve objects for OBJECT types
          description: response.description,
          complianceTags: response.complianceTags,
          usageContext: response.usageContext,

          // Additional fields
          category: "Custom", // User-created attributes are always custom
          validationRules: [], // Not provided in API response
          lastModified: new Date().toISOString().split("T")[0],
          modifiedBy: "user", // Could be replaced with actual user info
          isSystemAttribute: false, // User-created attributes are never system attributes
          sourceMapping: response.systemKey, // Use system key as source mapping
          isUnique: response.isUnique || false, // New field for uniqueness constraint
        };

        // Add the attribute to the local state
        dispatch({
          type: "ADD_ATTRIBUTE",
          payload: { entityId, attribute: newAttribute },
        });

        // Optionally refresh the entity fields to ensure sync
        await loadEntityFields(entityId);

        // Refresh tenant statistics after adding attribute
        await loadTenantStatistics();

        // Refresh entity statistics so charts reflect latest state
        await getEntityStatistics(entityId);
      } catch (error) {
        console.error("Error adding attribute to entity:", error);
        throw error;
      }
    },
    [loadEntityFields, loadTenantStatistics, getEntityStatistics]
  );

  const deleteAttributeFromEntity = useCallback(
    async (entityId: string, attributeId: string) => {
      try {
        // Get API-compatible entity type
        const apiEntityType = entityId as IdentityEntityType;

        // If entity type is not API-compatible, throw error
        if (!apiEntityType) {
          throw new Error(`Cannot delete attributes from entity type: ${entityId}`);
        }

        // Call the API to delete the attribute
        await deleteAttributeAPI(apiEntityType, attributeId);

        // Remove the attribute from the local state
        dispatch({
          type: "DELETE_ATTRIBUTE",
          payload: { entityId, attributeId },
        });

        // Optionally refresh the entity fields to ensure sync
        await loadEntityFields(entityId);

        // Refresh tenant statistics after deleting attribute
        await loadTenantStatistics();

        // Refresh entity statistics so charts reflect latest state
        await getEntityStatistics(entityId);
      } catch (error) {
        console.error("Error deleting attribute from entity:", error);
        throw error;
      }
    },
    [loadEntityFields, loadTenantStatistics, getEntityStatistics]
  );

  const updateAttributeFromEntity = useCallback(
    async (
      entityId: string,
      attributeId: string,
      attributeData: UpdateAttributeRequest
    ) => {
      try {
        // Get API-compatible entity type
        const apiEntityType = entityId as IdentityEntityType;

        // If entity type is not API-compatible, throw error
        if (!apiEntityType) {
          throw new Error(`Cannot update attributes for entity type: ${entityId}`);
        }

        // Call the API to update the attribute
        const response = await updateAttributeAPI(
          apiEntityType,
          attributeId,
          attributeData
        );

        // Convert the API response to SchemaAttribute format and update local state
        const updatedAttribute: Partial<SchemaAttribute> = {
          id: response.id,
          displayName: response.displayName,
          systemKey: response.systemKey,
          dataType: response.dataType,
          isEditable: response.isWritable,
          isRequired: response.isRequired,
          isSensitive: response.isSensitive,
          description: response.description,
          complianceTags: response.complianceTags,
          usageContext: response.usageContext,
          lastModified: new Date(response.updatedAt)
            .toISOString()
            .split("T")[0],
          isSystemAttribute: response.isCoreField,
          sourceMapping: response.systemKey, // Simplified mapping
        };

        // Update the attribute in the local state
        dispatch({
          type: "UPDATE_ATTRIBUTE",
          payload: { entityId, attributeId, updates: updatedAttribute },
        });

        // Optionally refresh the entity fields to ensure sync
        await loadEntityFields(entityId);

        // Refresh tenant statistics after updating attribute
        await loadTenantStatistics();

        // Refresh entity statistics so charts reflect latest state
        await getEntityStatistics(entityId);
      } catch (error) {
        console.error("Error updating attribute from entity:", error);
        throw error;
      }
    },
    [loadEntityFields, loadTenantStatistics, getEntityStatistics]
  );

  const updateAttribute = useCallback(
    async (
      entityId: string,
      attributeId: string,
      updates: Partial<SchemaAttribute>
    ) => {
      try {
        // Convert the updates to UpdateAttributeRequest format
        const updateRequest: UpdateAttributeRequest = {
          displayName: updates.displayName,
          description: updates.description,
          isRequired: updates.isRequired,
          isSensitive: updates.isSensitive,
          // Map UI 'isEditable' to backend 'isWritable'
          isWritable: updates.isEditable,
        };

        // Get API-compatible entity type
        const apiEntityType = entityId as IdentityEntityType;

        // If entity type is not API-compatible, throw error
        if (!apiEntityType) {
          throw new Error(`Cannot update attributes for entity type: ${entityId}`);
        }

        await updateAttributeAPI(apiEntityType, attributeId, updateRequest);

        // Update local state after successful API call
        dispatch({
          type: "UPDATE_ATTRIBUTE",
          payload: { entityId, attributeId, updates },
        });

        // Refresh the entity fields to ensure UI reflects actual API state
        await loadEntityFields(entityId);

        // Refresh entity statistics so charts reflect latest state
        await getEntityStatistics(entityId);

        return true;
      } catch (error) {
        console.error("Failed to update attribute:", error);
        throw error;
      }
    },
    [loadEntityFields, getEntityStatistics]
  );

  const syncAttribute = (entityId: string, attributeId: string) => {
    dispatch({ type: "SYNC_ATTRIBUTE", payload: { entityId, attributeId } });
  };

  const getEntityDisplayName = useCallback(
    (entityId: string) => {
      const entity = state.entityTypes.find((e) => e.id === entityId);

      if (entity?.name) {
        return entity.name;
      }

      // Fallback: try to create a user-friendly name from common entity types
      const entityTypeFallbacks: Record<string, string> = {
        "employee-identities": "Employee Identity",
        "non-human-identities": "Non-Human Identity",
        "non-employee-identities": "Non-Employee Identity",
        accounts: "Account",
        "business-roles": "Business Role",
        entitlements: "Entitlement",
        applications: "Application",
        connectors: "Connector",
      };

      // Check if entityId matches any known patterns
      for (const [key, value] of Object.entries(entityTypeFallbacks)) {
        if (entityId.toLowerCase().includes(key.toLowerCase())) {
          return value;
        }
      }

      // Last resort: return a truncated version of the ID
      return `Entity (${entityId.substring(0, 8)}...)`;
    },
    [state.entityTypes]
  );

  // Removed duplicate later declarations (now defined earlier)

  const value: SchemaManagementContextValue = {
    state,
    setActiveEntity,
    setActiveTab,
    setSearchTerm,
    setFilterType,
    loadEntities,
    loadEntityFields,
    getEntityStatistics,
    loadTenantStatistics,
    addAttributeToEntity,
    updateAttribute,
    updateAttributeFromEntity,
    deleteAttributeFromEntity,
    syncAttribute,
    getEntityDisplayName,
    getCurrentEntityData,
    getCurrentEntity,
  };

  return (
    <SchemaManagementContext.Provider value={value}>
      {children}
    </SchemaManagementContext.Provider>
  );
};

// Hook
export const useSchemaManagement = () => {
  const context = useContext(SchemaManagementContext);
  if (context === undefined) {
    throw new Error(
      "useSchemaManagement must be used within a SchemaManagementProvider"
    );
  }
  return context;
};
