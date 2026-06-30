import useSWR from "swr";
import { getFetcher } from "../fetcher";
import { DropDownOption } from "@/types/add-application";
import { useMemo } from "react";
import { getDetailsZodSchema } from "@/components/applications/add-application/schemas/detailsSchema";

interface ApiResponse {
  data: {
    connectors: (DropDownOption & {
      iconUrl: string;
      bundle_version: string;
    })[];
    scopes: DropDownOption[];
    departments: DropDownOption[];
    identityTypes: DropDownOption[];
  };
}

export default function useDetailsForm() {
  const {
    data: response,
    isLoading,
    error,
    mutate,
  } = useSWR<ApiResponse>(
    "/api/applications/add-application",
    getFetcher("Failed to fetch Connectors and categories")
  );
  const connectorOptions = response?.data?.connectors;
  const scopes = response?.data?.scopes;
  const departments = response?.data?.departments;
  const identityTypes = response?.data?.identityTypes;
  const detailsSchema = useMemo(() => {
    if (!connectorOptions || !departments || !scopes || !identityTypes) {
      return undefined; // Return null or a default schema if options are not available
    }
    const connectorIds = connectorOptions.map((option) => option.id);
    const scopeIds = scopes.map((option) => option.id);
    const departmentIds = departments.map((option) => option.id);
    const schemaIds = identityTypes.map((option) => option.id) || [];
    return getDetailsZodSchema(
      connectorIds,
      scopeIds,
      departmentIds,
      schemaIds
    );
  }, [connectorOptions, departments, scopes, identityTypes]);
  return {
    connectorOptions,
    detailsSchema,
    scopes,
    departments,
    identityTypes,
    isLoading,
    error,
    refresh: () => mutate(undefined, { revalidate: true }),
  };
}
