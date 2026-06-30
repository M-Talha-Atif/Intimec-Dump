import React from "react";
import { Plus, Download, Layout, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRoleManagementContext } from "../contexts/RoleManagementContext";
import { useRouter } from "next/navigation";

export const RoleHeader: React.FC = () => {
  const {
    stats,
    setShowCreateWizard,
    setShowBulkImportDialog,
    setShowTemplates,
  } = useRoleManagementContext();

  const router = useRouter();

  const handleAuditTrail = () => {
    // Pre-selected event types for role management
    const eventTypes = [
      "assign role",
      "bulk role delete",
      "copy",
      "create",
      "delete",
      "revoke role",
      "revoke role (bulk)",
      "role reconciliation"
    ];
    
    // Pre-selected object types for role management
    const objectTypes = [
      "Dynamic Rule",
      "Global Dynamic Rule",
      "Role"
    ];

    // Build query parameters
    const params = new URLSearchParams();
    eventTypes.forEach(event => params.append("eventTypes", event));
    objectTypes.forEach(obj => params.append("objectTypes", obj));

    // Navigate to audit logs with filters
    router.push(`/auditlogs?${params.toString()}`);
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Role Management</h2>
        <p className="text-muted-foreground">
          Manage internal application roles and permissions
        </p>
        {stats && (
          <div className="flex items-center gap-4 mt-2">
            <Badge variant="default">{stats.active} Active</Badge>
            <Badge variant="secondary">{stats.inactive} Inactive</Badge>
            {stats.highRisk > 0 && (
              <Badge variant="destructive">{stats.highRisk} High Risk</Badge>
            )}
            {stats.withViolations > 0 && (
              <Badge variant="outline">
                {stats.withViolations} With Violations
              </Badge>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                onClick={handleAuditTrail}
                className=" w-fit"
              >
                <History className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Audit Trail</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowBulkImportDialog(true)}
              >
                <Download className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Import</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowTemplates(true)}
              >
                <Layout className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Templates</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Button onClick={() => setShowCreateWizard(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Role
        </Button>
      </div>
    </div>
  );
};
