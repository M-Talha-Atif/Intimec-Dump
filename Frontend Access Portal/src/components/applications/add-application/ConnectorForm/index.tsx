"use client";
import React from "react";
import ConnectorFormRender from "./ConnectorFormRender";
import { useAddApplicationContext } from "@/contexts/AddApplicationContext";
import { LoaderCircle } from "lucide-react";
import useConnector from "@/hooks/applications/add-application/useConnectorForm";
import LoadErrorCard from "@/components/applications/add-application/common/LoadErrorCard";
import NavigationButtons from "../NavigationButtons";

export default function ConnectorForm() {
  const { finalFormData, currentFormStep } = useAddApplicationContext();
  const connectorType = finalFormData?.details?.connectorId ?? null;
  const {
    connectorProperties,
    defaultValues,
    schema,
    isLoading,
    error,
    refresh,
  } = useConnector(connectorType);

  if (currentFormStep !== "connector") return null; // Don't render if not on this step

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <LoaderCircle className="w-12 h-12 text-muted-foreground animate-spin" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="flex flex-1 items-center justify-center">
          <LoadErrorCard
            refresh={refresh}
            errorMessage={error.message || "An unexpected error occurred."}
            errorTitle="Failed to load connector form"
          />
        </div>
        <div>
          <NavigationButtons>
            <NavigationButtons.PreviousButton />
          </NavigationButtons>
        </div>
      </div>
    );
  }

  if (connectorProperties && schema && defaultValues) {
    return (
      <ConnectorFormRender
        key={JSON.stringify(schema, (_, value) =>
          typeof value === "bigint" ? value.toString() : value
        )}
        schema={schema}
        connector={connectorProperties}
        defaultValues={defaultValues}
      />
    );
  }
  // fallback
  return null;
}
