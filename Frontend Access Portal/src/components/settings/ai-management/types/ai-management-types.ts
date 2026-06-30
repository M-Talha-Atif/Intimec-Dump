
export type AIPromptType = 'default' | 'system' | 'fallback' | 'extraction' | 'evaluation' | 'sentiment' | 'classification' | 'output_schema' | string;

export interface AIFeatureConfig {
  id: string;
  name: string;
  component: string;
  inputType: string;
  outputFormat: 'kpi' | 'table' | 'markdown' | 'chart' | 'structured';
  entryPoint: 'button' | 'tab' | 'modal' | 'auto';
  enabled: boolean;
  promptTemplate: string;
  confidenceThreshold: number;
  category: string;
  description: string;
  lastUsed?: string;
  usageCount?: number;
}

export interface AIConnectionConfig {
  provider: 'perplexity' | 'openai' | 'claude' | 'custom';
  apiKey: string;
  baseUrl?: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  isConnected: boolean;
  lastTested?: string;
}

export interface AIBehaviorConfig {
  enabledFeatures: string[];
  responseMode: 'streaming' | 'batch';
  defaultLanguage: string;
  autoRetryCount: number;
  fallbackToMock: boolean;
  confidenceThreshold: number;
  showInputPrompts: boolean;
  backgroundProcessing: boolean;
}

export interface AIUsageLog {
  id: string;
  timestamp: string;
  feature: string;
  user: string;
  inputType: string;
  responseTime: number;
  success: boolean;
  error?: string;
  rating?: 'positive' | 'negative';
  tokens?: number;
}

export interface AIPromptTemplate {
  id: string;
  featureId: string;
  name: string;
  template: string;
  macros: string[];
  outputFormat: AIFeatureConfig['outputFormat'];
  promptType: AIPromptType;
  isActive: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface AIAnalytics {
  totalRequests: number;
  successRate: number;
  averageResponseTime: number;
  topFeatures: Array<{ name: string; count: number }>;
  errorRate: number;
  userSatisfaction: number;
}
