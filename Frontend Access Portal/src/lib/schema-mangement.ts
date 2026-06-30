import {
  EntitiesSchemaManagementResponse,
  EntityFieldResponse,
  CreateAttributeRequest,
  UpdateAttributeRequest,
  SchemaStatisticsResponse,
  TenantStatisticsResponse,
} from "@/types/schema-mangement";
import { _getAuthToken } from "./auth";

// Define types for the new API response structure
interface CoreAttribute {
  fieldName: string;
  displayName: string;
  dataType: string;
  isRequired: boolean;
  isRelationship: boolean;
  relationshipType: string | null;
  description: string;
}

interface ExtendedAttribute {
  id?: string;
  systemKey: string;
  displayName: string;
  dataType: string;
  description: string;
  isRequired: boolean;
  isSensitive?: boolean;
  // Some backends may spell this as isWriteable; keep both optional and normalize later
  isWritable?: boolean;
  isWriteable?: boolean;
  isMultiValue?: boolean;
  syncFlag?: boolean;
  usageContext?: string;
  sourceSystem?: string;
  displayOrder?: number;
  complianceTags?: string[];
  createdAt?: number;
  updatedAt?: number;
  defaultValue?: string | object | null;
}

interface SchemaFieldsResponse {
  coreAttributes: CoreAttribute[];
  extendedAttributes: ExtendedAttribute[];
}

// Get all Entities for a specific tenant
export const getEntitiesSchemaMangement = async (): Promise<EntitiesSchemaManagementResponse> => {
  const token = await _getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }
  const response = await fetch(`/api/identity/contexts`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error ||
      errorData.message ||
      `Failed to fetch entities: ${response.status}`
    );
  }
  return response.json();
};

// Get all fields/attributes for a specific entity
export const getEntityFields = async (
  entityId: string
): Promise<EntityFieldResponse[]> => {
  // console.log("Lib - getEntityFields called with:", { entityId });

  const token = await _getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  // Use the API route
  const url = `/api/identity/schema/${entityId}`;

  // console.log("Lib - Making request to:", url);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  // console.log("Lib - Response status:", response.status);
  // console.log("Lib - Response ok:", response.ok);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    // console.log("Lib - Error data:", errorData);
    throw new Error(
      errorData.error ||
      errorData.message ||
      `Failed to fetch entity fields: ${response.status}`
    );
  }

  const data: SchemaFieldsResponse | EntityFieldResponse[] = await response.json();
  // console.log("Lib - Response data:", data);

  // Handle new API response structure with coreAttributes and extendedAttributes
  const schemaData = data as SchemaFieldsResponse;
  if (schemaData.coreAttributes && schemaData.extendedAttributes) {
    // Combine core and extended attributes into a single array
    const allAttributes: EntityFieldResponse[] = [
      ...schemaData.coreAttributes.map((attr: CoreAttribute): EntityFieldResponse => ({
        ...attr,
        isCoreField: true, // Mark as core field
        id: attr.fieldName, // Use fieldName as ID for core attributes
        schemaId: entityId, // Use the entityId as schemaId
        systemKey: attr.fieldName,
        displayName: attr.displayName,
        dataType: attr.dataType,
        description: attr.description,
        isRequired: attr.isRequired,
        isSensitive: false, // Default for core attributes
        // Backend schema for core attributes doesn't include isWritable; default to false to avoid incorrect checks
        isWritable: false,
        usageContext: "core",
        sourceSystem: "system",
        displayOrder: 0,
        complianceTags: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isUnique: false,
      })),
      ...schemaData.extendedAttributes.map((attr: ExtendedAttribute): EntityFieldResponse => ({
        ...attr,
        isCoreField: false, // Mark as extended field
        id: attr.id || attr.systemKey,
        schemaId: entityId, // Use the entityId as schemaId
        systemKey: attr.systemKey,
        displayName: attr.displayName,
        dataType: attr.dataType,
        description: attr.description,
        isRequired: attr.isRequired,
        isSensitive: attr.isSensitive || false,
        // Normalize isWritable naming and preserve explicit false; default to false when undefined
        isWritable: (attr.isWritable ?? attr.isWriteable) ?? false,
        usageContext: attr.usageContext || "extended",
        sourceSystem: attr.sourceSystem || "custom",
        displayOrder: attr.displayOrder || 0,
        complianceTags: attr.complianceTags || [],
        createdAt: attr.createdAt || Date.now(),
        updatedAt: attr.updatedAt || Date.now(),
        isUnique: false,
      })),
    ];
    return allAttributes;
  }

  // Fallback for old response format (if API still returns array)
  return Array.isArray(data) ? data : [];
};

