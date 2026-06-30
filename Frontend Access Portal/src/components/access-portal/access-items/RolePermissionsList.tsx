// components/access-items/RolePermissionsList.tsx
import React, { useState, useEffect } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, Upload, ChevronDown, Shield, FolderOpen, FileText, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

interface RolePermissionsListProps {
  roleId: string;
  permissionsCount: number;
}

export const RolePermissionsList: React.FC<RolePermissionsListProps> = ({
  roleId,
  permissionsCount
}) => {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const fetchPermissions = async () => {
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
      setModules(data.modules || []);

      // Auto-expand first module by default
      if (data.modules && data.modules.length > 0) {
        setExpandedModules(new Set([data.modules[0].id]));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load permissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (roleId) {
      fetchPermissions();
    }
  }, [roleId]);

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

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const expandAll = () => {
    setExpandedModules(new Set(modules.map(m => m.id)));
  };

  const collapseAll = () => {
    setExpandedModules(new Set());
  };


  const hasAnyGrantedPermissions = modules.some(module =>
    module.pages.some(page =>
      page.actions.some(action => action.hasRole)
    )
  );


  return (
    <div className="flex flex-col h-full min-h-0 space-y-4">
      {/* Header with stats and actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            Total: {permissionsCount}
          </Badge>
          <Badge
            variant="secondary"
            className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300"
          >
            Granted: {grantedCount}
          </Badge>
          {modules.length > 0 && (
            <>
              <Button variant="ghost" size="sm" onClick={expandAll} className="h-7 text-xs">
                Expand All
              </Button>
              <Button variant="ghost" size="sm" onClick={collapseAll} className="h-7 text-xs">
                Collapse All
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Permissions List */}
      <Card className="flex-1 flex flex-col min-h-0">
        <CardContent className="p-0 flex-1 overflow-auto">
          {loading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-sm text-muted-foreground">Loading permissions...</span>
            </div>
          )}

          {error && (
            <div className="p-6 text-center">
              <p className="text-sm text-destructive">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchPermissions} className="mt-2">
                Retry
              </Button>
            </div>
          )}

          {!loading && !error && (!modules.length || !hasAnyGrantedPermissions || !(permissionsCount > 0)) && (
            <div className="py-12 text-center">
              <Shield className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">No permissions found for this role</p>
            </div>
          )}

          {!loading && !error && modules.length > 0 && permissionsCount > 0 && (
            <div>
              <div className="divide-y">
                {modules.map((module) => {
                  const modulePagesWithPermissions = module.pages.filter(
                    (page) => page.actions.some((action) => action.hasRole)
                  );

                  if (modulePagesWithPermissions.length === 0) return null;

                  const isExpanded = expandedModules.has(module.id);

                  return (
                    <div key={module.id} className="hover:bg-muted/5 transition-colors">
                      {/* Module Header */}
                      <div
                        className="flex items-center gap-2 p-3 cursor-pointer hover:bg-muted/30 transition-colors"
                        onClick={() => toggleModule(module.id)}
                      >
                        <FolderOpen className={cn(
                          "h-4 w-4 transition-transform",
                          isExpanded ? "text-primary" : "text-muted-foreground"
                        )} />
                        <span className="text-sm font-medium flex-1">{module.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {modulePagesWithPermissions.reduce((count, page) =>
                            count + page.actions.filter(a => a.hasRole).length, 0
                          )} permissions
                        </Badge>
                        <ChevronDown className={cn(
                          "h-4 w-4 text-muted-foreground transition-transform",
                          isExpanded && "rotate-180"
                        )} />
                      </div>

                      {/* Module Content */}
                      {isExpanded && (
                        <div className="pl-8 pr-3 pb-2 space-y-2">
                          {modulePagesWithPermissions.map((page) => {
                            const grantedActions = page.actions.filter((action) => action.hasRole);

                            return (
                              <div key={page.id} className="border rounded-md overflow-hidden">
                                {/* Page Header */}
                                <div className="bg-muted/30 px-3 py-1.5 border-b">
                                  <div className="flex items-center gap-2">
                                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="text-xs font-medium">{page.name}</span>
                                    <Badge variant="outline" className="text-[10px] ml-auto">
                                      {grantedActions.length} actions
                                    </Badge>
                                  </div>
                                </div>

                                {/* Actions List */}
                                <div className="divide-y">
                                  {grantedActions.map((action) => (
                                    <div key={action.id} className="px-3 py-2 hover:bg-muted/20 transition-colors">
                                      <div className="flex items-center justify-between gap-4">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2">
                                            <span className="text-xs font-medium">{action.name}</span>

                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Footer with sync info */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Showing all granted permissions</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-help underline decoration-dotted">
                Last updated: Just now
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              <p>Permissions are loaded in real-time</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};