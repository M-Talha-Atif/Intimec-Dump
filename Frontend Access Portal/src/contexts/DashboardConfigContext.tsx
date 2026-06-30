import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface DashboardWidget {
  id: string;
  name: string;
  visible: boolean;
  order: number;
  size?: 'small' | 'medium' | 'large' | 'full';
}

export interface DashboardConfig {
  layoutTemplate: 'grid' | 'stack' | 'fluid';
  refreshInterval: number; // in seconds, 0 = no auto-refresh
  defaultDateRange: 'today' | '7days' | '30days' | '90days' | 'ytd' | 'custom';
  widgets: DashboardWidget[];
  showQuickActions: boolean;
  enableAnimations: boolean;
}

const defaultWidgets: DashboardWidget[] = [
  { id: 'identity-risk', name: 'Identity Risk Overview', visible: true, order: 1, size: 'full' },
  { id: 'pending-tasks', name: 'Pending Tasks', visible: true, order: 2, size: 'medium' },
  { id: 'sla-monitor', name: 'SLA Monitor', visible: true, order: 3, size: 'medium' },
  { id: 'compliance-status', name: 'Compliance Status', visible: true, order: 4, size: 'medium' },
  { id: 'application-health', name: 'Application Health', visible: true, order: 5, size: 'medium' },
  { id: 'lifecycle-kpis', name: 'Access Lifecycle KPIs', visible: true, order: 6, size: 'full' },
  { id: 'privileged-access', name: 'Privileged Access Monitoring', visible: true, order: 7, size: 'full' },
  { id: 'review-campaigns', name: 'Access Review Campaigns', visible: true, order: 8, size: 'medium' },
  { id: 'governance-insights', name: 'Governance Insights', visible: true, order: 9, size: 'full' },
  { id: 'my-approvals', name: 'My Approvals', visible: false, order: 10, size: 'medium' },
  { id: 'orphan-accounts', name: 'Orphan Accounts', visible: false, order: 11, size: 'small' },
  { id: 'stale-access', name: 'Stale Access', visible: false, order: 12, size: 'small' },
];

const defaultConfig: DashboardConfig = {
  layoutTemplate: 'grid',
  refreshInterval: 300, // 5 minutes
  defaultDateRange: '30days',
  widgets: defaultWidgets,
  showQuickActions: true,
  enableAnimations: true,
};

interface DashboardConfigContextType {
  config: DashboardConfig;
  updateConfig: (updates: Partial<DashboardConfig>) => void;
  resetConfig: () => void;
  updateWidget: (widgetId: string, updates: Partial<DashboardWidget>) => void;
  reorderWidgets: (widgetIds: string[]) => void;
  lastRefresh: Date;
  triggerRefresh: () => void;
}

const DashboardConfigContext = createContext<DashboardConfigContextType | undefined>(undefined);

const STORAGE_KEY = 'dashboard-config';

export const DashboardConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<DashboardConfig>(defaultConfig);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Load config from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setConfig({ ...defaultConfig, ...parsed });
      } catch (error) {
        console.error('Failed to parse dashboard config:', error);
      }
    }
  }, []);

  // Save config to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }, [config]);

  // Auto-refresh functionality
  useEffect(() => {
    if (config.refreshInterval > 0) {
      const interval = setInterval(() => {
        setLastRefresh(new Date());
      }, config.refreshInterval * 1000);
      
      return () => clearInterval(interval);
    }
  }, [config.refreshInterval]);

  const updateConfig = (updates: Partial<DashboardConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const resetConfig = () => {
    setConfig(defaultConfig);
    localStorage.removeItem(STORAGE_KEY);
  };

  const updateWidget = (widgetId: string, updates: Partial<DashboardWidget>) => {
    setConfig(prev => ({
      ...prev,
      widgets: prev.widgets.map(w => 
        w.id === widgetId ? { ...w, ...updates } : w
      ),
    }));
  };

  const reorderWidgets = (widgetIds: string[]) => {
    setConfig(prev => {
      const widgetMap = new Map(prev.widgets.map(w => [w.id, w]));
      const reorderedWidgets = widgetIds
        .map(id => widgetMap.get(id))
        .filter((w): w is DashboardWidget => w !== undefined)
        .map((w, index) => ({ ...w, order: index + 1 }));
      
      return { ...prev, widgets: reorderedWidgets };
    });
  };

  const triggerRefresh = () => {
    setLastRefresh(new Date());
  };

  return (
    <DashboardConfigContext.Provider
      value={{
        config,
        updateConfig,
        resetConfig,
        updateWidget,
        reorderWidgets,
        lastRefresh,
        triggerRefresh,
      }}
    >
      {children}
    </DashboardConfigContext.Provider>
  );
};

export const useDashboardConfig = () => {
  const context = useContext(DashboardConfigContext);
  if (!context) {
    throw new Error('useDashboardConfig must be used within DashboardConfigProvider');
  }
  return context;
};
