import { useState, useEffect } from "react";
import { IdentitySchemaContext } from "../utils/identity-mapping-utils";
import { MappingStats, DEFAULT_MAPPING_STATS } from "../data/identity-mapping";

const STORAGE_KEY = "identity-mapping-type";

// Hardcoded identity schema contexts - no need to fetch from API
const IDENTITY_SCHEMA_CONTEXTS: IdentitySchemaContext[] = [
  {
    schemaId: "employee",
    schemaName: "Employee Identity",
  },
  {
    schemaId: "non-human",
    schemaName: "Non-Human Identity",
  },
  {
    schemaId: "non-employee",
    schemaName: "Non-Employee Identity",
  },
];

export const useIdentityMappingState = () => {
  const [activeTab, setActiveTab] = useState("mapping");
  const [selectedIdentityType, setSelectedIdentityType] =
    useState<IdentitySchemaContext | null>(null);
  const [identitySchemaContexts] = useState<IdentitySchemaContext[]>(
    IDENTITY_SCHEMA_CONTEXTS
  );
  const [mappingStats, setMappingStats] =
    useState<MappingStats>(DEFAULT_MAPPING_STATS);

  // Set first schema as default when component mounts
  useEffect(() => {
    if (!selectedIdentityType) {
      setSelectedIdentityType(identitySchemaContexts[0]);
    }
  }, [selectedIdentityType, identitySchemaContexts]);

  // Save selected schema to session storage when it changes
  useEffect(() => {
    if (selectedIdentityType) {
      sessionStorage.setItem(STORAGE_KEY, selectedIdentityType.schemaId);
    }
  }, [selectedIdentityType]);

  return {
    activeTab,
    setActiveTab,
    selectedIdentityType,
    setSelectedIdentityType,
    // Hardcoded schema contexts
    identitySchemaContexts,
    mappingStats,
    setMappingStats,
  };
};
