import React, { createContext, useContext } from "react";
import { IdentitySchemaContext } from "../utils/identity-mapping-utils";
import { MappingStats, DEFAULT_MAPPING_STATS } from "../data/identity-mapping";

interface IdentityMappingContextValue {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedIdentityType: IdentitySchemaContext | null;
  setSelectedIdentityType: (identityType: IdentitySchemaContext | null) => void;
  identitySchemaContexts: IdentitySchemaContext[];
  mappingStats: MappingStats;
  setMappingStats: (stats: MappingStats) => void;
}

const IdentityMappingContext = createContext<
  IdentityMappingContextValue | undefined
>(undefined);

export const useIdentityMappingContext = () => {
  const context = useContext(IdentityMappingContext);
  if (context === undefined) {
    throw new Error(
      "useIdentityMappingContext must be used within an IdentityMappingProvider"
    );
  }
  return context;
};

interface IdentityMappingProviderProps {
  children: React.ReactNode;
  value: IdentityMappingContextValue;
}

export const IdentityMappingProvider: React.FC<
  IdentityMappingProviderProps
> = ({ children, value }) => {
  return (
    <IdentityMappingContext.Provider value={value}>
      {children}
    </IdentityMappingContext.Provider>
  );
};
