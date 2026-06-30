import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface RiskAnalyticsConfig {
  // Widget visibility
  visibleWidgets: {
    criticalRisks: boolean;
    sodViolations: boolean;
    orphanAccounts: boolean;
    excessiveAccess: boolean;
    riskyRoles: boolean;
    processFailures: boolean;
    riskDistribution: boolean;
    trendChart: boolean;
    heatmap: boolean;
  };
  
  // Display preferences
  refreshInterval: number; // in seconds, 0 = manual only
  autoRefresh: boolean;
  defaultTimeRange: '24h' | '7d' | '30d' | '90d';
  chartType: 'line' | 'area' | 'bar';
  
  // Filter defaults
  defaultFilters: {
    severity: ('critical' | 'high' | 'medium' | 'low')[];
    identityTypes: ('employee' | 'non-employee' | 'non-human')[];
    sources: string[];
  };
  
  // Risk scoring
  riskWeights: {
    severity: number;
    age: number;
    businessImpact: number;
    compliance: number;
  };
  
  // Thresholds
  severityThresholds: {
    critical: number;
    high: number;
    medium: number;
  };
  
  // Alert settings
  alertsEnabled: boolean;
  alertThresholds: {
    criticalRisks: number;
    sodViolations: number;
    orphanAccounts: number;
  };
}

interface RiskAnalyticsConfigContextType {
  config: RiskAnalyticsConfig;
  updateConfig: (updates: Partial<RiskAnalyticsConfig>) => void;
  resetConfig: () => void;
}

const defaultConfig: RiskAnalyticsConfig = {
  visibleWidgets: {
    criticalRisks: true,
    sodViolations: true,
    orphanAccounts: true,
    excessiveAccess: true,
    riskyRoles: true,
    processFailures: true,
    riskDistribution: true,
    trendChart: true,
    heatmap: true,
  },
  refreshInterval: 300, // 5 minutes
  autoRefresh: false,
  defaultTimeRange: '30d',
  chartType: 'line',
  defaultFilters: {
    severity: ['critical', 'high', 'medium', 'low'],
    identityTypes: ['employee', 'non-employee', 'non-human'],
    sources: []
  },
  riskWeights: {
    severity: 40,
    age: 20,
    businessImpact: 30,
    compliance: 10
  },
  severityThresholds: {
    critical: 80,
    high: 60,
    medium: 40
  },
  alertsEnabled: true,
  alertThresholds: {
    criticalRisks: 25,
    sodViolations: 10,
    orphanAccounts: 50
  }
};

const RiskAnalyticsConfigContext = createContext<RiskAnalyticsConfigContextType | undefined>(undefined);

export const RiskAnalyticsConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<RiskAnalyticsConfig>(() => {
    const saved = localStorage.getItem('riskAnalyticsConfig');
    return saved ? { ...defaultConfig, ...JSON.parse(saved) } : defaultConfig;
  });

  useEffect(() => {
    localStorage.setItem('riskAnalyticsConfig', JSON.stringify(config));
  }, [config]);

  const updateConfig = (updates: Partial<RiskAnalyticsConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const resetConfig = () => {
    setConfig(defaultConfig);
    localStorage.removeItem('riskAnalyticsConfig');
  };

  return (
    <RiskAnalyticsConfigContext.Provider value={{ config, updateConfig, resetConfig }}>
      {children}
    </RiskAnalyticsConfigContext.Provider>
  );
};

export const useRiskAnalyticsConfig = () => {
  const context = useContext(RiskAnalyticsConfigContext);
  if (!context) {
    throw new Error('useRiskAnalyticsConfig must be used within RiskAnalyticsConfigProvider');
  }
  return context;
};
