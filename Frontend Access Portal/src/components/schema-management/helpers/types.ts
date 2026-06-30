// Re-export the existing SchemaAttribute from the main types
export type { SchemaAttribute } from "@/types/schema-mangement";

export interface ExportOptions {
  includeMetadata: boolean;
  includeVersionHistory: boolean;
  includeComplianceTags: boolean;
  includeMultiLang: boolean;
}

export interface ValidationResults {
  valid: boolean;
  attributeCount?: number;
  warnings?: string[];
  errors?: string[];
}

export interface SchemaData {
  entityType: string;
  entityId: string;
  version: string;
  timestamp: string;
  attributes: Record<string, unknown>[]; // Using generic structure for import/export
  metadata?: {
    totalAttributes: number;
    requiredAttributes: number;
    sensitiveAttributes: number;
    customAttributes: number;
    systemAttributes: number;
    multiValueAttributes: number;
    syncedAttributes: number;
    highRiskAttributes: number;
    mediumRiskAttributes: number;
    lowRiskAttributes: number;
  };
  versionHistory?: unknown[];
}

export type ExportFormat = "json" | "csv" | "xlsx" | "xml";
