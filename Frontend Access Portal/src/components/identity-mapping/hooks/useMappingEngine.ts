import { useState, useEffect, useCallback } from "react";
import {
  AttributeMapping,
  SystemAttributeMapping,
  Source,
  SchemaAttribute,
  IdentityType,
} from "../types/index";
import {
  generateMappingIdWithRandom,
  fetchSourcePriorities,
  convertApiToSource,
  fetchSchemaAttributes,
  fetchSystemMappings,
  fetchApplications,
} from "../utils/mappingUtils";
import { toast } from "sonner";
import { mappingSyncService } from "../services/mappingSyncService";
import { getEntityFields } from "../../../lib/schema-mangement";
import { EntityFieldResponse } from "../../../types/schema-mangement";

export const useMappingEngine = (schemaId: string) => {
  const [sources, setSources] = useState<Source[]>([]);
  const [isLoadingSources, setIsLoadingSources] = useState(false);

  // Entity fields state
  const [entityFields, setEntityFields] = useState<EntityFieldResponse[]>([]);
  const [isLoadingEntityFields, setIsLoadingEntityFields] = useState(false);
  const [entityFieldsError, setEntityFieldsError] = useState<string | null>(
    null
  );

  // Source attributes state - stores attributes for each source
  const [sourceAttributes, setSourceAttributes] = useState<
    Record<string, SchemaAttribute[]>
  >({});
  const [isLoadingSourceAttributes, setIsLoadingSourceAttributes] = useState<
    Record<string, boolean>
  >({});
  const [sourceAttributesError, setSourceAttributesError] = useState<
    Record<string, string | null>
  >({});

  const [mappings, setMappings] = useState<AttributeMapping[]>([]);

  // New system mappings state
  const [systemMappings, setSystemMappings] = useState<
    SystemAttributeMapping[]
  >([]);
  const [isLoadingSystemMappings, setIsLoadingSystemMappings] = useState(false);
  const [systemMappingsError, setSystemMappingsError] = useState<string | null>(
    null
  );

  const [syncAllModal, setSyncAllModal] = useState(false);

  // Fetch sources from API when schemaId changes
  useEffect(() => {
    const loadSources = async () => {
      if (!schemaId) return;

      setIsLoadingSources(true);
      try {
        const [apiData, appsData] = await Promise.all([
          fetchSourcePriorities(schemaId),
          fetchApplications().catch(() => []),
        ]);
        const appNameById = new Map<string, string>(
          appsData.map((a) => [a.id, a.name])
        );
        const rawSources = convertApiToSource(apiData);
        const prioritySourceIds = new Set(rawSources.map((s) => s.id));

        // Build the sources list: priority-configured apps first, then any other
        // onboarded apps so that mapping rules referencing them still show up in the dropdown.
        const extraSources = appsData
          .filter((a) => !prioritySourceIds.has(String(a.id)))
          .map((a, idx) => ({
            id: String(a.id),
            name: a.name,
            type: "External System",
            syncStatus: "not-configured" as const,
            priority: rawSources.length + idx + 1,
          }));

        const sources = [
          ...rawSources.map((s) => ({
            ...s,
            name: appNameById.get(s.id) ?? s.name,
          })),
          ...extraSources,
        ];
        setSources(sources);
      } catch (error) {
        console.error("Failed to load source priorities:", error);
        // Fallback to empty array if API fails
        setSources([]);
        toast.error("Failed to load source priorities", {
          description: "Please check your connection.",
        });
      } finally {
        setIsLoadingSources(false);
      }
    };

    loadSources();
  }, [schemaId]);

  // Fetch entity fields when schemaId changes
  useEffect(() => {
    const loadEntityFields = async () => {
      if (!schemaId) return;

      setIsLoadingEntityFields(true);
      setEntityFieldsError(null);

      try {
        const fieldsResponse = await getEntityFields(schemaId);
        // Store the complete EntityFieldResponse array
        setEntityFields(fieldsResponse);
      } catch (error) {
        console.error("Failed to load entity fields:", error);
        setEntityFieldsError("Failed to load entity fields");
        toast.error("Failed to load entity fields", {
          description: "Please check your connection and try again.",
        });
      } finally {
        setIsLoadingEntityFields(false);
      }
    };

    loadEntityFields();
  }, [schemaId]);

  // Reset mappings when schema changes (for now using empty array)
  useEffect(() => {
    setMappings([]);
  }, [schemaId]);

  // Fetch system mappings when schemaId changes
  useEffect(() => {
    const loadSystemMappings = async () => {
      if (!schemaId) return;

      setIsLoadingSystemMappings(true);
      setSystemMappingsError(null);

      try {
        const mappings = await fetchSystemMappings(schemaId);
        setSystemMappings(mappings);
      } catch (error) {
        console.error("Failed to load system mappings:", error);
        setSystemMappingsError("Failed to load system mappings");
        toast.error("Failed to load system mappings", {
          description: "Please check your connection and try again.",
        });
      } finally {
        setIsLoadingSystemMappings(false);
      }
    };

    loadSystemMappings();
  }, [schemaId]);

  // Subscribe to mapping sync updates
  useEffect(() => {
    const handleSyncedMappings = (syncedMappings: AttributeMapping[]) => {
      // Merge with existing mappings, avoiding duplicates
      setMappings((prev) => {
        const existingIds = new Set(prev.map((m) => m.id));
        const newMappings = syncedMappings.filter(
          (m) => !existingIds.has(m.id)
        );
        return [...prev, ...newMappings];
      });

      if (syncedMappings.length > 0) {
        toast.success("Schema Mappings Synced", {
          description: `${syncedMappings.length} mappings synchronized from authoritative source.`,
        });
      }
    };

    const handleSyncedSources = (syncedSources: Source[]) => {
      setSources(syncedSources);
    };

    // Subscribe to sync service updates
    mappingSyncService.subscribeMappingChanges(
      schemaId as IdentityType,
      handleSyncedMappings
    );
    mappingSyncService.subscribeSourceChanges(
      schemaId as IdentityType,
      handleSyncedSources
    );

    return () => {
      // Cleanup subscriptions would go here in a real implementation
    };
  }, [schemaId]);

  // New system mapping functions
  const addSystemMapping = () => {
    const newMapping: SystemAttributeMapping = {
      id: generateMappingIdWithRandom(),
      systemAttributeId: "",
      systemAttributeName: "New System Attribute",
      mappings: [
        {
          resourceId: "",
          sourceAttributeName: "",
          transformation: "direct",
        },
      ],

      identityType: "employee" as IdentityType, // TODO: Get from context
      isCollapsed: false,
    };
    setSystemMappings([...systemMappings, newMapping]);
    toast.success("System Mapping Added", {
      description: "New system mapping added with priority",
    });
  };

  const updateSystemMapping = (
    id: string,
    updates: Partial<SystemAttributeMapping>
  ) => {
    if (!id) {
      // Guard: skip updates for mappings with no stable id to prevent
      // accidentally updating every card that shares an empty-string id.
      console.warn("updateSystemMapping called with empty id — skipping", updates);
      return;
    }
    setSystemMappings((prevMappings) =>
      prevMappings.map((mapping) => {
        if (mapping.id === id) {
          return { ...mapping, ...updates };
        }
        return mapping;
      })
    );
  };

  const copySystemMapping = (id: string) => {
    const mapping = systemMappings.find((m) => m.id === id);
    if (mapping) {
      const newMapping: SystemAttributeMapping = {
        ...mapping,
        id: generateMappingIdWithRandom(),

        systemAttributeName: `${mapping.systemAttributeName}_copy`,
      };
      setSystemMappings([...systemMappings, newMapping]);
      toast.success("System Mapping Copied", {
        description: "Mapping copied and added",
      });
    }
  };

  const removeSystemMapping = (id: string, onConfirm?: () => void) => {
    const mapping = systemMappings.find((m) => m.id === id);
    if (!mapping) return; // Exit early if mapping not found

    const performRemoval = () => {
      setSystemMappings(systemMappings.filter((m) => m.id !== id));
      toast.success("System Mapping Deleted", {
        description: `Mapping for "${mapping.systemAttributeName}" has been removed.`,
      });
      onConfirm?.();
    };

    // If no confirmation callback provided, fall back to window.confirm
    if (!onConfirm) {
      if (
        window.confirm(
          `Are you sure you want to delete the mapping for "${mapping.systemAttributeName}"?`
        )
      ) {
        performRemoval();
      }
    } else {
      // Return the mapping info for the component to show in a dialog
      return {
        mapping,
        performRemoval,
      };
    }
  };

  // Function to fetch source attributes for a specific source
  const fetchSourceAttributesForSource = useCallback(
    async (sourceId: string) => {
      if (!sourceId) return;

      setIsLoadingSourceAttributes((prev) => ({ ...prev, [sourceId]: true }));
      setSourceAttributesError((prev) => ({ ...prev, [sourceId]: null }));

      try {
        const attributes = await fetchSchemaAttributes(sourceId);
        setSourceAttributes((prev) => ({ ...prev, [sourceId]: attributes }));
      } catch (error) {
        console.error(
          `Failed to load source attributes for ${sourceId}:`,
          error
        );
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to load source attributes";
        setSourceAttributesError((prev) => ({
          ...prev,
          [sourceId]: errorMessage,
        }));
        toast.error("Failed to load source attributes", {
          description: errorMessage,
        });
      } finally {
        setIsLoadingSourceAttributes((prev) => ({
          ...prev,
          [sourceId]: false,
        }));
      }
    },
    []
  );

  return {
    // State
    sources,
    mappings, // Keep for backward compatibility
    systemMappings, // New structure
    syncAllModal,
    isLoadingSources,
    isLoadingSystemMappings,
    systemMappingsError,

    // Entity fields state
    entityFields,
    isLoadingEntityFields,
    entityFieldsError,

    // Source attributes state
    sourceAttributes,
    isLoadingSourceAttributes,
    sourceAttributesError,

    // Actions - New structure
    addSystemMapping,
    updateSystemMapping,
    copySystemMapping,
    removeSystemMapping,

    fetchSourceAttributesForSource,

    // Modal controls
    setSyncAllModal,
  };
};
