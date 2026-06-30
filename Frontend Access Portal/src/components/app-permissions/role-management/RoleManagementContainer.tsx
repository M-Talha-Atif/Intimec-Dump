"use client";
import React from "react";
import { RoleManagementProvider } from "./contexts/RoleManagementContext";
import {
  RoleHeader,
  RoleSearchFilters,
  RoleBulkActions,
  RoleFiltersPanel,
  RoleDialogs,
} from "./components";
import { RoleDataTable } from "./RoleDataTable";

const RoleManagementContent: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <RoleHeader />

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <RoleSearchFilters />
        <RoleBulkActions />
      </div>

      {/* Filters Panel */}
      <RoleFiltersPanel />

      {/* Roles Table */}
      <RoleDataTable />

      {/* Dialogs */}
      <RoleDialogs />
    </div>
  );
};

export const RoleManagementContainer: React.FC = () => {
  return (
    <RoleManagementProvider>
      <RoleManagementContent />
    </RoleManagementProvider>
  );
};
