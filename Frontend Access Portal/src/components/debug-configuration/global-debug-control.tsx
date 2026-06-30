"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Settings, ExternalLink } from "lucide-react";
import { getActiveComponentsCount } from "@/utils/debug";
import { useDebugConfiguration } from "@/contexts/use-debug-configuration";

export const GlobalDebugControl = () => {
  const {
    isGlobalDebuggingEnabled,
    components,
    hasDebugPermissions,
    handleGlobalToggle: onGlobalToggle,
    openLiveDebugStream: onOpenLiveDebugStream,
  } = useDebugConfiguration();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>Global Debug Control</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Enable Debugging Globally</h4>
            <p className="text-sm text-muted-foreground">
              Master switch to control all debug logging across the platform
            </p>
          </div>
          <Switch
            checked={isGlobalDebuggingEnabled}
            onCheckedChange={onGlobalToggle}
            disabled={!hasDebugPermissions}
          />
        </div>

        {isGlobalDebuggingEnabled && (
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="text-sm text-muted-foreground">
              {getActiveComponentsCount(components)} of {components.length}{" "}
              components active
            </div>
            <Button variant="outline" size="sm" onClick={onOpenLiveDebugStream}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Live Debug Stream
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
