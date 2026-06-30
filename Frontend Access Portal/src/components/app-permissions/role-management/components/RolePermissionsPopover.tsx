import React, { useState, useMemo } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, X, Loader2, Upload, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Permission {
  id: string;
  name: string;
  apiEndpoint: string | null;
  method: string | null;
  hasRole: boolean;
}

interface Page {
  id: string;
  name: string;
  actions: Permission[];
}

interface Module {
  id: string;
  name: string;
  pages: Page[];
}

interface RolePermissionsPopoverProps {
  roleId: string;
  permissionsCount: number;
  children: React.ReactNode;
}

export const RolePermissionsPopover: React.FC<
  RolePermissionsPopoverProps
> = ({ roleId, permissionsCount, children }) => {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(
    new Set()
  );

  const fetchPermissions = async () => {
    if (modules.length > 0) return; // Already loaded

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/granular-permissions/hierarchy?roleFilter=${roleId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch permissions");
      }

      const data = await response.json();
      // Backend returns an object with modules, availableModules, availableRoles
      // Extract just the modules array
      setModules(data.modules || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load permissions");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      fetchPermissions();
    }
  };

  // Count granted permissions
  const grantedCount = modules.reduce((total, module) => {
    return (
      total +
      module.pages.reduce((pageTotal, page) => {
        return (
          pageTotal + page.actions.filter((action) => action.hasRole).length
        );
      }, 0)
    );
  }, 0);

  // Flatten all granted permissions for easier management
  const allGrantedPermissions = useMemo(() => {
    const permissions: Array<Permission & { moduleName: string; pageName: string }> = [];
    modules.forEach((module) => {
      module.pages.forEach((page) => {
        page.actions
          .filter((action) => action.hasRole)
          .forEach((action) => {
            permissions.push({
              ...action,
              moduleName: module.name,
              pageName: page.name,
            });
          });
      });
    });
    return permissions;
  }, [modules]);

  // Selection handlers
  const togglePermissionSelection = (permissionId: string) => {
    const newSelected = new Set(selectedPermissions);
    if (newSelected.has(permissionId)) {
      newSelected.delete(permissionId);
    } else {
      newSelected.add(permissionId);
    }
    setSelectedPermissions(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedPermissions.size === allGrantedPermissions.length) {
      setSelectedPermissions(new Set());
    } else {
      setSelectedPermissions(new Set(allGrantedPermissions.map((p) => p.id)));
    }
  };

  const isAllSelected =
    allGrantedPermissions.length > 0 &&
    selectedPermissions.size === allGrantedPermissions.length;

  // Export functions
  const exportToJSON = (permissions: typeof allGrantedPermissions) => {
    const dataStr = JSON.stringify(permissions, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `role-permissions-${roleId}-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const exportToCSV = (permissions: typeof allGrantedPermissions) => {
    const headers = [
      "id",
      "name",
      "moduleName",
      "pageName",
      "apiEndpoint",
      "method",
    ];
    const rows = permissions.map((permission) =>
      headers
        .map((header) => {
          const value = permission[header as keyof typeof permission];
          if (value === null || value === undefined) return "";
          if (typeof value === "string" && value.includes(",")) {
            return `"${value}"`;
          }
          return value;
        })
        .join(",")
    );
    const csvData = `${headers.join(",")}\n${rows.join("\n")}`;
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `role-permissions-${roleId}-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleExportSelected = (format: "csv" | "json") => {
    const permissionsToExport = allGrantedPermissions.filter((p) =>
      selectedPermissions.has(p.id)
    );
    if (format === "csv") {
      exportToCSV(permissionsToExport);
    } else {
      exportToJSON(permissionsToExport);
    }
  };

  const handleExportAll = (format: "csv" | "json") => {
    if (format === "csv") {
      exportToCSV(allGrantedPermissions);
    } else {
      exportToJSON(allGrantedPermissions);
    }
  };

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <Popover open={open} onOpenChange={handleOpenChange}>
          <PopoverTrigger asChild>
            <TooltipTrigger asChild>
              <div className="cursor-pointer hover:underline inline-flex items-center">
                {children}
              </div>
            </TooltipTrigger>
          </PopoverTrigger>
          <PopoverContent className="w-[550px] p-0" align="start" sideOffset={5}>
            <div className="p-3 border-b bg-muted/30">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-sm">Role Permissions Overview</h4>
                  {!loading && modules.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {grantedCount} of {permissionsCount} permissions granted
                    </p>
                  )}
                </div>
                {!loading && allGrantedPermissions.length > 0 && (
                  <div>
                    {selectedPermissions.size > 0 ? (
                      <DropdownMenu>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="default"
                                size="sm"
                                className="h-7 px-2 bg-primary text-white hover:opacity-95"
                              >
                                <Upload className="h-3.5 w-3.5 mr-1" />
                                ({selectedPermissions.size})
                                <ChevronDown className="h-3.5 w-3.5 ml-1" />
                              </Button>
                            </DropdownMenuTrigger>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Export selected permissions</p>
                          </TooltipContent>
                        </Tooltip>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleExportSelected("csv")}
                          >
                            <Upload className="h-3.5 w-3.5 mr-2" />
                            CSV
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleExportSelected("json")}
                          >
                            <Upload className="h-3.5 w-3.5 mr-2" />
                            JSON
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <DropdownMenu>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm" className="h-7 px-2">
                                <Upload className="h-3.5 w-3.5" />
                                <ChevronDown className="h-3.5 w-3.5 ml-1" />
                              </Button>
                            </DropdownMenuTrigger>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Export all permissions</p>
                          </TooltipContent>
                        </Tooltip>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleExportAll("csv")}>
                            <Upload className="h-3.5 w-3.5 mr-2" />
                            CSV
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleExportAll("json")}>
                            <Upload className="h-3.5 w-3.5 mr-2" />
                            JSON
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                )}
              </div>
            </div>

            {loading && (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}

            {error && (
              <div className="p-4 text-sm text-destructive">
                <p>{error}</p>
              </div>
            )}

            {!loading && !error && modules.length > 0 && (
              <ScrollArea className="h-[280px]">
                <div className="p-3">
              <div className="space-y-3">
                {modules.map((module) => {
                  const modulePagesWithPermissions = module.pages.filter(
                    (page) => page.actions.some((action) => action.hasRole)
                  );

                  if (modulePagesWithPermissions.length === 0) return null;

                  return (
                    <div key={module.id} className="space-y-1.5">
                      <h5 className="font-semibold text-xs text-primary px-1">
                        {module.name}
                      </h5>
                      <div className="border rounded-md overflow-hidden">
                        <table className="w-full text-xs">
                          <thead className="bg-muted/50">
                            <tr>
                              <th className="text-center p-1.5 font-medium text-[11px] w-10">
                                <Checkbox
                                  checked={isAllSelected}
                                  onCheckedChange={toggleSelectAll}
                                  className="h-3.5 w-3.5"
                                  aria-label="Select all permissions"
                                />
                              </th>
                              <th className="text-left p-1.5 font-medium text-[11px]">
                                Page
                              </th>
                              <th className="text-left p-1.5 font-medium text-[11px]">
                                Action
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {modulePagesWithPermissions.map((page) => {
                              const grantedActions = page.actions.filter(
                                (action) => action.hasRole
                              );
                              return grantedActions.map((action, idx) => (
                                <tr
                                  key={action.id}
                                  className={cn(
                                    "border-t hover:bg-muted/30 transition-colors",
                                    idx % 2 === 0 ? "bg-background" : "bg-muted/20"
                                  )}
                                >
                                  <td className="p-1.5 text-center">
                                    <Checkbox
                                      checked={selectedPermissions.has(action.id)}
                                      onCheckedChange={() =>
                                        togglePermissionSelection(action.id)
                                      }
                                      className="h-3.5 w-3.5"
                                      aria-label={`Select ${action.name}`}
                                    />
                                  </td>
                                  <td className="p-1.5 text-[11px]">{page.name}</td>
                                  <td className="p-1.5 text-[11px]">
                                    <div className="flex items-center gap-1.5">
                                      <span>{action.name}</span>
                                      {action.apiEndpoint && (
                                        <Badge
                                          variant="outline"
                                          className="text-[9px] px-1 py-0 h-4"
                                        >
                                          {action.method}
                                        </Badge>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ));
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>
                </div>
              </ScrollArea>
            )}

            {!loading && !error && modules.length === 0 && (
              <div className="p-4 text-sm text-muted-foreground text-center">
                No permissions data available
              </div>
            )}
      </PopoverContent>
        </Popover>
        <TooltipContent side="top" className="max-w-xs">
          <p className="text-xs">Click to view detailed permissions breakdown</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
