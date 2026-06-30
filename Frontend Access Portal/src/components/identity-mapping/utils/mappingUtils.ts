import {
  AttributeMapping,
  IdentityType,
  ScriptType,
  SourcePriority,
  AvailableApplication,
  SchemaAttribute,
  SystemAttributeMapping,
} from "../types/index";
import { TARGET_ATTRIBUTES_BY_TYPE } from "../data/constants";

export const validateMapping = (mapping: AttributeMapping): string[] => {
  const errors: string[] = [];

  if (!mapping.sourceAttribute) errors.push("Source attribute is required");
  if (!mapping.targetAttribute) errors.push("Target attribute is required");

  const targetAttributes = TARGET_ATTRIBUTES_BY_TYPE[mapping.identityType];
  if (!targetAttributes.includes(mapping.targetAttribute)) {
    errors.push(
      `Target attribute '${mapping.targetAttribute}' not found in ${mapping.identityType} schema`
    );
  }

  if (mapping.transformation === "script" && !mapping.transformationScript) {
    errors.push(
      'Transformation script is required when transformation type is "script"'
    );
  }

  return errors;
};

export const generateMappingId = (): string => {
  return Date.now().toString();
};

export const generateMappingIdWithRandom = (): string => {
  return Date.now().toString() + Math.random();
};

export const highlightMappingElement = (mappingId: string): void => {
  const element = document.getElementById(`mapping-${mappingId}`);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "center" });
    element.classList.add("ring-2", "ring-blue-500", "ring-opacity-50");
    setTimeout(() => {
      element.classList.remove("ring-2", "ring-blue-500", "ring-opacity-50");
    }, 3000);
  }
};

export const createNewMapping = (
  identityType: IdentityType,
  mappingsLength: number,
  sourceNames: string[]
): AttributeMapping => {
  return {
    id: generateMappingId(),
    sourceAttribute: "",
    targetAttribute: "",
    transformation: "none",
    source: sourceNames[0] || "",
    priority: mappingsLength + 1,
    identityType,
    type: "string",
    isValid: false,
    validationErrors: ["Incomplete mapping"],
  };
};

