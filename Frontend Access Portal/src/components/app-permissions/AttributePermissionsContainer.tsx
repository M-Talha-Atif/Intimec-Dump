"use client";
import React from "react";
import { AttributePermissionsProvider } from "./contexts";
import {
  AttributePermissionsHeader,
  AttributeFilters,
  AttributesList,
} from "./components";

export const AttributePermissionsContainer: React.FC = () => {
  return (
    <AttributePermissionsProvider>
      <div className="space-y-6">
        <AttributePermissionsHeader />
        <AttributeFilters />
        <AttributesList />
      </div>
    </AttributePermissionsProvider>
  );
};
