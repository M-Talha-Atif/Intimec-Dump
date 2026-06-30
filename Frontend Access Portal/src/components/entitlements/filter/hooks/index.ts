import { useState } from "react";
import type { Filters } from "../types";
import { DEFAULT_FILTERS } from "../data";

export const useFilterPanel = (initialFilters: Filters) => {
  const [localFilters, setLocalFilters] = useState<Filters>(initialFilters);

  const handleOwnershipChange = (value: string) => {
    setLocalFilters((prev) => ({ ...prev, ownership: value }));
  };

  const handleRequestableChange = (value: string) => {
    setLocalFilters((prev) => ({ ...prev, requestable: value }));
  };

  const handleGovernanceChange = (checked: boolean, value: string) => {
    setLocalFilters((prev) => {
      const currentGovFilters = prev.governance || [];
      if (checked) {
        return { ...prev, governance: [...currentGovFilters, value] };
      } else {
        return {
          ...prev,
          governance: currentGovFilters.filter((item) => item !== value),
        };
      }
    });
  };

  const handleClassificationChange = (checked: boolean, value: string) => {
    setLocalFilters((prev) => {
      const currentClassFilters = prev.classification || [];
      if (checked) {
        return { ...prev, classification: [...currentClassFilters, value] };
      } else {
        return {
          ...prev,
          classification: currentClassFilters.filter((item) => item !== value),
        };
      }
    });
  };

  const handleEntitlementTypeChange = (checked: boolean, value: string) => {
    setLocalFilters((prev) => {
      const currentTypeFilters = prev.entitlementType || [];
      if (checked) {
        return { ...prev, entitlementType: [...currentTypeFilters, value] };
      } else {
        return {
          ...prev,
          entitlementType: currentTypeFilters.filter((item) => item !== value),
        };
      }
    });
  };

  const clearFilters = () => {
    setLocalFilters(DEFAULT_FILTERS);
    return DEFAULT_FILTERS;
  };

  return {
    localFilters,
    handleOwnershipChange,
    handleRequestableChange,
    handleGovernanceChange,
    handleClassificationChange,
    handleEntitlementTypeChange,
    clearFilters,
  };
};
