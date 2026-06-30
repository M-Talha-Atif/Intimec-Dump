import { useState, useEffect, useCallback, useRef } from "react";
import { CorrelationRule, IdentityType, SchemaAttribute } from "../types/index";
import { getInitialRulesForIdentityType } from "../data/correlationMockData";
import {
  validateCorrelationRule,
  createNewCorrelationRule,
  moveRuleInArray,
  fetchCorrelationRules,
  saveCorrelationRules,
  CorrelationRuleApiResponse,
} from "../utils/correlationUtils";
import { fetchSchemaAttributes, fetchApplications } from "../utils/mappingUtils";
import { toast } from "sonner";

export interface AvailableSource {
  id: string;
  name: string;
}

export const useCorrelationRules = (
  identityType: IdentityType,
  schemaId?: string
) => {
  const [rules, setRules] = useState<CorrelationRule[]>([]);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiRules, setApiRules] = useState<CorrelationRuleApiResponse[]>([]);
  const [deletedRuleApiIds, setDeletedRuleApiIds] = useState<string[]>([]);
  // Tracks card IDs (_cardId) that the user has actually edited this session.
  // On save, only resources linked to these cards get a PUT request.
  const changedCardIdsRef = useRef<Set<string>>(new Set());
  const [availableSources, setAvailableSources] = useState<AvailableSource[]>([]);

  // Schema attributes state
  const [schemaAttributes, setSchemaAttributes] = useState<
    Record<string, SchemaAttribute[]>
  >({});
  const [isLoadingSchemaAttributes, setIsLoadingSchemaAttributes] = useState<
    Record<string, boolean>
  >({});
  const [schemaAttributesError, setSchemaAttributesError] = useState<
    Record<string, string | null>
  >({});

  // Identity attributes state (from identity schema)
  const [identityAttributes, setIdentityAttributes] = useState<
    { systemKey: string; displayName: string }[]
  >([]);
  const [isLoadingIdentityAttributes, setIsLoadingIdentityAttributes] =
    useState(false);

  // Track which resources we've already attempted to fetch using ref to avoid dependency issues
  const fetchedResourcesRef = useRef<Set<string>>(new Set());

  // Helper function to transform API response to CorrelationRule format
  const transformApiRuleToCorrelationRule = (
    apiRule: CorrelationRuleApiResponse,
    index: number
  ): CorrelationRule => {
    // Use the backend-assigned id (stable across saves) as the card id;
    // fall back to a position-based id for newly added rules with no backend id yet.
    const cardId = apiRule._cardId ?? `rule-${apiRule.resourceId}-${index}`;
    return {
      id: cardId,
      name: `Correlation Rule ${index + 1}`,
      type: "primary",
      priority: index + 1,
      enabled: true,
      sourceAttribute: apiRule.ruleGroup.rules[0]?.field || "",
      targetAttribute: apiRule.ruleGroup.rules[0]?.value || "",
      joinCondition: `${apiRule.ruleGroup.rules[0]?.field} ${apiRule.ruleGroup.rules[0]?.operator} ${apiRule.ruleGroup.rules[0]?.value}`,
      conflictResolution: "manual-review",
      sources: [apiRule.resourceId],
      isValid: true,
      validationErrors: [],
    };
  };

  // Function to fetch identity schema attributes
  const fetchIdentitySchemaAttributes = useCallback(async () => {
    const entityTypeMap: Record<string, string> = {
      employee: "employee",
      "non-employee": "non_employee",
      "non-human": "non_human",
    };
    const entityType = entityTypeMap[identityType] || "employee";

    setIsLoadingIdentityAttributes(true);
    try {
      const response = await fetch(`/api/identity/schema/${entityType}`);
      if (!response.ok) throw new Error(`Failed to fetch identity schema: ${response.status}`);
      const data = await response.json();
      const attrs = (data.coreAttributes || data.attributes || []).map(
        (a: { systemKey?: string; attributeKey?: string; displayName?: string; name?: string }) => ({
          systemKey: a.systemKey || a.attributeKey || "",
          displayName: a.displayName || a.name || a.systemKey || "",
        })
      );
      setIdentityAttributes(attrs);
    } catch (err) {
      console.error("Failed to fetch identity attributes:", err);
    } finally {
      setIsLoadingIdentityAttributes(false);
    }
  }, [identityType]);

  // Fetch identity schema attributes on mount and when identityType changes
  useEffect(() => {
    fetchIdentitySchemaAttributes();
  }, [fetchIdentitySchemaAttributes]);

  // Fetch available source applications for the source selector
  useEffect(() => {
    const loadSources = async () => {
      try {
        const apps = await fetchApplications();
        setAvailableSources(apps.map((a) => ({ id: String(a.id), name: a.name })));
      } catch (err) {
        console.error("Failed to fetch available sources:", err);
        toast.error("Could not load source applications", {
          description: "The resource dropdown may be empty. Check your connection.",
        });
      }
    };
    loadSources();
  }, []);

  // Once availableSources loads, update rule names that still show generic defaults
  useEffect(() => {
    if (availableSources.length === 0 || rules.length === 0) return;
    const sourceMap = new Map(availableSources.map((s) => [s.id, s.name]));
    setRules((prev) =>
      prev.map((r) => {
        const srcId = r.sources[0];
        const srcName = srcId ? sourceMap.get(srcId) : undefined;
        if (srcName && r.name.startsWith("Correlation Rule ")) {
          return { ...r, name: `Rule for ${srcName}` };
        }
        return r;
      })
    );
  }, [availableSources]);

  // Function to fetch schema attributes for unique resource IDs
  const fetchSchemaAttributesForResources = useCallback(
    async (apiRules: CorrelationRuleApiResponse[]) => {
      // Get unique resource IDs
      const uniqueResourceIds = [
        ...new Set(apiRules.map((rule) => rule.resourceId)),
      ];

      console.log(
        "Fetching schema attributes for resource IDs:",
        uniqueResourceIds
      );

      // Fetch schema attributes for each unique resource ID
      for (const resourceId of uniqueResourceIds) {
        // Skip if we've already processed this resource
        if (fetchedResourcesRef.current.has(resourceId)) {
          console.log(`Skipping ${resourceId} - already fetched`);
          continue;
        }

        // Mark as being fetched
        fetchedResourcesRef.current.add(resourceId);

        setIsLoadingSchemaAttributes((prev) => ({
          ...prev,
          [resourceId]: true,
        }));
        setSchemaAttributesError((prev) => ({ ...prev, [resourceId]: null }));

        try {
          console.log(`Fetching schema attributes for resource: ${resourceId}`);
          const attributes = await fetchSchemaAttributes(resourceId);

          console.log(`Schema attributes for ${resourceId}:`, attributes);
          setSchemaAttributes((prev) => ({
            ...prev,
            [resourceId]: attributes,
          }));
        } catch (err) {
          const errorMessage =
            err instanceof Error
              ? err.message
              : "Failed to fetch schema attributes";
          console.error(
            `Error fetching schema attributes for ${resourceId}:`,
            errorMessage
          );
          setSchemaAttributesError((prev) => ({
            ...prev,
            [resourceId]: errorMessage,
          }));
        } finally {
          setIsLoadingSchemaAttributes((prev) => ({
            ...prev,
            [resourceId]: false,
          }));
        }
      }
    },
    [] // Remove the problematic dependencies
  );

  // Function to fetch correlation rules from API
  const fetchRulesFromApi = useCallback(async () => {
    if (!schemaId) {
      setRules(getInitialRulesForIdentityType(identityType));
      return;
    }

    setIsLoading(true);
    setError(null);

    // Reset fetched resources when fetching new rules
    fetchedResourcesRef.current.clear();

    try {
      const apiResponse = await fetchCorrelationRules(schemaId);

      // Tag each apiRule with a stable _cardId (backend id, or derived fallback)
      const taggedApiResponse = apiResponse.map((ar, index) => ({
        ...ar,
        _cardId: ar.id ?? `rule-${ar.resourceId}-${index}`,
      }));
      setApiRules(taggedApiResponse);

      // Transform API response to CorrelationRule format
      const transformedRules = taggedApiResponse.map(
        (apiRule, index) => transformApiRuleToCorrelationRule(apiRule, index)
      );
      setRules(transformedRules);

      // Fetch schema attributes for all unique resource IDs
      await fetchSchemaAttributesForResources(apiResponse);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to fetch correlation rules";
      setError(errorMessage);

      // Fallback to mock data on error
      setRules(getInitialRulesForIdentityType(identityType));

      toast.error("Failed to load correlation rules", {
        description: "Using fallback data. " + errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }, [schemaId, identityType, fetchSchemaAttributesForResources]);

  // Reset rules when identity type or schemaId changes
  useEffect(() => {
    fetchRulesFromApi();
  }, [fetchRulesFromApi]);

  const addRule = () => {
    const newRule = createNewCorrelationRule(rules.length);
    // New rules start with empty sources — user must select a source
    setRules([...rules, newRule]);
    setHasUnsavedChanges(true);
  };

  // Set the source (application) for a rule — triggers schema fetch + creates apiRule entry
  const setRuleSource = async (ruleId: string, sourceId: string) => {
    // Update the frontend rule with the selected source
    const sourceName = availableSources.find((s) => s.id === sourceId)?.name || sourceId;
    setRules((prev) =>
      prev.map((r) =>
        r.id === ruleId ? { ...r, sources: [sourceId], name: `Rule for ${sourceName}` } : r
      )
    );

    // Create / replace the apiRule entry for this card.
    // We intentionally allow the same sourceId on multiple cards by keying on ruleId (_cardId).
    setApiRules((prev) => {
      // Remove any previous entry for this card (e.g. user changed the source)
      const withoutOld = prev.filter((ar) => ar._cardId !== ruleId);
      return [
        ...withoutOld,
        {
          resourceId: sourceId,
          mode: "CORRELATION",
          ruleGroup: { combinator: "and", rules: [] },
          _cardId: ruleId,
        },
      ];
    });
    changedCardIdsRef.current.add(ruleId);

    // Fetch schema attributes for the newly selected source
    if (!fetchedResourcesRef.current.has(sourceId)) {
      fetchedResourcesRef.current.add(sourceId);
      setIsLoadingSchemaAttributes((prev) => ({ ...prev, [sourceId]: true }));
      try {
        const attributes = await fetchSchemaAttributes(sourceId);
        setSchemaAttributes((prev) => ({ ...prev, [sourceId]: attributes }));
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to fetch schema";
        setSchemaAttributesError((prev) => ({ ...prev, [sourceId]: msg }));
      } finally {
        setIsLoadingSchemaAttributes((prev) => ({ ...prev, [sourceId]: false }));
      }
    }

    setHasUnsavedChanges(true);
  };

  // Update apiRules when AttributeMatchingUI propagates changes.
  // Uses cardId (_cardId) not resourceId so two cards sharing the same source stay independent.
  const updateApiRule = (cardId: string, ruleGroup: { combinator: string; rules: { field: string; operator: string; valueSource: string; value: string }[] }) => {
    setApiRules((prev) =>
      prev.map((ar) =>
        ar._cardId === cardId
          ? { ...ar, ruleGroup }
          : ar
      )
    );
    changedCardIdsRef.current.add(cardId);
    setHasUnsavedChanges(true);
  };

  const updateRule = (id: string, updates: Partial<CorrelationRule>) => {
    setRules(
      rules.map((rule) => {
        if (rule.id === id) {
          const updated = { ...rule, ...updates };
          const errors = validateCorrelationRule(updated);
          updated.isValid = errors.length === 0;
          updated.validationErrors = errors;
          return updated;
        }
        return rule;
      })
    );
    setHasUnsavedChanges(true);
  };

  const deleteRule = (id: string, onConfirm?: () => void) => {
    const rule = rules.find((r) => r.id === id);
    if (!rule) return; // Exit early if rule not found

    const performDeletion = () => {
      setRules(rules.filter((r) => r.id !== id));
      // Remove the apiRule linked to this card and, if it has a backend id, queue a DELETE call
      setApiRules((prev) => {
        const entry = prev.find((ar) => ar._cardId === id);
        if (entry?.id) {
          setDeletedRuleApiIds((ids) => [...ids, entry.id!]);
        }
        return prev.filter((ar) => ar._cardId !== id);
      });
      setHasUnsavedChanges(true);
      toast.success("Rule Deleted", {
        description: `Correlation rule "${rule.name}" has been removed.`,
      });
      onConfirm?.();
    };

    // If no confirmation callback provided, fall back to window.confirm
    if (!onConfirm) {
      if (
        window.confirm(
          `Are you sure you want to delete the rule "${rule.name}"?`
        )
      ) {
        performDeletion();
      }
    } else {
      // Return the rule info for the component to show in a dialog
      return {
        rule,
        performDeletion,
      };
    }
  };

  const movePriority = (id: string, direction: "up" | "down") => {
    const ruleIndex = rules.findIndex((r) => r.id === id);
    if (ruleIndex === -1) return;

    const targetIndex = direction === "up" ? ruleIndex - 1 : ruleIndex + 1;
    const newRules = moveRuleInArray(rules, ruleIndex, targetIndex);

    if (newRules !== rules) {
      setRules(newRules);
      setHasUnsavedChanges(true);
      toast.success("Priority Updated", {
        description: `Rule priority has been adjusted.`,
      });
    }
  };

  const testRules = async () => {
    setIsTestRunning(true);

    try {
      const warnings: string[] = [];
      const errors: string[] = [];

      // Validate each rule has a source and at least one matching condition
      for (const rule of rules) {
        if (rule.sources.length === 0) {
          errors.push(`Rule "${rule.name}": No source application selected`);
          continue;
        }

        // Validate the real apiRule data for this source
        const apiRule = apiRules.find((ar) => ar._cardId === rule.id);

        if (!apiRule) {
          errors.push(`Rule "${rule.name}": No matching configuration found for source`);
          continue;
        }

        if (!apiRule.ruleGroup || apiRule.ruleGroup.rules.length === 0) {
          errors.push(`Rule "${rule.name}": No matching conditions defined — add at least one rule`);
          continue;
        }

        for (let i = 0; i < apiRule.ruleGroup.rules.length; i++) {
          const r = apiRule.ruleGroup.rules[i];
          if (!r.field) {
            errors.push(`Rule "${rule.name}", condition ${i + 1}: Identity attribute is empty`);
          }
          if (!r.value) {
            errors.push(`Rule "${rule.name}", condition ${i + 1}: Account attribute is empty`);
          }
          if (!r.operator) {
            warnings.push(`Rule "${rule.name}", condition ${i + 1}: No operator selected, defaults to "="`);
          }
        }
      }

      if (errors.length > 0) {
        toast.error("Rule Test Failed", {
          description: `${errors.length} error(s): ${errors[0]}`,
        });
      } else if (warnings.length > 0) {
        toast.warning("Rule Test Complete", {
          description: `Tested ${rules.length} rules. ${warnings.length} warning(s) found.`,
        });
      } else {
        toast.success("Rule Test Complete", {
          description: `All ${rules.length} correlation rules passed validation.`,
        });
      }
    } finally {
      setIsTestRunning(false);
    }
  };

  const saveRules = async () => {
    if (!schemaId) {
      toast.error("Cannot save", { description: "No schema selected." });
      return;
    }

    setIsSaving(true);
    try {
      // Delete rules that were removed locally but exist in the backend.
      // Each DELETE triggers its own audit event on the backend.
      for (const ruleApiId of deletedRuleApiIds) {
        await fetch(
          `/api/identity/mapping/policies/${schemaId}/correlation/rules/${ruleApiId}`,
          { method: "DELETE" }
        );
      }
      setDeletedRuleApiIds([]);

      // Only PUT resources whose rules were actually edited (not just deleted).
      // This prevents one deletion from generating N UPDATE audit events for unchanged resources.
      const changedResourceIds = new Set(
        Array.from(changedCardIdsRef.current)
          .map((cardId) => apiRules.find((ar) => ar._cardId === cardId)?.resourceId)
          .filter((id): id is string => !!id)
      );
      if (changedResourceIds.size > 0) {
        await saveCorrelationRules(schemaId, apiRules, changedResourceIds);
      }
      changedCardIdsRef.current = new Set();

      setHasUnsavedChanges(false);
      toast.success("Correlation rules saved successfully.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error("Failed to save correlation rules", {
        description: message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const discardChanges = async () => {
    changedCardIdsRef.current = new Set();
    setHasUnsavedChanges(false);
    await fetchRulesFromApi();
  };

  const toggleRuleSource = (ruleId: string, source: string) => {
    const rule = rules.find((r) => r.id === ruleId);
    if (!rule) return;

    const newSources = rule.sources.includes(source)
      ? rule.sources.filter((s) => s !== source)
      : [...rule.sources, source];

    updateRule(ruleId, { sources: newSources });
  };

  // Function to refresh rules from API
  const refreshRules = useCallback(async () => {
    await fetchRulesFromApi();
  }, [fetchRulesFromApi]);

  // Computed values
  const activeRulesCount = rules.length;
  const validRulesCount = rules.filter((r) => r.isValid).length;
  const invalidRulesCount = rules.filter((r) => !r.isValid).length;

  return {
    // State
    rules,
    isTestRunning,
    isSaving,
    hasUnsavedChanges,
    isLoading,
    error,
    apiRules,
    availableSources,

    // Schema attributes state
    schemaAttributes,
    isLoadingSchemaAttributes,
    schemaAttributesError,

    // Identity attributes state
    identityAttributes,
    isLoadingIdentityAttributes,

    // Actions
    addRule,
    setRuleSource,
    updateApiRule,
    updateRule,
    deleteRule,
    movePriority,
    testRules,
    saveRules,
    discardChanges,
    toggleRuleSource,
    refreshRules,

    // Computed values
    activeRulesCount,
    validRulesCount,
    invalidRulesCount,
  };
};