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
import { ScrollArea } from "@/components/ui/scroll-area";

interface DashboardConfig {
  enabledWidgets: string[];
  layoutTemplate: "grid" | "stack" | "fluid";
  widgetVisibility: Record<string, boolean>;
}

interface DashboardSettingsProps {
  config: DashboardConfig;
  onUpdate: (updates: Partial<DashboardConfig>) => void;
}

const DashboardSettings: React.FC<DashboardSettingsProps> = ({
  config,
  onUpdate,
}) => {
  const availableWidgets = [
    {
      id: "pending-tasks",
      name: "Pending Tasks",
      description: "Show user tasks requiring attention",
    },
    {
      id: "risk-scorecard",
      name: "Risk Scorecard",
      description: "Identity risk metrics and scores",
    },
    {
      id: "recent-activity",
      name: "Recent Activity",
      description: "Latest system activities and changes",
    },
    {
      id: "compliance-status",
      name: "Compliance Status",
      description: "Compliance metrics and alerts",
    },
    {
      id: "access-requests",
      name: "Access Requests",
      description: "Pending access request approvals",
    },
    {
      id: "user-statistics",
      name: "User Statistics",
      description: "User and identity statistics",
    },
    {
      id: "system-health",
      name: "System Health",
      description: "System performance indicators",
    },
    {
      id: "audit-summary",
      name: "Audit Summary",
      description: "Recent audit findings and status",
    },
  ];

  const layoutTemplates = [
    {
      value: "grid",
      label: "Grid Layout",
      description: "Organized in a responsive grid",
    },
    {
      value: "stack",
      label: "Stacked Layout",
      description: "Widgets stacked vertically",
    },
    {
      value: "fluid",
      label: "Fluid Layout",
      description: "Flexible width containers",
    },
  ];

  const handleWidgetToggle = (widgetId: string, enabled: boolean) => {
    if (enabled) {
      onUpdate({
        enabledWidgets: [...config.enabledWidgets, widgetId],
        widgetVisibility: { ...config.widgetVisibility, [widgetId]: true },
      });
    } else {
      onUpdate({
        enabledWidgets: config.enabledWidgets.filter((id) => id !== widgetId),
        widgetVisibility: { ...config.widgetVisibility, [widgetId]: false },
      });
    }
  };

  return (
    <div className="space-y-6">
      <ScrollArea className="h-[600px]  rounded-md border p-4">
        <Card>
          <CardHeader>
            <CardTitle>Layout Configuration</CardTitle>
            <CardDescription>
              Choose how dashboard widgets are arranged and displayed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Dashboard Layout</Label>
              <div className="mt-1">
                <Select
                  value={config.layoutTemplate}
                  onValueChange={(value: "grid" | "stack" | "fluid") =>
                    onUpdate({ layoutTemplate: value })
                  }
                >
                  <SelectTrigger className="p-6">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {layoutTemplates.map((template) => (
                      <SelectItem key={template.value} value={template.value}>
                        <div className="mt-1">
                          <div className="font-medium">{template.label}</div>
                          <div className="text-sm text-gray-500">
                            {template.description}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Widget Management</CardTitle>
            <CardDescription>
              Control which widgets appear on the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {availableWidgets.map((widget) => {
                const isEnabled = config.enabledWidgets.includes(widget.id);

                return (
                  <div
                    key={widget.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={isEnabled}
                        onCheckedChange={(checked) =>
                          handleWidgetToggle(widget.id, !!checked)
                        }
                      />

                      <div>
                        <div className="font-medium">{widget.name}</div>
                        <div className="text-sm text-gray-500">
                          {widget.description}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-sm px-2 py-1 rounded ${
                          isEnabled
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {isEnabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </ScrollArea>
    </div>
  );
};

export default DashboardSettings;

// src/components/settings/ui-configurator/DashboardSettings.tsx
