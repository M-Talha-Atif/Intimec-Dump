import { useState } from 'react';
import { TaskSettings, initialTaskSettings } from '../data/taskSettingsData';

export const useTaskSettings = () => {
  const [settings, setSettings] = useState<TaskSettings>(initialTaskSettings);

  const updateSettings = (newSettings: Partial<TaskSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return {
    settings,
    setSettings,
    updateSettings
  };
};
