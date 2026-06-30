import { ValidationResults } from "./types";
import type { SchemaAttribute } from "@/types/schema-mangement";

export const parseJSONImport = (
  content: string,
  entityDisplayName: string,
  entityType: string
): Record<string, unknown> => {
  const jsonData = JSON.parse(content);

  if (Array.isArray(jsonData)) {
    // Direct array of attributes - preferred format
    return {
      entityType: entityDisplayName,
      entityId: entityType,
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      attributes: jsonData,
    };
  } else if (jsonData.attributes && Array.isArray(jsonData.attributes)) {
    // Full schema object with attributes property (backward compatibility)
    return jsonData;
  } else {
    throw new Error(
      "Invalid JSON format: Expected array of attributes (preferred) or object with 'attributes' property"
    );
  }
};

export const parseCSVImport = (
  content: string,
  entityDisplayName: string,
  entityType: string
): Record<string, unknown> => {
  const lines = content.split("\n");
  const rows = lines.slice(1).filter((line) => line.trim());

  const csvAttributes = rows.map((row, index) => {
    const values = row.split(",").map((v) => v.replace(/"/g, "").trim());
    return {
      id: `csv_${index + 1}`,
      displayName: values[0] || "",
      systemKey: values[1] || "",
      dataType: values[2] || "String",
      isRequired: values[3] === "Yes",
      isSensitive: values[4] === "Yes",
      isMultiValue: values[5] === "Yes",
      isEditable: values[6] === "Yes",
      riskLevel: values[7] || "low",
      description: values[8] || "",
      usageContext: values[9] || "",
      complianceTags: values[10]
        ? values[10].split(";").map((t) => t.trim())
        : [],
      lastModified: values[11] || new Date().toISOString().split("T")[0],
    };
  });

  return {
    entityType: entityDisplayName,
    entityId: entityType,
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    attributes: csvAttributes,
  };
};

export const parseXMLImport = (
  content: string,
  entityDisplayName: string,
  entityType: string
): Record<string, unknown> => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(content, "text/xml");

  // Check if it's a full schema document or just attributes
  const schemaElement = xmlDoc.getElementsByTagName("schema")[0];
  const attributeElements = xmlDoc.getElementsByTagName("attribute");

  const xmlAttributes = Array.from(attributeElements).map((attr, index) => ({
    id: attr.getElementsByTagName("id")[0]?.textContent || `xml_${index + 1}`,
    displayName: attr.getElementsByTagName("displayName")[0]?.textContent || "",
    systemKey: attr.getElementsByTagName("systemKey")[0]?.textContent || "",
    dataType: attr.getElementsByTagName("dataType")[0]?.textContent || "String",
    isRequired:
      attr.getElementsByTagName("isRequired")[0]?.textContent === "true",
    isSensitive:
      attr.getElementsByTagName("isSensitive")[0]?.textContent === "true",
    riskLevel: attr.getElementsByTagName("riskLevel")[0]?.textContent || "low",
    description: attr.getElementsByTagName("description")[0]?.textContent || "",
  }));

  return {
    entityType:
      schemaElement?.getElementsByTagName("entityType")[0]?.textContent ||
      entityDisplayName,
    entityId:
      schemaElement?.getElementsByTagName("entityId")[0]?.textContent ||
      entityType,
    version:
      schemaElement?.getElementsByTagName("version")[0]?.textContent || "1.0.0",
    timestamp:
      schemaElement?.getElementsByTagName("timestamp")[0]?.textContent ||
      new Date().toISOString(),
    attributes: xmlAttributes,
  };
};

export const parseImportFile = (
  content: string,
  filename: string,
  entityDisplayName: string,
  entityType: string
): Record<string, unknown> => {
  const fileExtension = filename.split(".").pop()?.toLowerCase();

  switch (fileExtension) {
    case "json":
      return parseJSONImport(content, entityDisplayName, entityType);
    case "csv":
      return parseCSVImport(content, entityDisplayName, entityType);
    case "xml":
      return parseXMLImport(content, entityDisplayName, entityType);
    default:
      throw new Error(`Unsupported file format: ${fileExtension}`);
  }
};

export const validateImportData = (
  data: Record<string, unknown>,
  existingAttributes?: SchemaAttribute[]
): ValidationResults => {
  const attributes = (data.attributes as Record<string, unknown>[]) || [];
  const warnings: string[] = [];
  const errors: string[] = [];

  if (attributes.length === 0) {
    errors.push("No attributes found in import file");
  }

  // Check for required fields
  attributes.forEach((attr: Record<string, unknown>, index: number) => {
    if (!attr.displayName) {
      errors.push(`Attribute ${index + 1}: Missing display name`);
    }
    if (!attr.systemKey) {
      errors.push(`Attribute ${index + 1}: Missing system key`);
    }
    if (!attr.dataType) {
      warnings.push(
        `Attribute ${index + 1}: Missing data type, defaulting to String`
      );
    }
  });

  // Check for duplicate system keys
  const systemKeys = attributes
    .map((attr: Record<string, unknown>) => attr.systemKey as string)
    .filter(Boolean);
  const duplicateKeys = systemKeys.filter(
    (key: string, index: number) => systemKeys.indexOf(key) !== index
  );
  if (duplicateKeys.length > 0) {
    errors.push(`Duplicate system keys found: ${duplicateKeys.join(", ")}`);
  }

  // Check for attributes that might override existing ones
  if (existingAttributes) {
    const existingKeys = existingAttributes.map((attr) => attr.systemKey);
    const conflictingKeys = systemKeys.filter((key: string) =>
      existingKeys.includes(key)
    );
    if (conflictingKeys.length > 0) {
      warnings.push(
        `${
          conflictingKeys.length
        } attributes will override existing ones: ${conflictingKeys
          .slice(0, 3)
          .join(", ")}${conflictingKeys.length > 3 ? "..." : ""}`
      );
    }
  }

  return {
    valid: errors.length === 0,
    attributeCount: attributes.length,
    warnings: warnings.length > 0 ? warnings : undefined,
    errors: errors.length > 0 ? errors : undefined,
  };
};
