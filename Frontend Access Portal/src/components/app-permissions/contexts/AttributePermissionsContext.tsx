"use client";
import React, { createContext, useContext, ReactNode } from "react";
import { useAttributePermissions } from "../hooks";
import { AttributePermission } from "../data";

interface AttributePermissionsContextType {
  // Data
  attributes: AttributePermission[];
  filteredAttributes: AttributePermission[];
  categories: string[];
  sensitivities: string[];

  // Filter state
  searchTerm: string;
  filterCategory: string;
  filterSensitivity: string;

  // Actions
  handleSearchChange: (value: string) => void;
  handleCategoryFilterChange: (value: string) => void;
  handleSensitivityFilterChange: (value: string) => void;
  resetFilters: () => void;
}

const AttributePermissionsContext = createContext<
  AttributePermissionsContextType | undefined
>(undefined);

interface AttributePermissionsProviderProps {
  children: ReactNode;
}

export const AttributePermissionsProvider: React.FC<
  AttributePermissionsProviderProps
> = ({ children }) => {
  const attributePermissions = useAttributePermissions();

  return (
    <AttributePermissionsContext.Provider value={attributePermissions}>
      {children}
    </AttributePermissionsContext.Provider>
  );
};

export const useAttributePermissionsContext = () => {
  const context = useContext(AttributePermissionsContext);
  if (context === undefined) {
    throw new Error(
      "useAttributePermissionsContext must be used within an AttributePermissionsProvider"
    );
  }
  return context;
};
