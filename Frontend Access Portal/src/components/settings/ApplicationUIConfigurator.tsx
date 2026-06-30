"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Palette,
  Upload,
  Monitor,
  Layout,
  Shield,
  Settings,
  Save,
  RotateCcw,
  Download,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { BrandingSettings } from "./ui-configurator/BrandingSettings";
import ThemeSettings from "./ui-configurator/ThemeSettings";
import LoginPageSettings from "./ui-configurator/LoginPageSettings";
import NavigationSettings from "./ui-configurator/NavigationSettings";
import DashboardSettings from "./ui-configurator/DashboardSettings";
import AdvancedSettings from "./ui-configurator/AdvancedSettings";
import TypographySettings from "./ui-configurator/TypographySettings";
import PreviewPanel from "./ui-configurator/PreviewPanel";
import { useThemeContext } from "@/contexts/themeConfigContext";
import ImportJsonButton from "../common/import";
import ExportJsonButton from "../common/export";
import { UIConfig } from "@/types/UIConfig";
import { useSimpleNavigationGuard } from "@/hooks/useNavigationGuard";
import { SimpleConfirmDialog } from "@/components/ui/ConfirmDialog";
import { defaultConfig } from "./ui-configurator/defaultConfig";



export const ApplicationUIConfigurator: React.FC = () => {
  const { themeConfig, loadingTheme, updateTheme } = useThemeContext();

  // Local editing state - this prevents SWR from overriding edits
  const [config, setConfig] = useState<UIConfig>(defaultConfig);
  const [previewMode,] = useState(false);
  const [previewRole,] = useState("admin");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [activePreset, setActivePreset] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Track if we've initialized from server data
  const [initialized, setInitialized] = useState(false);
  const serverDataRef = useRef<UIConfig | undefined>(undefined);

  // Only initialize local state when server data first loads or changes significantly
  useEffect(() => {
    if (!loadingTheme && themeConfig && !initialized) {
      console.log("Initializing config from server data");
      setConfig(themeConfig);
      serverDataRef.current = themeConfig;
      setInitialized(true);
      setHasUnsavedChanges(false);
    } else if (themeConfig && initialized && !hasUnsavedChanges) {
      // Only update if we don't have unsaved changes AND the server data actually changed
      const serverDataChanged =
        JSON.stringify(serverDataRef.current) !== JSON.stringify(themeConfig);
      if (serverDataChanged) {
        console.log("Server data changed, updating local config");
        setConfig(themeConfig);
        serverDataRef.current = themeConfig;
      }
    }
  }, [themeConfig, loadingTheme, initialized, hasUnsavedChanges]);

  const presets = [
    {
      id: "corporate-blue",
      name: "Corporate Blue",
      description: "Professional blue theme",
    },
    {
      id: "minimal-dark",
      name: "Minimal Dark",
      description: "Clean dark interface",
    },
    {
      id: "enterprise-green",
      name: "Enterprise Green",
      description: "Green accent enterprise theme",
    },
    {
      id: "modern-purple",
      name: "Modern Purple",
      description: "Contemporary purple design",
    },
  ];

  const updateConfig = useCallback(
    (section: keyof UIConfig, updates: Partial<UIConfig[keyof UIConfig]>) => {
      setConfig((prev) => {
        const newConfig = {
          ...prev,
          [section]: { ...prev[section], ...updates },
        };
        console.log("Local config updated:", newConfig);
        return newConfig;
      });
      setHasUnsavedChanges(true);
    },
    []
  );

  const handleSave = useCallback(async () => {
    setLoading(true);
    try {
      console.log("Saving config: ", config);
      await updateTheme(config);

      // Update our reference to the new server state
      serverDataRef.current = config;
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error("Failed to save config:", error);
    } finally {
      setLoading(false);
    }
  }, [config, updateTheme]);

  const handleResetToDefault = useCallback(() => {
    setConfig(defaultConfig);
    setHasUnsavedChanges(true);
  }, []);

  const handleResetToServer = useCallback(() => {
    if (themeConfig) {
      setConfig(JSON.parse(JSON.stringify(themeConfig)));
      setHasUnsavedChanges(false);
    }
  }, [themeConfig]);

  const applyPreset = useCallback(
    (presetId: string) => {
      const presetConfigs: Record<string, Partial<UIConfig>> = {
        "corporate-blue": {
          theme: {
            ...config.theme,
            primaryColor: "#1e40af",
            secondaryColor: "#64748b",
            accentColor: "#3b82f6",
          },
        },
        "minimal-dark": {
          theme: {
            ...config.theme,
            darkPrimaryColor: "#374151",
            darkSecondaryColor: "#6b7280",
            darkAccentColor: "#10b981",
          },
        },
        "enterprise-green": {
          theme: {
            ...config.theme,
            primaryColor: "#059669",
            secondaryColor: "#6b7280",
            accentColor: "#10b981",
          },
        },
        "modern-purple": {
          theme: {
            ...config.theme,
            primaryColor: "#7c3aed",
            secondaryColor: "#a78bfa",
            accentColor: "#8b5cf6",
          },
        },
      };

      const presetConfig = presetConfigs[presetId];
      if (presetConfig) {
        setConfig((prev) => ({ ...prev, ...presetConfig }));
        setActivePreset(presetId);
        setHasUnsavedChanges(true);
      }
    },
    [config.theme]
  );

  const handleImport = useCallback((data: UIConfig) => {
    setConfig(data);
    setHasUnsavedChanges(true);
  }, []);

  const navigationGuard = useSimpleNavigationGuard({
    hasUnsavedChanges: hasUnsavedChanges, // or isDirty for React Hook Form
    message: "You have unsaved changes. Are you sure you want to leave?", // Optional custom message
  });

  if (loadingTheme && !initialized) {
    return (
      <div className="flex items-center justify-center h-64">
        <div>Loading theme configuration...</div>
      </div>
    );
  }
  console.log("Rendering with config:", config);

  return (
    <>

      <div className="space-y-6">

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>
              Apply presets, save configurations, or reset to defaults
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Label>Apply Preset:</Label>
                <Select value={activePreset} onValueChange={applyPreset}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Choose preset..." />
                  </SelectTrigger>
                  <SelectContent>
                    {presets.map((preset) => (
                      <SelectItem key={preset.id} value={preset.id}>
                        {preset.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Separator orientation="vertical" className="h-8" />
              <ExportJsonButton variant="outline" data={config}>
                <Download className="h-4 w-4 mr-2" />
                Export Config
              </ExportJsonButton>
              <ImportJsonButton
                variant="outline"

                onImport={(data) => handleImport(data as UIConfig)}
              >
                <Upload className="h-4 w-4 mr-2" />
                Import Config
              </ImportJsonButton>
              <Button variant="outline" onClick={handleResetToDefault}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset to Default
              </Button>
              {hasUnsavedChanges && (
                <Button variant="outline" onClick={handleResetToServer}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Discard Changes
                </Button>
              )}


              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button disabled={!hasUnsavedChanges || loading}>
                    <Save className="h-4 w-4 mr-2" />
                    Apply Changes
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Save</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to save this data?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={handleSave} disabled={loading}>
                      {loading ? "Saving..." : "Confirm"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              {hasUnsavedChanges && (
                <Badge
                  variant="secondary"
                  className="bg-yellow-100 text-yellow-800"
                >
                  Unsaved Changes
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Main Configuration Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Tabs */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="branding" className="space-y-4">
              <TabsList className="w-full">
                <TabsTrigger value="branding">
                  <Palette className="h-4 w-4 mr-1" />
                  Brand
                </TabsTrigger>
                <TabsTrigger value="theme">
                  <Monitor className="h-4 w-4 mr-1" />
                  Theme
                </TabsTrigger>
                <TabsTrigger value="typography">Type</TabsTrigger>
                <TabsTrigger value="login">
                  <Shield className="h-4 w-4 mr-1" />
                  Login
                </TabsTrigger>
                <TabsTrigger value="navigation">
                  <Layout className="h-4 w-4 mr-1" />
                  Nav
                </TabsTrigger>
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="advanced">
                  <Settings className="h-4 w-4 mr-1" />
                  Advanced
                </TabsTrigger>
              </TabsList>

              <TabsContent value="branding">
                <BrandingSettings
                  config={config.branding}
                  onUpdate={(data) => updateConfig("branding", data)}
                />
              </TabsContent>

              <TabsContent value="theme">
                <ThemeSettings
                  config={config.theme}
                  onUpdate={(updates) => updateConfig("theme", updates)}
                />
              </TabsContent>

              <TabsContent value="typography">
                <TypographySettings
                  config={config.typography}
                  onUpdate={(updates) => updateConfig("typography", updates)}
                />
              </TabsContent>

              <TabsContent value="login">
                <LoginPageSettings
                  config={config.loginPage}
                  onUpdate={(updates) => updateConfig("loginPage", updates)}
                />
              </TabsContent>

              <TabsContent value="navigation">
                <NavigationSettings
                  config={config.navigation}
                  onUpdate={(updates) => updateConfig("navigation", updates)}
                />
              </TabsContent>

              <TabsContent value="dashboard">
                <DashboardSettings
                  config={config.dashboard}
                  onUpdate={(updates) => updateConfig("dashboard", updates)}
                />
              </TabsContent>

              <TabsContent value="advanced">
                <AdvancedSettings
                  config={config.advanced}
                  onUpdate={(updates) => updateConfig("advanced", updates)}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Live Preview Panel */}
          <div className="lg:col-span-1">
            <PreviewPanel
              config={config}
              previewMode={previewMode}
              previewRole={previewRole}
            />
          </div>
        </div>
      </div>
      <SimpleConfirmDialog
        open={navigationGuard.showDialog}
        message={navigationGuard.message}
        onIgnoreChanges={navigationGuard.onIgnoreChanges}
        onCancel={navigationGuard.onCancel}
      />
    </>
  );
};

export default ApplicationUIConfigurator;
