"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Download,
  Copy,
  Eye,
  Shield,
  Zap,
  Layout,
  History,
  X,
} from "lucide-react";
import { usePermissionMatrixContext } from "../contexts";
import { PaginatedRoleSelect } from "./PaginatedRoleSelect";

export const PermissionMatrixControls: React.FC = () => {
  const router = useRouter();
  const {
    selectedRole,
    setSelectedRole,
    searchTerm,
    setSearchTerm,
    filterGroup,
    setFilterGroup,
    bulkEditMode,
    setBulkEditMode,
    setShowTemplates,
    selectedCells,
    clearSelectedCells,
    roles,
    groups,
  } = usePermissionMatrixContext();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Granular Permission Matrix</span>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between gap-4">
          <div className="flex gap-4">
            <div className="w-[300px]">
              <PaginatedRoleSelect 
                value={selectedRole} 
                onValueChange={setSelectedRole} 
              />
            </div>

            <div className="relative w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" />
              <Input
                placeholder="Search modules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10 w-full"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="w-[200px]">
              <Select value={filterGroup} onValueChange={setFilterGroup}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Groups</SelectItem>
                  {groups.map((group) => (
                    <SelectItem key={group} value={group}>
                      {group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-fit"
                    onClick={() => {
                      // Navigate to audit logs with pre-selected permission events
                      router.push('/auditlogs?events=assign%20permission,delete%20permission,update%20permission');
                    }}
                  >
                    <History className="h-4 w-4" />
                  </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Audit Trail</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
          </div>
        </div>


      </CardContent>
    </Card>
  );
};
