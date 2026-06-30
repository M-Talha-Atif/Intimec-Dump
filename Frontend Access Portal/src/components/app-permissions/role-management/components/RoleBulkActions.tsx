import React from "react";
import { Upload, Trash2, CheckSquare, List, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRoleManagementContext } from "../contexts/RoleManagementContext";

export const RoleBulkActions: React.FC = () => {
  const { 
    selectedRoles, 
    roles, 
    setSelectedRoles, 
    handleExportSelected, 
    handleBulkOperation, 
    viewMode, 
    setViewMode,
    showBulkDeleteConfirm,
    setShowBulkDeleteConfirm,
    bulkDeleteRoleNames,
    executeBulkDelete,
  } = useRoleManagementContext();

  // Only count non-SYSTEM roles for "select all" state
  const selectableRoles = roles.filter((role) => role.type !== "SYSTEM");
  const allSelected = selectedRoles.length === selectableRoles.length && selectableRoles.length > 0;

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedRoles([]);
    } else {
      // Only select non-SYSTEM roles
      setSelectedRoles(selectableRoles.map((role) => role.id));
    }
  };

  return (
    <>
      <div className="flex items-center gap-2 ml-auto">
        {selectedRoles.length > 0 && (
          <>
            <span className="text-sm text-muted-foreground">
              {selectedRoles.length} selected
            </span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={handleSelectAll}>
                    <CheckSquare className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{allSelected ? "Deselect All" : "Select All"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={handleExportSelected}>
                    <Upload className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Export</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkOperation("delete")}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
        <ToggleGroup
          type="single"
          variant="outline"
          value={viewMode}
          onValueChange={(value) => {
            if (value === "card" || value === "table") {
              setViewMode(value);
            }
          }}
        >
          <ToggleGroupItem value="card" aria-label="Card view">
            <LayoutGrid className="w-4 h-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="table" aria-label="Table view">
            <List className="w-4 h-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <AlertDialog open={showBulkDeleteConfirm} onOpenChange={setShowBulkDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role{selectedRoles.length > 1 ? "s" : ""}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the following role{selectedRoles.length > 1 ? "s" : ""}? <br />
              <span className="font-semibold text-foreground">{bulkDeleteRoleNames}</span>
              <br /><br />
              This action cannot be undone and will remove all permissions associated with {selectedRoles.length > 1 ? "these roles" : "this role"}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Role{selectedRoles.length > 1 ? "s" : ""}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
