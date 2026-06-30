import React, { createContext, useContext, useState } from "react";
import type { Filters } from "../types";
import { DEFAULT_FILTERS } from "../data";

interface FilterContextType {
  filters: Filters;
  setFilters: (filters: Filters) => void;
  clearFilters: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

interface FilterProviderProps {
  children: React.ReactNode;
}

export const FilterProvider = ({ children }: FilterProviderProps) => {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const value = {
    filters,
    setFilters,
    clearFilters,
  };

  return React.createElement(FilterContext.Provider, { value }, children);
};

export const useFilterContext = () => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error("useFilterContext must be used within a FilterProvider");
  }
  return context;
};
