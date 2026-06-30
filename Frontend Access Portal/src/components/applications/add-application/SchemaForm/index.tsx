"use client";

import NonAuthoritativeSchemaFormRender from "./non-authoritative/SchemaFormRender";
import AuthoritativeSchemaFormRender from "./authoritative/SchemaFormRender";
import { LoaderCircle } from "lucide-react";
import { useAddApplicationContext } from "@/contexts/AddApplicationContext";
import useConnectorObjects from "@/hooks/applications/add-application/useConnectorObjects";
import LoadErrorCard from "@/components/applications/add-application/common/LoadErrorCard";
import NavigationButtons from "../NavigationButtons";

export default function SchemaForm() {
  const {
    finalFormData,
    systemAttributes,
    loadingSystemAttributes,
    currentFormStep,
    errorLoadingSystemAttributes,
    refreshSystemAttributes,
  } = useAddApplicationContext();

  const { objects, error, refresh, isLoading } = useConnectorObjects(
    finalFormData?.details?.connectorId,
    finalFormData?.connector
  );
  if (currentFormStep !== "schema") return null; // Don't render if not on this step

  if (isLoading || loadingSystemAttributes) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <LoaderCircle className="w-12 h-12 text-muted-foreground animate-spin" />
      </div>
    );
  }
  const errorList = [
    [error, refresh],
    [errorLoadingSystemAttributes, refreshSystemAttributes],
  ];
  for (const err of errorList) {
    if (err[0]) {
      return (
        <div className="w-full h-full flex flex-col">
          <div className="flex flex-1 items-center justify-center">
            <LoadErrorCard
              refresh={err[1]}
              errorMessage={err[0].message || "An unexpected error occurred."}
              errorTitle="Failed to load schema form"
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
  }
  if (objects && !finalFormData.details?.isAuthoritative) {
    return <NonAuthoritativeSchemaFormRender connectorObjects={objects} />;
  }
  if (objects && finalFormData.details?.isAuthoritative && systemAttributes) {
    return (
      <AuthoritativeSchemaFormRender
        connectorObjects={objects}
        systemAttributes={systemAttributes}
      />
    );
  }
  return null;
}
