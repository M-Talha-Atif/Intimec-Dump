import { ValidationResults } from "./types";
import type { SchemaAttribute } from "@/types/schema-mangement";

export const validateSchemaAttributes = (
  attributes: SchemaAttribute[]
): ValidationResults => {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Perform actual validation checks
  if (attributes.length === 0) {
    errors.push("No attributes found in schema");
  }

  // Check for duplicate system keys
  const systemKeys = attributes.map((attr) => attr.systemKey);
  const duplicateKeys = systemKeys.filter(
    (key, index) => systemKeys.indexOf(key) !== index
  );
  if (duplicateKeys.length > 0) {
    errors.push(`Duplicate system keys found: ${duplicateKeys.join(", ")}`);
  }

  // Check for high-risk attributes without proper compliance tags
  const highRiskAttrs = attributes.filter(
    (attr) =>
      attr.riskLevel === "high" &&
      (!attr.complianceTags || attr.complianceTags.length === 0)
  );
  if (highRiskAttrs.length > 0) {
    warnings.push(
      `${highRiskAttrs.length} high-risk attributes missing compliance tags`
    );
  }

  // Check for sensitive attributes that are not required
  const sensitiveMissingRequired = attributes.filter(
    (attr) => attr.isSensitive && !attr.isRequired
  );
  if (sensitiveMissingRequired.length > 0) {
    warnings.push(
      `${sensitiveMissingRequired.length} sensitive attributes are not marked as required`
    );
  }

  // Check for attributes with empty descriptions
  const missingDescriptions = attributes.filter(
    (attr) => !attr.description || attr.description.trim() === ""
  );
  if (missingDescriptions.length > 0) {
    warnings.push(
      `${missingDescriptions.length} attributes missing descriptions`
    );
  }

  // Check for custom attributes with system keys that might conflict
  const customAttrsWithSystemKeys = attributes.filter(
    (attr) => attr.category === "Custom" && attr.systemKey.startsWith("sys_")
  );
  if (customAttrsWithSystemKeys.length > 0) {
    warnings.push(
      `${customAttrsWithSystemKeys.length} custom attributes using system key prefix`
    );
  }

  return {
    valid: errors.length === 0,
    attributeCount: attributes.length,
    warnings: warnings.length > 0 ? warnings : undefined,
    errors: errors.length > 0 ? errors : undefined,
  };
};
