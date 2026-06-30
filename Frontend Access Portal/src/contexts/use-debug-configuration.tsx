"use client";

import {
  useState,
  useEffect,
  createContext,
  ReactNode,
  useContext,
} from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { applyPresetToComponents } from "@/utils/debug";
import type {
  ComponentDebugConfig,
  RetentionSettings,
  ComponentToggles,
  StreamingSettings,
  ComponentDebugConfigBody,
} from "@/types/debug";
import {
  DEFAULT_COMPONENT_TOGGLES,
  DEFAULT_RETENTION_SETTINGS,
  DEFAULT_STREAMING_SETTINGS,
  DEFAULT_CORRELATION_KEYS,
  PRESET_FILTERS,
} from "@/constants/debug";
import { getLogLevels, setLogLevels } from "@/lib/debug-config";
interface DebugContextType {
  // State
  isLoading: boolean;
  isGlobalDebuggingEnabled: boolean;
  selectedPreset: string;
  isApplyingPreset: boolean;
  components: ComponentDebugConfig[];
  retentionSettings: RetentionSettings;
  correlationKeys: string[];
  newCorrelationKey: string;
  componentToggles: ComponentToggles;
  streamingSettings: StreamingSettings;
  selectedProfile: string;
  showPerformanceWarning: boolean;
  hasUnsavedChanges: boolean;
  hasDebugPermissions: boolean;

  // Setters
  setNewCorrelationKey: (key: string) => void;
  setLevels: (newLevels: ComponentDebugConfigBody[]) => Promise<void>;

  // Handlers
  handleGlobalToggle: (enabled: boolean) => void;
  handleComponentLevelChange: (componentName: string, newLevel: string) => void;
  handlePresetChange: (preset: string) => void;
  handleSaveSettings: () => Promise<void>;
  handleRetentionChange: (setting: string, value: any) => void;
  addCorrelationKey: () => void;
  removeCorrelationKey: (key: string) => void;

  handleStreamingSettingChange: (setting: string, value: any) => void;
  loadDebugProfile: (profileId: string) => void;
  suggestOptimalSettings: () => void;
  openLiveDebugStream: () => void;
}

const DebuggingConfigContext = createContext<DebugContextType | null>(null);

