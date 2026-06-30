import React from "react";
import { RoleFormState } from "../types";
import EntitlementCatalogPicker from "@/components/shared/EntitlementCatalogPicker";

interface EntitlementsTabProps {
  form: RoleFormState;
  update: (key: string, value: any) => void;
  /**
   * Shared name cache owned by the parent wizard.
   * Survives tab switches because the parent doesn't unmount.
   * Maps entitlement UUID → displayName.
   */
  nameCache: React.MutableRefObject<Map<string, string>>;
}

const EntitlementsTab: React.FC<EntitlementsTabProps> = ({
  form,
  update,
  nameCache,
}) => {
  const handleSelectionChange = (ids: string[]) => {
    update("entitlements", ids);
  };

  return (
    <EntitlementCatalogPicker
      selectedIds={form.entitlements}
      onSelectionChange={handleSelectionChange}
      nameCache={nameCache}
      editable={true}
    />
  );
};

export default EntitlementsTab;