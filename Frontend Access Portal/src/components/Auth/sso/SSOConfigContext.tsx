import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { listSSOConfigs, Configuration, SSOConfigKey } from '@/lib/sso';

interface SSOConfigContextType {
  configs: Configuration[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  getConfigByKey: (key: SSOConfigKey) => Configuration | undefined;
  updateConfig: (key: SSOConfigKey, updates: Partial<Configuration>) => void;
}

const SSOConfigContext = createContext<SSOConfigContextType | undefined>(undefined);

export const SSOConfigProvider = ({ children }: { children: ReactNode }) => {
  const [configs, setConfigs] = useState<Configuration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchConfigs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listSSOConfigs();
      setConfigs(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const getConfigByKey = useCallback((key: SSOConfigKey) => {
    return configs.find(config => config.configKey === key);
  }, [configs]);

  const updateConfig = useCallback((key: SSOConfigKey, updates: Partial<Configuration>) => {
    setConfigs(prevConfigs => 
      prevConfigs.map(config => 
        config.configKey === key 
          ? { ...config, ...updates }
          : config
      )
    );
  }, []);

  useEffect(() => {
    fetchConfigs();
  }, []);

  return (
    <SSOConfigContext.Provider value={{ 
      configs, 
      loading, 
      error, 
      refetch: fetchConfigs,
      getConfigByKey,
      updateConfig
    }}>
      {children}
    </SSOConfigContext.Provider>
  );
};

export function useSSOConfig() {
  const context = useContext(SSOConfigContext);
  if (!context) {
    throw new Error('useSSOConfig must be used within a SSOConfigProvider');
  }
  return context;
} 