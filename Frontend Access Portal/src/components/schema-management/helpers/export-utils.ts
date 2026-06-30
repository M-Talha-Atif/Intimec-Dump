import { ExportOptions, ExportFormat, SchemaData } from "./types";
import type { SchemaAttribute } from "@/types/schema-mangement";

export const prepareAttributesData = (
  attributes: SchemaAttribute[],
  exportOptions: ExportOptions
): Partial<SchemaAttribute>[] => {
  return attributes.map((attr) => ({
    id: attr.id,
    displayName: attr.displayName,
    systemKey: attr.systemKey,
    dataType: attr.dataType,
    isMultiValue: attr.isMultiValue,
    isEditable: attr.isEditable,
    isRequired: attr.isRequired,
    isSensitive: attr.isSensitive,
    syncFlag: attr.syncFlag,
    defaultValue: attr.defaultValue,
    description: attr.description,
    ...(exportOptions.includeComplianceTags && {
      complianceTags: attr.complianceTags,
    }),
    riskLevel: attr.riskLevel,
    usageContext: attr.usageContext,
    ...(exportOptions.includeMultiLang && {
      multilangLabels: attr.multilangLabels,
    }),
    category: attr.category,
    validationRules: attr.validationRules,
    lastModified: attr.lastModified,
    modifiedBy: attr.modifiedBy,
    syncStatus: attr.syncStatus,
    isSystemAttribute: attr.isSystemAttribute,
    sourceMapping: attr.sourceMapping,
  }));
};

export const createExportData = (
  attributes: SchemaAttribute[],
  attributesData: Partial<SchemaAttribute>[],
  exportOptions: ExportOptions,
  entityDisplayName: string,
  entityType: string,
  currentEntityData?: { detailedRecentChanges?: unknown[] }
): SchemaData | Partial<SchemaAttribute>[] => {
  if (exportOptions.includeMetadata) {
    return {
      entityType: entityDisplayName,
      entityId: entityType,
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      attributes: attributesData as Record<string, unknown>[],
      metadata: {
        totalAttributes: attributes.length,
        requiredAttributes: attributes.filter((attr) => attr.isRequired).length,
        sensitiveAttributes: attributes.filter((attr) => attr.isSensitive)
          .length,
        customAttributes: attributes.filter(
          (attr) => attr.category === "Custom"
        ).length,
        systemAttributes: attributes.filter((attr) => attr.isSystemAttribute)
          .length,
        multiValueAttributes: attributes.filter((attr) => attr.isMultiValue)
          .length,
        syncedAttributes: attributes.filter((attr) => attr.syncFlag).length,
        highRiskAttributes: attributes.filter(
          (attr) => attr.riskLevel === "high"
        ).length,
        mediumRiskAttributes: attributes.filter(
          (attr) => attr.riskLevel === "medium"
        ).length,
        lowRiskAttributes: attributes.filter((attr) => attr.riskLevel === "low")
          .length,
      },
      ...(exportOptions.includeVersionHistory && {
        versionHistory: currentEntityData?.detailedRecentChanges || [],
      }),
    };
  }
  return attributesData; // Just the array of attributes
};

export const generateFilename = (
  entityDisplayName: string,
  exportFormat: ExportFormat
): string => {
  const timestamp = new Date().toISOString().split("T")[0];
  return `${entityDisplayName
    .replace(/\s+/g, "-")
    .toLowerCase()}-schema-${timestamp}.${exportFormat}`;
};

export const createCSVBlob = (attributes: SchemaAttribute[]): Blob => {
  const csvHeaders = [
    "Display Name",
    "System Key",
    "Data Type",
    "Required",
    "Sensitive",
    "Multi-Value",
    "Editable",
    "Risk Level",
    "Description",
    "Usage Context",
  ];

  const csvRows = attributes.map((attr) => [
    attr.displayName,
    attr.systemKey,
    attr.dataType,
    attr.isRequired ? "Yes" : "No",
    attr.isSensitive ? "Yes" : "No",
    attr.isMultiValue ? "Yes" : "No",
    attr.isEditable ? "Yes" : "No",
    attr.riskLevel,
    attr.description || "",
    attr.usageContext || "",
  ]);

  const csvContent = [csvHeaders, ...csvRows]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");

  return new Blob([csvContent], { type: "text/csv" });
};

export const createXLSXBlob = (attributes: SchemaAttribute[]): Blob => {
  const xlsxHeaders = [
    "Display Name",
    "System Key",
    "Data Type",
    "Required",
    "Sensitive",
    "Multi-Value",
    "Editable",
    "Risk Level",
    "Description",
    "Usage Context",
    "Compliance Tags",
    "Last Modified",
  ];

  const xlsxRows = attributes.map((attr) => [
    attr.displayName,
    attr.systemKey,
    attr.dataType,
    attr.isRequired ? "Yes" : "No",
    attr.isSensitive ? "Yes" : "No",
    attr.isMultiValue ? "Yes" : "No",
    attr.isEditable ? "Yes" : "No",
    attr.riskLevel,
    attr.description || "",
    attr.usageContext || "",
    attr.complianceTags?.join("; ") || "",
    attr.lastModified || "",
    attr.syncStatus || "",
  ]);

  const xlsxContent = [xlsxHeaders, ...xlsxRows]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");

  return new Blob([xlsxContent], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
};

export const createXMLBlob = (
  attributes: SchemaAttribute[],
  exportOptions: ExportOptions,
  entityDisplayName: string,
  entityType: string
): Blob => {
  const xmlContent = exportOptions.includeMetadata
    ? `<?xml version="1.0" encoding="UTF-8"?>
<schema>
  <entityType>${entityDisplayName}</entityType>
  <entityId>${entityType}</entityId>
  <version>1.0.0</version>
  <timestamp>${new Date().toISOString()}</timestamp>
  <attributes>
    ${attributes
      .map(
        (attr) => `
    <attribute>
      <id>${attr.id}</id>
      <displayName>${attr.displayName}</displayName>
      <systemKey>${attr.systemKey}</systemKey>
      <dataType>${attr.dataType}</dataType>
      <isRequired>${attr.isRequired}</isRequired>
      <isSensitive>${attr.isSensitive}</isSensitive>
      <riskLevel>${attr.riskLevel}</riskLevel>
      <description>${attr.description || ""}</description>
    </attribute>`
      )
      .join("")}
  </attributes>
</schema>`
    : `<?xml version="1.0" encoding="UTF-8"?>
<attributes>
  ${attributes
    .map(
      (attr) => `
  <attribute>
    <id>${attr.id}</id>
    <displayName>${attr.displayName}</displayName>
    <systemKey>${attr.systemKey}</systemKey>
    <dataType>${attr.dataType}</dataType>
    <isRequired>${attr.isRequired}</isRequired>
    <isSensitive>${attr.isSensitive}</isSensitive>
    <riskLevel>${attr.riskLevel}</riskLevel>
    <description>${attr.description || ""}</description>
  </attribute>`
    )
    .join("")}
</attributes>`;

  return new Blob([xmlContent], { type: "application/xml" });
};

export const createJSONBlob = (
  exportData: SchemaData | Partial<SchemaAttribute>[]
): Blob => {
  return new Blob([JSON.stringify(exportData, null, 2)], {
    type: "application/json",
  });
};

export const downloadFile = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
