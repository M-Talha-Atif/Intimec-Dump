import React from "react";
import { RoleFilters } from "../RoleFilters";
import { useRoleManagementContext } from "../contexts/RoleManagementContext";

export const RoleFiltersPanel: React.FC = () => {
  const { filters, showFilters, handleFilterChange, clearFilters } =
    useRoleManagementContext();

  if (!showFilters) {
    return null;
  }

  return (
    <RoleFilters
      filters={filters}
      onFiltersChange={handleFilterChange}
      onClearFilters={clearFilters}
    />
  );
};
