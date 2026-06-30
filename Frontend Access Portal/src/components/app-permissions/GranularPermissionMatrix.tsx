"use client";
import React from "react";
import { PermissionMatrixProvider, usePermissionMatrixContext } from "./contexts";
import {
  PermissionMatrixControls,
  PermissionMatrixGrid,
  PermissionMatrixModals,
} from "./components";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const PermissionMatrixContent = () => {
  const { isLoading, error, refetch } = usePermissionMatrixContext();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">Loading permissions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription className="flex items-center justify-between">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={refetch}>
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Controls */}
      <PermissionMatrixControls />

      {/* Permission Matrix */}
      <PermissionMatrixGrid />

      {/* Modals and Drawers */}
      <PermissionMatrixModals />
    </div>
  );
};

export const GranularPermissionMatrix = () => {
  return <PermissionMatrixContent />;
};
