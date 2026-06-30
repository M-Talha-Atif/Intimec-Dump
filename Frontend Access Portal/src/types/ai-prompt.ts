export interface PromptTemplateVersion {
  id: string; // e.g., "v1", "v2"
  outputFormat?: string;
  content: string;
  createdAt: string; // ISO string
  updatedAt?: string; // ISO string
  isEnabled: boolean;
  author?: string;
  notes?: string;
}

export interface PromptTemplate {
  feature: string; // Human-readable feature name
  outputFormat?: string;
  versions: PromptTemplateVersion[];
  enabledVersionId: string; // One and only one enabled
  draftContent: string; // Working draft for editor
}

export interface AIPromptState {
  selectedFeature: string;
  templates: Record<string, PromptTemplate>;
}

export interface AIPromptContextType {
  state: AIPromptState;
  // derived getters
  getCurrentTemplate: () => PromptTemplate;
  getCurrentEnabledVersion: () => PromptTemplateVersion | undefined;
  // actions
  selectFeature: (feature: string, options?: { loadEnabled?: boolean }) => void;
  setSelectedFeature: (feature: string) => void;
  setDraftContent: (content: string) => void;
  setOutputFormat: (feature: string, outputFormat: string) => void;
  resetDraftToEnabled: () => void;
  saveDraftAsNewVersion: (opts?: { notes?: string; author?: string }) => string; // returns new version id
  saveDraftAndEnable: (opts?: { notes?: string; author?: string }) => void;
  enableVersion: (versionId: string) => void;
}
