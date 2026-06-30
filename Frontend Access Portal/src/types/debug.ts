export interface DebugLevel {
  value: string;
  label: string;
  color: string;
  tooltip?: string;
}

export interface ComponentDebugConfig {
  name: string;
  description: string;
  level: string;
  serviceUrl?: string;
  active?: boolean;
}
export interface ComponentDebugConfigResponse {
  totalComponents: number;
  components: ComponentDebugConfig[];
}

export interface ComponentDebugConfigBody {
  componentName: string;
  level: string;
}

export interface PresetFilter {
  value: string;
  label: string;
  description: string;
}

export interface RetentionOption {
  value: string;
  label: string;
}

export interface PurgeFrequencyOption {
  value: string;
  label: string;
}

export interface DebugProfile {
  id: string;
  name: string;
  description: string;
}

export interface RetentionSettings {
  duration: string;
  autoPurge: boolean;
  purgeFrequency: string;
  hasRegulatoryTags: boolean;
}

export interface ComponentToggles {
  [componentName: string]: {
    retryLogging: boolean;
    maskPII: boolean;
    includeStacktrace: boolean;
    includeWorkflowContext: boolean;
  };
}

export interface StreamingSettings {
  maxLogRate: number;
  maxMemoryBuffer: number;
  enableAIExplainer: boolean;
}

export interface DebugSettings {
  globalDebugging: boolean;
  components: ComponentDebugConfig[];
  retentionSettings: RetentionSettings;
  correlationKeys: string[];
  componentToggles: ComponentToggles;
  streamingSettings: StreamingSettings;
  selectedPreset: string;
}
