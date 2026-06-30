"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Clock,
  Database,
  Zap,
  Shield,
  Bot,
  TrendingUp,
  Upload,
  Download,
  Plus,
  X,
} from "lucide-react";
import {
  RETENTION_OPTIONS,
  PURGE_FREQUENCY_OPTIONS,
  DEBUG_PROFILES,
} from "@/constants/debug";

import { exportDebugSettings } from "@/utils/debug";
import { useDebugConfiguration } from "@/contexts/use-debug-configuration";

export const AdvancedControls = () => {
  const {
    retentionSettings,
    correlationKeys,
    newCorrelationKey,
    componentToggles,
    streamingSettings,
    selectedProfile,
    showPerformanceWarning,
    components,
    handleRetentionChange,
    addCorrelationKey,
    removeCorrelationKey,
    setNewCorrelationKey,
    handleStreamingSettingChange,
    loadDebugProfile,
    suggestOptimalSettings,
  } = useDebugConfiguration();
  const handleExportSettings = () => {
    const settings = {
      components,
      retentionSettings,
      correlationKeys,
      componentToggles,
      streamingSettings,
    };
    exportDebugSettings(settings);
  };

  return (
    <>
      {/* Log Retention & Purge Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Log Retention & Purge Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="retention-duration">Retention Duration</Label>
              <Select
                value={retentionSettings.duration}
                onValueChange={(value) =>
                  handleRetentionChange("duration", value)
                }
              >
                <SelectTrigger id="retention-duration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RETENTION_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="purge-frequency">Purge Frequency</Label>
              <Select
                value={retentionSettings.purgeFrequency}
                onValueChange={(value) =>
                  handleRetentionChange("purgeFrequency", value)
                }
                disabled={!retentionSettings.autoPurge}
              >
                <SelectTrigger id="purge-frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PURGE_FREQUENCY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Auto-Purge Logs</h4>
              <p className="text-sm text-muted-foreground">
                Automatically delete logs after the retention period
              </p>
            </div>
            <Switch
              checked={retentionSettings.autoPurge}
              onCheckedChange={(value) =>
                handleRetentionChange("autoPurge", value)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Regulatory Compliance Tags</h4>
              <p className="text-sm text-muted-foreground">
                Tag logs for compliance requirements (SOX, GDPR)
              </p>
            </div>
            <Switch
              checked={retentionSettings.hasRegulatoryTags}
              onCheckedChange={(value) =>
                handleRetentionChange("hasRegulatoryTags", value)
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Correlation Key Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Correlation Key Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Current Correlation Keys</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {correlationKeys.map((key) => (
                <Badge
                  key={key}
                  variant="secondary"
                  className="flex items-center space-x-1"
                >
                  <span>{key}</span>
                  <button
                    onClick={() => removeCorrelationKey(key)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex space-x-2">
            <Input
              placeholder="Add correlation key (e.g. userId, sessionId)"
              value={newCorrelationKey}
              onChange={(e) => setNewCorrelationKey(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCorrelationKey()}
            />
            <Button onClick={addCorrelationKey} disabled={!newCorrelationKey}>
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Live Streaming Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Live Streaming Controls</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>
              Max Log Rate (logs/second): {streamingSettings.maxLogRate}
            </Label>
            <Slider
              value={[streamingSettings.maxLogRate]}
              onValueChange={([value]) =>
                handleStreamingSettingChange("maxLogRate", value)
              }
              max={1000}
              min={10}
              step={10}
              className="mt-2"
            />
            {showPerformanceWarning && (
              <p className="text-sm text-amber-600 mt-1">
                ⚠️ High log rates may impact browser performance
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Debug Profiles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Debug Profiles</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Load Debug Profile</Label>
            <Select value={selectedProfile} onValueChange={loadDebugProfile}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEBUG_PROFILES.map((profile) => (
                  <SelectItem key={profile.id} value={profile.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{profile.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {profile.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Import/Export Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Import/Export Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Button onClick={handleExportSettings} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Configuration
            </Button>
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Import Configuration
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
