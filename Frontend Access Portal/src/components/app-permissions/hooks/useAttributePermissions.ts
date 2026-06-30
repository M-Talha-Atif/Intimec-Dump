import { useState, useMemo } from "react";
import {
  mockAttributePermissions,
  attributeCategories,
  sensitivityLevels,
} from "../data";

export const useAttributePermissions = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterSensitivity, setFilterSensitivity] = useState("all");

  const filteredAttributes = useMemo(() => {
    return mockAttributePermissions.filter((attr) => {
      const matchesSearch = attr.attribute
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        filterCategory === "all" || attr.category === filterCategory;
      const matchesSensitivity =
        filterSensitivity === "all" || attr.sensitivity === filterSensitivity;
      return matchesSearch && matchesCategory && matchesSensitivity;
    });
  }, [searchTerm, filterCategory, filterSensitivity]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleCategoryFilterChange = (value: string) => {
    setFilterCategory(value);
  };

  const handleSensitivityFilterChange = (value: string) => {
    setFilterSensitivity(value);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setFilterCategory("all");
    setFilterSensitivity("all");
  };

  return {
    // Data
    attributes: mockAttributePermissions,
    filteredAttributes,
    categories: attributeCategories,
    sensitivities: sensitivityLevels,

    // Filter state
    searchTerm,
    filterCategory,
    filterSensitivity,

    // Actions
    handleSearchChange,
    handleCategoryFilterChange,
    handleSensitivityFilterChange,
    resetFilters,
  };
};
