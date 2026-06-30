"use client";
import React from "react";
import { IdentityTypeSelector } from "./components/main/IdentityTypeSelector";
import { IdentityStatsCards } from "./components/main/IdentityStatsCards";
import { IdentityMappingTabs } from "./components/main/IdentityMappingTabs";
import { IdentityMappingProvider } from "./context/IdentityMappingContext";
import { useIdentityMappingState } from "./hooks/useIdentityMappingState";

export type { IdentityType } from "./data/identity-mapping";

export const IdentityAttributeMappingContent = () => {
  const identityState = useIdentityMappingState();

  return (
    <IdentityMappingProvider value={identityState}>
      <div className="p-6 space-y-6">
        <IdentityTypeSelector />

        <IdentityStatsCards identityType="employee" />

        <IdentityMappingTabs />
      </div>
    </IdentityMappingProvider>
  );
};
