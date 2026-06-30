"use client";

import useDetailsForm from "@/hooks/applications/add-application/useDetailsForm";
import DetailsFormRender from "./DetailsFormRender";
import { LoaderCircle } from "lucide-react";
import LoadErrorCard from "@/components/applications/add-application/common/LoadErrorCard";
import { useAddApplicationContext } from "@/contexts/AddApplicationContext";

export default function DetailsForm() {
  const {
    detailsSchema,
    connectorOptions,
    scopes,
    departments,
    isLoading,
    error,
    refresh,
    identityTypes,
  } = useDetailsForm();
  const { currentFormStep } = useAddApplicationContext();

  if (currentFormStep !== "details") return null; // Don't render if not on this step
  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <LoaderCircle className="w-12 h-12 text-muted-foreground animate-spin" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <LoadErrorCard
          refresh={() => {
            refresh();
          }}
          errorMessage={error.message || "An unexpected error occurred."}
          errorTitle="Failed to load details form"
        />
      </div>
    );
  }

  if (detailsSchema && connectorOptions && departments && scopes && identityTypes) {
    return (
      <DetailsFormRender
        connectorOptions={connectorOptions}
        schema={detailsSchema}
        departments={departments}
        scopes={scopes}
        identityTypes={identityTypes}
      />
    );
  }
  return null;
}
