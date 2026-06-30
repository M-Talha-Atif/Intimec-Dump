import React, { createContext, useContext } from "react";
import {
  AttributeMapping,
  SystemAttributeMapping,
  Source,
  SchemaAttribute,
} from "../types/index";
import { IdentitySchemaContext } from "../utils/identity-mapping-utils";
import { EntityFieldResponse } from "../../../types/schema-mangement";

interface MappingContextValue {
  // State
  sources: Source[];
  mappings: AttributeMapping[]; // Keep old for backward compatibility
  systemMappings: SystemAttributeMapping[]; // New structure
  selectedIdentityType: IdentitySchemaContext;
  syncAllModal: boolean;

  // Loading and error states
  isLoadingSources: boolean;
  isLoadingSystemMappings: boolean;
  systemMappingsError: string | null;

  // Entity fields state
  entityFields: EntityFieldResponse[];
  isLoadingEntityFields: boolean;
  entityFieldsError: string | null;

  // Source attributes state
  sourceAttributes: Record<string, SchemaAttribute[]>;
  isLoadingSourceAttributes: Record<string, boolean>;
  sourceAttributesError: Record<string, string | null>;

  // Actions - New structure (optional for now)
  addSystemMapping?: () => void;
  updateSystemMapping?: (
    id: string,
    updates: Partial<SystemAttributeMapping>
  ) => void;
  removeSystemMapping?: (
    id: string,
    onConfirm?: () => void
  ) => void | { mapping: SystemAttributeMapping; performRemoval: () => void };
  copySystemMapping?: (id: string) => void;
  addSourceMapping?: (systemMappingId: string) => void;
  updateSourceMapping?: (
    systemMappingId: string,
    mappingIndex: number,
    updates: Partial<SystemAttributeMapping["mappings"][0]>
  ) => void;
  removeSourceMapping?: (systemMappingId: string, mappingIndex: number) => void;

  fetchSourceAttributesForSource: (sourceId: string) => Promise<void>;

  // Modal controls
  setSyncAllModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const MappingContext = createContext<MappingContextValue | undefined>(
  undefined
);

export const useMappingContext = () => {
  const context = useContext(MappingContext);
  if (context === undefined) {
    throw new Error("useMappingContext must be used within a MappingProvider");
  }
  return context;
};

interface MappingProviderProps {
  children: React.ReactNode;
  value: MappingContextValue;
}

export const MappingProvider: React.FC<MappingProviderProps> = ({
  children,
  value,
}) => {
  return (
    <MappingContext.Provider value={value}>{children}</MappingContext.Provider>
  );
};
