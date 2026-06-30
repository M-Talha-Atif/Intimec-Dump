import type { Entitlement } from "../../data/mock-entitlements";

export interface EntitlementViewerProps {
  entitlement: Entitlement;
  allEntitlements: Entitlement[];
  onEdit: () => void;
  onSelectEntitlement: (entitlement: Entitlement) => void;
}

export interface EntitlementHeaderProps {
  entitlement: Entitlement;
  onEdit: () => void;
}

export interface EntitlementTabsProps {
  entitlement: Entitlement;
  allEntitlements: Entitlement[];
  onSelectEntitlement: (entitlement: Entitlement) => void;
}
