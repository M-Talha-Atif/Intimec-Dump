"use client";
import React from "react";
import { ApplicationPermissionsProvider } from "./contexts/ApplicationPermissionsContext";
import { PermissionStatsCards, PermissionTabs } from "./components";

export const ApplicationPermissionsContent = () => {
  return (
    <ApplicationPermissionsProvider>
      <div className="space-y-6">
        {/* Stats Cards */}
        <PermissionStatsCards />

        {/* Main Content Tabs */}
        <PermissionTabs />
      </div>
    </ApplicationPermissionsProvider>
  );
};