// Add a new field/attribute to a specific entity
export async function addAttribute(
  entityId: string,
  attributeData: CreateAttributeRequest
): Promise<EntityFieldResponse> {
  console.log("addAttribute called with:", {
    entityId,
    attributeData,
  });

  const token = await _getAuthToken();
  if (!token) {
    throw new Error("Authentication token is required");
  }

  // Use the backend endpoint for creating attributes
  const url = `/api/identity/schema/${entityId}`;

  // Prepare the request data without entityId (now in URL)
  const requestData = {
    systemKey: attributeData.systemKey,
    displayName: attributeData.displayName,
    dataType: attributeData.dataType,
    description: attributeData.description,
    isRequired: attributeData.isRequired,
    isUnique: attributeData.isUnique || false,
    isSensitive: attributeData.isSensitive,
    isWritable: attributeData.isWritable,
    defaultValue: attributeData.defaultValue,
  };

  try {
    console.log("Making POST request to:", url);
    console.log("Request body:", JSON.stringify(requestData, null, 2));

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestData),
    });

    console.log("Response status:", response.status);
    console.log("Response ok:", response.ok);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // For 409 (Conflict) - this is expected business logic, not a system error
      if (response.status === 409) {
        console.log(
          "Attribute creation conflict (409):",
          errorData.error || errorData.message
        );
        throw new Error(
          errorData.error ||
          errorData.message ||
          "An attribute with this system key already exists"
        );
      }

      // For other errors, log as error response data
      console.log("Error response data:", errorData);
      throw new Error(
        errorData.error ||
        errorData.message ||
        `Failed to add attribute: ${response.status} ${response.statusText}`
      );
    }

    const result: EntityFieldResponse = await response.json();
    console.log("Success response:", result);
    return result;
  } catch (error) {
    // Check if this is a business logic error (like 409 conflict)
    if (
      error instanceof Error &&
      error.message.includes("system key already exists")
    ) {
      // This is expected business logic, just re-throw without any error logging
      throw error;
    }

    // For unexpected system errors, log full details
    console.error("Unexpected error adding attribute:", error);
    throw error;
  }
}

// Delete a field/attribute from a specific entity
export async function deleteAttribute(
  entityId: string,
  attributeId: string
): Promise<void> {
  const token = await _getAuthToken();
  if (!token) {
    throw new Error("Authentication token is required");
  }

  try {
    // Use the backend endpoint for deleting attributes
    const url = `/api/identity/schema/${entityId}/${encodeURIComponent(attributeId)}`;

    const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // For 404 (Not Found) - this is expected when attribute doesn't exist
      if (response.status === 404) {
        console.log(
          "Attribute not found (404):",
          errorData.error || errorData.message
        );
      } else {
        console.log("Delete error response:", errorData);
      }

      throw new Error(
        errorData.error ||
        errorData.message ||
        `Failed to delete attribute: ${response.status} ${response.statusText}`
      );
    }

    // For DELETE operations, we don't need to return data
    return;
  } catch (error) {
    // Check if this is a business logic error (404 not found, etc.)
    if (
      error instanceof Error &&
      (error.message.includes("404") || error.message.includes("not found"))
    ) {
      // This is expected business logic, just re-throw without error logging
      throw error;
    }

    // For unexpected system errors, log details
    console.error("Unexpected error deleting attribute:", error);
    throw error;
  }
}

// Update/patch a field/attribute in a specific entity
export async function updateAttribute(
  entityId: string,
  attributeId: string,
  attributeData: UpdateAttributeRequest
): Promise<EntityFieldResponse> {
  const token = await _getAuthToken();
  if (!token) {
    throw new Error("Authentication token is required");
  }

  // Filter the request to only include allowed fields for updates
  const allowedUpdateFields = {
    ...(attributeData.displayName !== undefined && {
      displayName: attributeData.displayName,
    }),
    ...(attributeData.description !== undefined && {
      description: attributeData.description,
    }),
    ...(attributeData.isRequired !== undefined && {
      isRequired: attributeData.isRequired,
    }),
    ...(attributeData.isSensitive !== undefined && {
      isSensitive: attributeData.isSensitive,
    }),
    ...(attributeData.isWritable !== undefined && {
      isWritable: attributeData.isWritable,
    }),
    ...(attributeData.defaultValue !== undefined && {
      defaultValue: attributeData.defaultValue,
    }),
    ...(attributeData.clearDefaultValue !== undefined && {
      clearDefaultValue: attributeData.clearDefaultValue,
    }),
  };

  try {
    // Use the backend endpoint for updating attributes
    const url = `/api/identity/schema/${entityId}/${encodeURIComponent(attributeId)}`;

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(allowedUpdateFields),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error ||
        errorData.message ||
        `Failed to update attribute: ${response.status} ${response.statusText}`
      );
    }

    const result: EntityFieldResponse = await response.json();
    return result;
  } catch (error) {
    console.error("Error updating attribute:", error);
    throw error;
  }
}

// Get schema statistics for a specific entity
export async function getStatistics(
  entityType: string
): Promise<SchemaStatisticsResponse> {
  const token = await _getAuthToken();
  if (!token) {
    throw new Error("Authentication token is required");
  }

  try {
    const url = `/api/identity/schema/statistics/${encodeURIComponent(entityType)}`;

    console.log("Making GET request to:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Response status:", response.status);
    console.log("Response ok:", response.ok);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log("Error response data:", errorData);
      throw new Error(
        errorData.error ||
        errorData.message ||
        `Failed to fetch schema statistics: ${response.status} ${response.statusText}`
      );
    }

    const result: SchemaStatisticsResponse = await response.json();
    console.log("Success response:", result);
    return result;
  } catch (error) {
    console.error("Error fetching schema statistics:", error);
    throw error;
  }
}

// Get tenant statistics for a specific tenant
export async function getTenantStatistics(): Promise<TenantStatisticsResponse> {
  const token = await _getAuthToken();
  if (!token) {
    throw new Error("Authentication token is required");
  }

  try {
    const url = `/api/identity/statistics`;

    console.log("Making GET request to:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Response status:", response.status);
    console.log("Response ok:", response.ok);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log("Error response data:", errorData);
      throw new Error(
        errorData.error ||
        errorData.message ||
        `Failed to fetch tenant statistics: ${response.status} ${response.statusText}`
      );
    }

    const result: TenantStatisticsResponse = await response.json();
    console.log("Success response:", result);
    return result;
  } catch (error) {
    console.error("Error fetching tenant statistics:", error);
    throw error;
  }
}
