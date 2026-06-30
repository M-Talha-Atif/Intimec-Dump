import { Entitlement } from "../../data/mock-entitlements";

export interface EditorProps {
  entitlement: Entitlement;
  allEntitlements: Entitlement[];
  onSave: (updatedEntitlement: Entitlement) => Promise<void>;
  onCancel: () => void;
}

export interface EditorState {
  editedEntitlement: Entitlement;
  hasChanges: boolean;
  showImpactSimulation: boolean;
  validationErrors: string[];
}

export interface EditorActions {
  handleSave: () => Promise<void>;
  handleEntitlementChange: (updatedEntitlement: Partial<Entitlement>) => void;
  handlePreviewImpact: () => void;
  handleCloseImpactSimulation: () => void;
  handleCancel: () => void;
}
