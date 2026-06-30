import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { GripVertical, Eye, EyeOff } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NavigationConfig {
  enabledModules: string[];
  menuOrder: string[];
  iconStyle: "filled" | "outline" | "minimal";
  defaultLandingPage: string;
  sidebarCollapsible: boolean;
}

interface NavigationSettingsProps {
  config: NavigationConfig;
  onUpdate: (updates: Partial<NavigationConfig>) => void;
}

const NavigationSettings: React.FC<NavigationSettingsProps> = ({
  config,
  onUpdate,
}) => {
  const availableModules = [
    {
      id: "dashboard",
      name: "Dashboard",
      description: "Main dashboard and analytics",
    },
    {
      id: "applications",
      name: "Applications",
      description: "Application management",
    },
    {
      id: "identities",
      name: "Identities",
      description: "User and identity management",
    },
    {
      id: "access-catalog",
      name: "Access Catalog",
      description: "Browse access entitlements",
    },
    {
      id: "access-portal",
      name: "Access Portal",
      description: "Request access to resources",
    },
    {
      id: "access-review",
      name: "Access Reviews",
      description: "Certification campaigns",
    },
    { id: "workflows", name: "Workflows", description: "Workflow management" },
    { id: "monitoring", name: "Monitoring", description: "System monitoring" },
    { id: "settings", name: "Settings", description: "System configuration" },
  ];

  const iconStyles = [
    { value: "filled", label: "Filled Icons" },
    { value: "outline", label: "Outline Icons" },
    { value: "minimal", label: "Minimal Icons" },
  ];

  const handleModuleToggle = (moduleId: string, enabled: boolean) => {
    if (enabled) {
      onUpdate({
        enabledModules: [...config.enabledModules, moduleId],
        menuOrder: [...config.menuOrder, moduleId],
      });
    } else {
      onUpdate({
        enabledModules: config.enabledModules.filter((id) => id !== moduleId),
        menuOrder: config.menuOrder.filter((id) => id !== moduleId),
      });
    }
  };

  const moveModule = (moduleId: string, direction: "up" | "down") => {
    const currentIndex = config.menuOrder.indexOf(moduleId);
    if (currentIndex === -1) return;

    const newOrder = [...config.menuOrder];
    const targetIndex =
      direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex >= 0 && targetIndex < newOrder.length) {
      [newOrder[currentIndex], newOrder[targetIndex]] = [
        newOrder[targetIndex],
        newOrder[currentIndex],
      ];
      onUpdate({ menuOrder: newOrder });
    }
    console.log(currentIndex);
  };

  return (
    <div className="space-y-6">
      <ScrollArea className="h-[600px]  rounded-md border p-4">
        <Card>
          <CardHeader>
            <CardTitle>Navigation Behavior</CardTitle>
            <CardDescription>
              Configure how users navigate through the application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Default Landing Page</Label>
                <Select
                  value={config.defaultLandingPage}
                  onValueChange={(value) =>
                    onUpdate({ defaultLandingPage: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {config.enabledModules.map((moduleId) => {
                      const module = availableModules.find(
                        (m) => m.id === moduleId
                      );
                      return module ? (
                        <SelectItem key={module.id} value={module.id}>
                          {module.name}
                        </SelectItem>
                      ) : null;
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Module Visibility & Order</CardTitle>
            <CardDescription>
              Control which modules are visible and their order in the
              navigation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {config.menuOrder.map((module, currentIndex) => {
                const isEnabled = config.enabledModules.includes(module);
                const moduler = availableModules.find((m) => m.id === module)!;
                // const currentIndex = config.menuOrder.indexOf(module);

                return (
                  <div
                    key={module}
                    className="flex items-center justify-between p-3 border rounded-lg"
                    style={{
                      order: currentIndex,
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex flex-col space-y-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveModule(module, "up")}
                          disabled={currentIndex <= 0}
                          className="h-4 w-6 p-0"
                        >
                          <GripVertical className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveModule(module, "down")}
                          disabled={currentIndex >= config.menuOrder.length - 1}
                          className="h-4 w-6 p-0"
                        >
                          <GripVertical className="h-3 w-3" />
                        </Button>
                      </div>

                      <Checkbox
                        checked={isEnabled}
                        onCheckedChange={(checked) =>
                          handleModuleToggle(module, !!checked)
                        }
                      />

                      <div>
                        <div className="font-medium">{moduler.name}</div>
                        <div className="text-sm text-gray-500">
                          {moduler.description}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {isEnabled ? (
                        <div>
                          <Eye className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-gray-500">
                            {currentIndex >= 0
                              ? `#${currentIndex + 1}`
                              : "Hidden"}
                          </span>
                        </div>
                      ) : (
                        <div>
                          <EyeOff className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            {currentIndex >= 0
                              ? `#${currentIndex + 1}`
                              : "Hidden"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {availableModules.map((module, currentIndex) =>
                !config.enabledModules.includes(module.id) ? (
                  <div
                    key={module.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                    style={{
                      order: currentIndex,
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex flex-col space-y-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveModule(module.id, "up")}
                          disabled={currentIndex <= 0}
                          className="h-4 w-6 p-0"
                        >
                          <GripVertical className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveModule(module.id, "down")}
                          disabled={currentIndex >= config.menuOrder.length - 1}
                          className="h-4 w-6 p-0"
                        >
                          <GripVertical className="h-3 w-3" />
                        </Button>
                      </div>

                      <Checkbox
                        checked={false}
                        onCheckedChange={(checked) =>
                          handleModuleToggle(module.id, !!checked)
                        }
                      />

                      <div>
                        <div className="font-medium">{module.name}</div>
                        <div className="text-sm text-gray-500">
                          {module.description}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div>
                        <EyeOff className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500">Hidden</span>
                      </div>
                    </div>
                  </div>
                ) : null
              )}
            </div>
          </CardContent>
        </Card>
      </ScrollArea>
    </div>
  );
};

export default NavigationSettings;
