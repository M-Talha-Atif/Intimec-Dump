"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, Settings, Loader2 } from "lucide-react";
import { PRESET_FILTERS } from "@/constants/debug";
import { useDebugConfiguration } from "@/contexts/use-debug-configuration";

export const PresetFilters = () => {
  const {
    selectedPreset,
    isApplyingPreset,
    hasDebugPermissions,
    handlePresetChange,
  } = useDebugConfiguration();
  const currentPreset = PRESET_FILTERS.find((p) => p.value === selectedPreset);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log Stream Presets</CardTitle>
        <p className="text-sm text-muted-foreground">
          Quick configuration for common debugging scenarios
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium">Quick Configuration:</label>
            <div className="flex items-center space-x-2">
              <Select
                value={selectedPreset}
                onValueChange={handlePresetChange}
                disabled={!hasDebugPermissions || isApplyingPreset}
              >
                <SelectTrigger className="w-80">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRESET_FILTERS.map((preset) => (
                    <SelectItem key={preset.value} value={preset.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{preset.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {preset.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isApplyingPreset && (
                <div className="flex items-center space-x-2 text-blue-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Applying Filters...</span>
                </div>
              )}
            </div>
          </div>

          {selectedPreset !== "custom" && currentPreset && (
            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <div className="flex items-center space-x-2 text-blue-800">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Active Preset: {currentPreset.label}
                </span>
              </div>
              <p className="text-sm text-blue-700 mt-1">
                {currentPreset.description}
              </p>
            </div>
          )}

          {selectedPreset === "custom" && (
            <div className="bg-gray-50 border border-gray-200 rounded p-3">
              <div className="flex items-center space-x-2 text-gray-800">
                <Settings className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Custom Configuration Active
                </span>
              </div>
              <p className="text-sm text-gray-700 mt-1">
                Debug levels have been manually configured
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
