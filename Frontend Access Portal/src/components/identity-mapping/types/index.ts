import { IdentitySchemaContext } from "../utils/identity-mapping-utils";

export type IdentityType = "employee" | "non-human" | "non-employee";

export type ScriptType = "JAVASCRIPT" | "GROOVY" | "BEANSHELL";

export interface AttributeMapping {
  id: string;
  sourceAttribute: string;
  targetAttribute: string;
  transformation: string;
  transformationScript?: string;
  condition?: string;
  fallbackValue?: string;
  priority: number;
  source: string;
  identityType: IdentityType;
  type: "string" | "number" | "boolean" | "array" | "object";
  isCollapsed?: boolean;
  isValid?: boolean;
  validationErrors?: string[];
}

// New structure for system attribute-centric mapping
export interface SourceMapping {
  /** Backend UUID — used to call the individual DELETE endpoint when a row is removed. */
  id?: string;
  resourceId: string;
  sourceAttributeName: string;
  transformation: string;
  script?: {
    type: ScriptType;
    content: string;
  };
}

export interface SystemAttributeMapping {
  id: string;
  systemAttributeId: string;
  systemAttributeName: string;
  mappings: SourceMapping[];
  identityType: IdentityType;
  fallbackValue?: string;
  isCollapsed?: boolean;
}

export interface Source {
  id: string;
  name: string;
  type: string;
  syncStatus: "synced" | "out-of-sync" | "not-configured";
  priority: number;
}
export interface SourcePriority {
  resourceId: string;
  sourceName: string;
  priority: number;
}

export interface MappingEngineProps {
  selectedIdentityType: IdentitySchemaContext;
}

// CorrelationRules types
export interface CorrelationRule {
  id: string;
  name: string;
  type: "primary" | "secondary";
  priority: number;
  enabled: boolean;
  sourceAttribute: string;
  targetAttribute: string;
  joinCondition: string;
  conflictResolution: "first-wins" | "last-wins" | "manual-review";
  sources: string[];
  isValid: boolean;
  validationErrors: string[];
}

export interface CorrelationRulesProps {
  identityType: IdentityType;
}

export interface AvailableApplication {
  id: string;
  name: string;
  type: string;
  syncStatus: "synced" | "out-of-sync" | "not-configured";
  icon: string;
  description: string;
}

export interface SchemaAttribute {
  id: string;
  nativeAttributeName: string;
  dataType: string;
  category: string;
}