export function DebuggingConfigProvider({ children }: { children: ReactNode }) {
  const [isGlobalDebuggingEnabled, setIsGlobalDebuggingEnabled] =
    useState(true);
  const [selectedPreset, setSelectedPreset] = useState("custom");
  const [isApplyingPreset, setIsApplyingPreset] = useState(false);
  const [components, setComponents] = useState<ComponentDebugConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [retentionSettings, setRetentionSettings] = useState<RetentionSettings>(
    DEFAULT_RETENTION_SETTINGS
  );
  const [correlationKeys, setCorrelationKeys] = useState<string[]>(
    DEFAULT_CORRELATION_KEYS
  );
  const [newCorrelationKey, setNewCorrelationKey] = useState("");
  const [componentToggles, setComponentToggles] = useState<ComponentToggles>(
    DEFAULT_COMPONENT_TOGGLES
  );
  const [streamingSettings, setStreamingSettings] = useState<StreamingSettings>(
    DEFAULT_STREAMING_SETTINGS
  );
  const [selectedProfile, setSelectedProfile] = useState("default-dev");
  const [showPerformanceWarning, setShowPerformanceWarning] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const { toast } = useToast();
  const router = useRouter();

  // Check for user permissions (mock implementation)
  const hasDebugPermissions = true;

  // Load saved preset from localStorage on mount
  useEffect(() => {
    const savedPreset = localStorage.getItem("debug-preset");
    if (savedPreset && PRESET_FILTERS.find((p) => p.value === savedPreset)) {
      setSelectedPreset(savedPreset);
    }
  }, []);
  // load initial component levels using getLogLevels function
  useEffect(() => {
    const fetchLogLevels = async () => {
      setIsLoading(true);
      try {
        const levels = await getLogLevels();
        setComponents(levels.components);
      } catch (error) {
        console.error("Failed to fetch component debug levels:", error);
        toast({
          title: "Error",
          description: "Failed to load component debug levels.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogLevels();
  }, [toast]);

  // Check if all components are OFF on initial load and update global debugging state accordingly
  useEffect(() => {
    if (components.length > 0 && !isLoading) {
      const allComponentsOff = components.every((comp) => comp.level === "OFF");
      if (allComponentsOff) {
        setIsGlobalDebuggingEnabled(false);
        console.log(
          "All components are OFF on initial load, setting global debugging to false"
        );
      }
    }
  }, [components, isLoading]); // Remove isGlobalDebuggingEnabled from dependencies to prevent conflicts

  // Save preset to localStorage when changed
  useEffect(() => {
    localStorage.setItem("debug-preset", selectedPreset);
  }, [selectedPreset]);

  const handleGlobalToggle = (enabled: boolean) => {
    console.log("Global debugging toggled:", enabled);
    setIsGlobalDebuggingEnabled(enabled);
    setHasUnsavedChanges(true);

    if (!enabled) {
      setComponents((prev) => prev.map((comp) => ({ ...comp, level: "OFF" })));
      toast({
        title: "Debugging Disabled",
        description:
          "All debug levels have been set to OFF and log streaming is paused.",
      });
    } else {
      // When enabling global debugging, set components to INFO level if they are all OFF
      const allComponentsOff = components.every((comp) => comp.level === "OFF");
      if (allComponentsOff) {
        setComponents((prev) =>
          prev.map((comp) => ({ ...comp, level: "INFO" }))
        );
      }
      toast({
        title: "Debugging Enabled",
        description: "Global debugging has been activated.",
      });
    }
  };

  const handleComponentLevelChange = (
    componentName: string,
    newLevel: string
  ) => {
    console.log(`Setting ${componentName} debug level to:`, newLevel);
    setComponents((prev) =>
      prev.map((comp) =>
        comp.name === componentName ? { ...comp, level: newLevel } : comp
      )
    );
    setHasUnsavedChanges(true);

    if (selectedPreset !== "custom") {
      setSelectedPreset("custom");
    }

    toast({
      title: "Debug Level Updated",
      description: `${componentName} logging level set to ${newLevel}`,
    });
  };

  const applyPresetConfiguration = (preset: string) => {
    console.log("Applying debug preset:", preset);
    setIsApplyingPreset(true);

    setTimeout(() => {
      const updatedComponents = applyPresetToComponents(preset, components);
      setComponents(updatedComponents);
      setIsApplyingPreset(false);
      setHasUnsavedChanges(true);

      if (preset !== "custom") {
        const presetConfig = PRESET_FILTERS.find((p) => p.value === preset);
        toast({
          title: "Preset Applied",
          description: `${presetConfig?.label} configuration has been applied`,
        });
      }
    }, 800);
  };

  const handlePresetChange = (preset: string) => {
    setSelectedPreset(preset);
    applyPresetConfiguration(preset);
  };

  const handleSaveSettings = async () => {
    try {
      console.log("Saving debug settings...");

      // Transform components to the required format for setLevels
      const componentLevels: ComponentDebugConfigBody[] = components.map(
        (component) => ({
          componentName: component.name,
          level: component.level,
        })
      );

      // Call setLevels to update the component levels
      await setLevels(componentLevels);

      // Reset unsaved changes flag
      setHasUnsavedChanges(false);

      toast({
        title: "Settings Saved",
        description: "Debug configuration has been successfully updated.",
      });
    } catch (error) {
      console.error("Failed to save debug settings:", error);
      toast({
        title: "Save Failed",
        description: "Failed to save debug settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRetentionChange = (
    setting: string,
    value: string | boolean | number
  ) => {
    console.log(`Updating retention setting ${setting}:`, value);
    setRetentionSettings((prev) => ({ ...prev, [setting]: value }));
    setHasUnsavedChanges(true);

    if (setting === "autoPurge" && !value) {
      toast({
        title: "Auto-Purge Disabled",
        description:
          "Logs will need to be manually purged to prevent storage overflow.",
      });
    }
  };

  const addCorrelationKey = () => {
    if (newCorrelationKey && !correlationKeys.includes(newCorrelationKey)) {
      setCorrelationKeys((prev) => [...prev, newCorrelationKey]);
      setNewCorrelationKey("");
      setHasUnsavedChanges(true);
      toast({
        title: "Correlation Key Added",
        description: `${newCorrelationKey} will be used for log correlation`,
      });
    }
  };

  const removeCorrelationKey = (key: string) => {
    setCorrelationKeys((prev) => prev.filter((k) => k !== key));
    setHasUnsavedChanges(true);
    toast({
      title: "Correlation Key Removed",
      description: `${key} removed from correlation mapping`,
    });
  };

  const handleStreamingSettingChange = (
    setting: string,
    value: string | boolean | number
  ) => {
    console.log(`Updating streaming setting ${setting}:`, value);
    setStreamingSettings((prev) => ({ ...prev, [setting]: value }));
    setHasUnsavedChanges(true);

    if (setting === "maxLogRate" && typeof value === "number" && value > 200) {
      setShowPerformanceWarning(true);
    } else if (
      setting === "maxLogRate" &&
      typeof value === "number" &&
      value <= 200
    ) {
      setShowPerformanceWarning(false);
    }
  };

  const loadDebugProfile = (profileId: string) => {
    console.log("Loading debug profile:", profileId);
    setSelectedProfile(profileId);
    setHasUnsavedChanges(true);

    switch (profileId) {
      case "silent":
        setComponents((prev) =>
          prev.map((comp) => ({ ...comp, level: "ERROR" }))
        );
        setStreamingSettings((prev) => ({
          ...prev,
          maxLogRate: 50,
          enableAIExplainer: false,
        }));
        break;
      case "incident":
        setComponents((prev) =>
          prev.map((comp) => ({ ...comp, level: "DEBUG" }))
        );
        setStreamingSettings((prev) => ({
          ...prev,
          maxLogRate: 500,
          enableAIExplainer: true,
        }));
        break;
      default:
        setComponents((prev) =>
          prev.map((comp) => ({ ...comp, level: "INFO" }))
        );
        break;
    }

    const profile = {
      "default-dev": "Default Dev Logs",
      silent: "Silent Mode",
      incident: "Incident Response Mode",
    }[profileId];

    toast({
      title: "Profile Loaded",
      description: `Debug settings updated to: ${profile}`,
    });
  };

  const suggestOptimalSettings = () => {
    console.log("Analyzing current debug patterns for suggestions");
    toast({
      title: "AI Analysis Complete",
      description:
        "You've had 900 connector warnings in 2h – consider switching to WARN mode for better performance.",
      duration: 8000,
    });
  };

  const openLiveDebugStream = () => {
    console.log("Opening live debug stream");
    router.push("/debugging");
    toast({
      title: "Opening Debug Stream",
      description: "Redirecting to live debugging console...",
    });
  };

  // set components levels using setLogLevels
  const setLevels = async (newLevels: ComponentDebugConfigBody[]) => {
    try {
      setIsLoading(true);
      const message = await setLogLevels(newLevels);
      console.log("Log levels updated:", message);
    } catch (error) {
      console.error("Failed to update component debug levels:", error);
      toast({
        title: "Update Failed",
        description:
          "Failed to update component debug levels. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: DebugContextType = {
    // State
    isLoading,
    isGlobalDebuggingEnabled,
    selectedPreset,
    isApplyingPreset,
    components,
    retentionSettings,
    correlationKeys,
    newCorrelationKey,
    componentToggles,
    streamingSettings,
    selectedProfile,
    showPerformanceWarning,
    hasUnsavedChanges,
    hasDebugPermissions,

    // Setters
    setNewCorrelationKey,
    setLevels,

    // Handlers
    handleGlobalToggle,
    handleComponentLevelChange,
    handlePresetChange,
    handleSaveSettings,
    handleRetentionChange,
    addCorrelationKey,
    removeCorrelationKey,
    handleStreamingSettingChange,
    loadDebugProfile,
    suggestOptimalSettings,
    openLiveDebugStream,
  };
  return (
    <DebuggingConfigContext.Provider value={value}>
      {children}
    </DebuggingConfigContext.Provider>
  );
}

export function useDebugConfiguration() {
  const context = useContext(DebuggingConfigContext);
  if (!context) {
    throw new Error("useDebugging must be used within a DebuggingProvider");
  }
  return context;
}
