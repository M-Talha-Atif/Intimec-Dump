import { Entitlement } from "../../data/mock-entitlements";

export interface RelationshipGraphProps {
  entitlement: Entitlement;
  allEntitlements: Entitlement[];
  onSelectEntitlement: (entitlement: Entitlement) => void;
}

export type ViewMode = "direct" | "application" | "dependencies";

export interface GraphState {
  selectedNode: string | null;
  viewMode: ViewMode;
  isExpanded: boolean;
  showPreview: boolean;
  previewData: Entitlement | null;
}

export interface GraphActions {
  handleViewModeChange: (mode: ViewMode) => void;
  toggleExpanded: () => void;
  closePreview: () => void;
}