// Fetch source priorities from API
export const fetchSourcePriorities = async (
  schemaId: string
): Promise<{ resourceId: string; sourceName: string; priority: number }[]> => {
  try {
    const response = await fetch(
      `/api/identity/mapping/policies/${schemaId}/source/priorities`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch source priorities: ${response.status}`);
    }

    // Backend returns IdentityTypePolicyDTO:
    // { sourcePriorities: [{ targetAttribute, priorities: [{ resourceId, sourceAttribute, priority }] }] }
    const data: {
      sourcePriorities?: {
        targetAttribute: string;
        priorities?: { resourceId: string; sourceAttribute: string; priority: number }[];
      }[];
    } = await response.json();

    // Flatten to unique sources (by resourceId), keeping the lowest priority value
    const byResourceId = new Map<string, { resourceId: string; sourceName: string; priority: number }>();
    for (const sp of data.sourcePriorities ?? []) {
      for (const p of sp.priorities ?? []) {
        const id = String(p.resourceId);
        const existing = byResourceId.get(id);
        if (!existing || p.priority < existing.priority) {
          byResourceId.set(id, {
            resourceId: id,
            sourceName: p.sourceAttribute,
            priority: p.priority,
          });
        }
      }
    }
    return Array.from(byResourceId.values()).sort((a, b) => a.priority - b.priority);
  } catch (error) {
    console.error("Error fetching source priorities:", error);
    throw error;
  }
};

// Convert API response to Source interface
export const convertApiToSource = (
  apiData: { resourceId: string; sourceName: string; priority: number }[]
) => {
  return apiData.map((item) => ({
    id: item.resourceId,
    name: item.sourceName,
    type: "External System", // Default type since API doesn't provide it
    syncStatus: "not-configured" as const, // Default status
    priority: item.priority,
  }));
};

// Update source priorities using PUT API
export const updateSourcePriorities = async (
  schemaId: string,
  sourcePriorities: SourcePriority[]
) => {
  try {
    const response = await fetch(
      `/api/identity/mapping/policies/${schemaId}/source/priorities`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sourcePriorities),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error ||
          `Failed to update source priorities: ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating source priorities:", error);
    throw error;
  }
};

// Fetch available applications from API
export const fetchApplications = async (): Promise<{ id: string; name: string }[]> => {
  try {
    const response = await fetch("/api/identity/applications");

    if (!response.ok) {
      throw new Error(`Failed to fetch applications: ${response.status}`);
    }

    const data = await response.json();
    // Backend returns Spring Page<ApplicationResponseDTO>: { content: [...], totalElements, ... }
    // ApplicationResponseDTO: { id, details: { name, ... }, ... }
    const items: { id: string; details?: { name?: string }; name?: string }[] =
      Array.isArray(data) ? data : (data.content ?? []);
    return items.map((app) => ({
      id: String(app.id),
      name: app.details?.name ?? app.name ?? "",
    }));
  } catch (error) {
    console.error("Error fetching applications:", error);
    throw error;
  }
};

// Fetch schema attributes for a specific application from API
export const fetchSchemaAttributes = async (
  resourceId: string
): Promise<SchemaAttribute[]> => {
  try {
    const response = await fetch(
      `/api/identity/applications/${resourceId}/schema-attributes`
    );

    if (!response.ok) {
      // Treat 404 as no schema available rather than a hard error
      if (response.status === 404) return [];
      throw new Error(`Failed to fetch schema attributes: ${response.status}`);
    }

    const data: { id: string; name: string; type: string; category: string }[] =
      await response.json();

    // Backend returns ApplicationSchemaDefinitionDTO: { id, name, type, category, description, flags }
    // Frontend expects SchemaAttribute: { id, nativeAttributeName, dataType, category }
    return data
      .filter((attr) => !!attr.name)
      .map((attr) => ({
        id: String(attr.id ?? ""),
        nativeAttributeName: attr.name ?? "",
        dataType: attr.type ?? "",
        category: attr.category ?? "",
      }));
  } catch (error) {
    console.error("Error fetching schema attributes:", error);
    throw error;
  }
};

// Convert API applications to AvailableSource format for AddSourcesModal
export const convertApplicationsToAvailableSources = (
  apiData: {
    id: string;
    name: string;
    status: string;
    authoritative: boolean;
  }[]
): AvailableApplication[] => {
  return apiData.map((app) => ({
    id: app.id,
    name: app.name,
    type: app.authoritative ? "Authoritative System" : "External System",
    syncStatus:
      app.status === "ACTIVE"
        ? ("not-configured" as const)
        : ("out-of-sync" as const),
    icon: getApplicationIcon(app.name), // Helper function to get icon
    description: `${app.authoritative ? "Authoritative" : "External"} system: ${
      app.name
    }`,
  }));
};

// Helper function to get icon based on application name
const getApplicationIcon = (name: string): string => {
  const lowerName = name.toLowerCase();

  if (lowerName.includes("github")) return "🐙";
  if (lowerName.includes("jira")) return "📋";
  if (lowerName.includes("gitlab")) return "🦊";
  if (lowerName.includes("hr") || lowerName.includes("workday")) return "👥";
  if (lowerName.includes("postgres") || lowerName.includes("db")) return "🗄️";
  if (lowerName.includes("azure") || lowerName.includes("microsoft"))
    return "🏢";
  if (lowerName.includes("google")) return "🌐";
  if (lowerName.includes("okta")) return "🔐";
  if (lowerName.includes("aws")) return "☁️";
  if (lowerName.includes("slack")) return "💬";
  if (lowerName.includes("salesforce")) return "☁️";

  // Default icon for unknown applications
  return "🔧";
};

// Backend response shape from AttributeMappingGroupDTO + AttributeMappingRuleDTO
// ScriptDTO fields are `data` and `lang` (matching OnboardingRequestDTO.ScriptDTO)
interface AttributeMappingRuleDTO {
  id?: string;
  sourceResourceId?: string;
  sourceAttributeName?: string;
  mode?: string;
  script?: { data?: string; lang?: string } | null;
}

interface AttributeMappingGroupDTO {
  targetAttributeName?: string;
  identityType?: string;
  mappings?: AttributeMappingRuleDTO[];
}

// Convert backend enum ("EMPLOYEE") to frontend union ("employee")
const toFrontendIdentityType = (backendType?: string): IdentityType => {
  const map: Record<string, IdentityType> = {
    EMPLOYEE: "employee",
    NON_EMPLOYEE: "non-employee",
    NON_HUMAN: "non-human",
  };
  return map[backendType ?? ""] ?? "employee";
};

// Transform AttributeMappingGroupDTO[] → SystemAttributeMapping[]
const transformMappingGroups = (
  groups: AttributeMappingGroupDTO[]
): SystemAttributeMapping[] =>
  groups.map((group) => ({
    id: group.targetAttributeName ?? "",
    systemAttributeId: group.targetAttributeName ?? "",
    systemAttributeName: group.targetAttributeName ?? "",
    identityType: toFrontendIdentityType(group.identityType),
    // Filter out rules that have no sourceResourceId — those are remnants of
    // old "global" policies that the backend couldn't backfill and are now
    // excluded from the backend response as well; this guard handles any case
    // where they still slip through to the frontend.
    mappings: (group.mappings ?? []).filter((rule) => !!rule.sourceResourceId).map((rule) => ({
      id: rule.id,
      resourceId: rule.sourceResourceId ?? "",
      sourceAttributeName: rule.sourceAttributeName ?? "",
      // Backend stores mode as uppercase enum ("UPPERCASE", "DIRECT"). Normalize
      // to lowercase to match the frontend TRANSFORMATIONS dropdown values.
      transformation: (rule.mode ?? "direct").toLowerCase(),
      ...(rule.script ? { script: { type: (rule.script.lang ?? "JAVASCRIPT") as ScriptType, content: rule.script.data ?? "" } } : {}),
    })),
    isCollapsed: false,
  }));

// Fetch attribute mappings from the real backend via Next.js API proxy
export const fetchSystemMappings = async (
  schemaId: string
): Promise<SystemAttributeMapping[]> => {
  try {
    const response = await fetch(
      `/api/identity/mapping/policies/${schemaId}/attribute/mappings`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch attribute mappings: ${response.status}`);
    }

    const data: AttributeMappingGroupDTO[] = await response.json();
    return transformMappingGroups(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error("Error fetching attribute mappings:", error);
    throw error;
  }
};

// Transform frontend SystemAttributeMapping[] → backend AttributeMappingDTO[]
// Backend expects flat list: { id, sourceResourceId, sourceAttributeName, targetAttributeName, mode, script }
const transformToBackendMappings = (
  systemMappings: SystemAttributeMapping[]
): {
  id: string | null;
  sourceResourceId: string;
  sourceAttributeName: string;
  targetAttributeName: string;
  mode: string;
  script: { data: string; lang: string } | null;
}[] => {
  const result: {
    id: string | null;
    sourceResourceId: string;
    sourceAttributeName: string;
    targetAttributeName: string;
    mode: string;
    script: { data: string; lang: string } | null;
  }[] = [];

  for (const mapping of systemMappings) {
    for (const rule of mapping.mappings) {
      result.push({
        id: rule.id ?? null, // preserve existing backend UUID; null means backend assigns a new one
        sourceResourceId: rule.resourceId,
        sourceAttributeName: rule.sourceAttributeName,
        targetAttributeName: mapping.systemAttributeName,
        mode: rule.transformation === "direct" ? "DIRECT" : (rule.transformation || "DIRECT").toUpperCase(),
        script: rule.script
          ? { data: rule.script.content, lang: rule.script.type || "JAVASCRIPT" }
          : null,
      });
    }
  }

  return result;
};

// Save attribute mappings via the all-in-one PUT /mapping/policies/{identityType}.
// Mappings may span multiple source resources, so we group by sourceResourceId and
// issue one request per resource — each carrying the correct resourceId the backend
// needs to locate / create the right IdentityGovernancePolicy row.
//
// Pass `changedSourceIds` (the set of sourceResourceIds the user actually edited)
// to skip PUT requests for unchanged resources.  This prevents a single transformation
// change from generating one audit event per source in the backend.
export const saveSystemMappings = async (
  schemaId: string,
  systemMappings: SystemAttributeMapping[],
  changedSourceIds?: Set<string>
): Promise<void> => {
  try {
    const allMappings = transformToBackendMappings(systemMappings);

    // Group current mappings by sourceResourceId
    const byResource = new Map<string, typeof allMappings>();
    for (const mapping of allMappings) {
      const key = mapping.sourceResourceId;
      if (!byResource.has(key)) byResource.set(key, []);
      byResource.get(key)!.push(mapping);
    }

    // Determine which sources to PUT:
    // - changedSourceIds provided: iterate that set (includes sources where all rows were deleted,
    //   which won't appear in byResource — those get an empty-array PUT to clear the backend).
    // - changedSourceIds not provided: iterate byResource (legacy / sync-all path).
    const sourcesToPut = changedSourceIds !== undefined
      ? Array.from(changedSourceIds)
      : Array.from(byResource.keys());

    await Promise.all(
      sourcesToPut.map(async (resourceId) => {
        // byResource may have no entry when all rows for this source were deleted.
        // In that case, send an empty attributeMappings list so the backend clears stored entries.
        const attributeMappings = byResource.get(resourceId) ?? [];

        const payload = { resourceId, attributeMappings };

        const response = await fetch(
          `/api/identity/mapping/policies/${schemaId}/attribute/mappings`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `Failed to save attribute mappings: ${response.status}`
          );
        }
      })
    );
  } catch (error) {
    console.error("Error saving attribute mappings:", error);
    throw error;
  }
};
