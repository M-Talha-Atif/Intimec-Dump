import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2,  History } from "lucide-react";

interface AdvancedConfig {
  customCSS: string;
  roleBasedThemes: Record<string, string>;
  departmentThemes: Record<string, string>;
  scriptTriggers: Array<{ event: string; script: string; enabled: boolean }>;
  versionHistory: Array<{
    id: string;
    name: string;
    date: string;
    active: boolean;
  }>;
}

interface AdvancedSettingsProps {
  config: AdvancedConfig;
  onUpdate: (updates: Partial<AdvancedConfig>) => void;
}

const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({
  config,
  onUpdate,
}) => {
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");

  const roles = [
    { value: "admin", label: "Administrator" },
    { value: "manager", label: "Manager" },
    { value: "employee", label: "Employee" },
    { value: "reviewer", label: "Reviewer" },
    { value: "sponsor", label: "Sponsor" },
  ];

  const departments = [
    { value: "it", label: "Information Technology" },
    { value: "hr", label: "Human Resources" },
    { value: "finance", label: "Finance" },
    { value: "operations", label: "Operations" },
    { value: "compliance", label: "Compliance" },
  ];


  const addRoleTheme = () => {
    if (selectedRole && !config.roleBasedThemes[selectedRole]) {
      onUpdate({
        roleBasedThemes: {
          ...config.roleBasedThemes,
          [selectedRole]: "#428C95",
        },
      });
      setSelectedRole("");
    }
  };

  const addDepartmentTheme = () => {
    if (selectedDepartment && !config.departmentThemes[selectedDepartment]) {
      onUpdate({
        departmentThemes: {
          ...config.departmentThemes,
          [selectedDepartment]: "#428C95",
        },
      });
      setSelectedDepartment("");
    }
  };

  const removeRoleTheme = (role: string) => {
    const updated = { ...config.roleBasedThemes };
    delete updated[role];
    onUpdate({ roleBasedThemes: updated });
  };

  const removeDepartmentTheme = (dept: string) => {
    const updated = { ...config.departmentThemes };
    delete updated[dept];
    onUpdate({ departmentThemes: updated });
  };
  const restoreVersion = (versionId: string) => {
    console.log(`Restoring version: ${versionId}`);
    // In real implementation, this would restore the configuration
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="themes" className="space-y-4">
        <TabsList className="w-full">
          <TabsTrigger value="themes">Role Themes</TabsTrigger>
          <TabsTrigger value="versions">Versions</TabsTrigger>
        </TabsList>

        <TabsContent value="themes">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Role-Based Themes</CardTitle>
                <CardDescription>
                  Assign different color themes based on user roles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select role..." />
                    </SelectTrigger>
                    <SelectContent>
                      {roles
                        .filter((role) => !config.roleBasedThemes[role.value])
                        .map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={addRoleTheme} disabled={!selectedRole}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>

                <div className="space-y-2">
                  {Object.entries(config.roleBasedThemes).map(
                    ([role, color]) => {
                      const roleLabel =
                        roles.find((r) => r.value === role)?.label || role;
                      return (
                        <div
                          key={role}
                          className="flex items-center justify-between p-3 border rounded"
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className="w-6 h-6 rounded"
                              style={{ backgroundColor: color }}
                            />
                            <span className="font-medium">{roleLabel}</span>
                            <Badge variant="outline">{role}</Badge>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Input
                              type="color"
                              value={color}
                              onChange={(e) =>
                                onUpdate({
                                  roleBasedThemes: {
                                    ...config.roleBasedThemes,
                                    [role]: e.target.value,
                                  },
                                })
                              }
                              className="w-12 h-8 p-1 border rounded"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeRoleTheme(role)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Department-Based Themes</CardTitle>
                <CardDescription>
                  Assign different color themes based on user departments
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Select
                    value={selectedDepartment}
                    onValueChange={setSelectedDepartment}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select department..." />
                    </SelectTrigger>
                    <SelectContent>
                      {departments
                        .filter((dept) => !config.departmentThemes[dept.value])
                        .map((dept) => (
                          <SelectItem key={dept.value} value={dept.value}>
                            {dept.label}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={addDepartmentTheme}
                    disabled={!selectedDepartment}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>

                <div className="space-y-2">
                  {Object.entries(config.departmentThemes).map(
                    ([dept, color]) => {
                      const deptLabel =
                        departments.find((d) => d.value === dept)?.label ||
                        dept;
                      return (
                        <div
                          key={dept}
                          className="flex items-center justify-between p-3 border rounded"
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className="w-6 h-6 rounded"
                              style={{ backgroundColor: color }}
                            />
                            <span className="font-medium">{deptLabel}</span>
                            <Badge variant="outline">{dept}</Badge>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Input
                              type="color"
                              value={color}
                              onChange={(e) =>
                                onUpdate({
                                  departmentThemes: {
                                    ...config.departmentThemes,
                                    [dept]: e.target.value,
                                  },
                                })
                              }
                              className="w-12 h-8 p-1 border rounded"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeDepartmentTheme(dept)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="versions">
          <Card>
            <CardHeader>
              <CardTitle>Version History & Restore</CardTitle>
              <CardDescription>
                Track changes and restore previous configurations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {config.versionHistory.map((version) => (
                  <div
                    key={version.id}
                    className="flex items-center justify-between p-3 border rounded"
                  >
                    <div className="flex items-center space-x-3">
                      <History className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="font-medium">{version.name}</div>
                        <div className="text-sm text-gray-500">
                          {version.date}
                        </div>
                      </div>
                      {version.active && (
                        <Badge variant="default">Current</Badge>
                      )}
                    </div>

                    {!version.active && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => restoreVersion(version.id)}
                      >
                        Restore
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedSettings;
