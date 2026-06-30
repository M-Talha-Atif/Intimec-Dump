"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronRight, AlertTriangle, CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePermissionMatrixContext } from "../contexts";
import { getCellPermission, getCellIcon, getCellColor } from "../utils";
import { TruncatedText } from "../role-management/components/TruncatedText";
import { BulkActionBar } from "./BulkActionBar";

export const PermissionMatrixGrid: React.FC = () => {
  const {
    selectedRole,
    expandedGroups,
    selectedCells,
    bulkEditMode,
    bulkMode,
    permissions,
    allActions,
    filteredModules,
    roles,
    toggleGroup,
    handleCellClick,
    handleSelectAllForModule,
    setBulkEditMode,
    setBulkMode,
    clearSelectedCells,
    openBulkDialog,
  } = usePermissionMatrixContext();

  const selectedRoleData = roles.find((r) => r.id === selectedRole);

  const toggleBulkMode = () => {
    if (bulkEditMode) {
      clearSelectedCells();
    } else {
      setBulkEditMode(true);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle>
                Permissions for <TruncatedText text={selectedRoleData?.name || ""} maxLength={32} />
                <Badge variant="secondary" className="ml-2">
                  {selectedRoleData?.type}
                </Badge>
              </CardTitle>
            </div>
            <Button
              variant={bulkEditMode ? "default" : "outline"}
              size="sm"
              onClick={toggleBulkMode}
            >
              <CheckSquare className="h-4 w-4 mr-2" />
              {bulkEditMode ? "Exit Bulk Mode" : "Bulk Select"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-auto">
            <div className="min-w-[800px]">
              {/* Header Row */}
              <div className="sticky top-0 border-b border-gray-200 z-10 bg-background">
                <div className="grid grid-cols-[300px_1fr] gap-0">
                  <div className="p-4 font-medium border-r border-gray-200">
                    Module
                  </div>
                  <div
                    className="grid gap-0"
                    style={{
                      gridTemplateColumns: `repeat(${allActions.length}, 100px)`,
                    }}
                  >
                    {allActions.map((action) => (
                      <div
                        key={action}
                        className="p-4 text-center font-medium border-r border-gray-200 last:border-r-0"
                      >
                        <div className="text-xs font-semibold capitalize">
                          {action}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Module Groups */}
              {filteredModules.map((group) => (
                <div key={group.group} className="border-b border-gray-100">
                  {/* Group Header */}
                  <div
                    className="border-b border-gray-200 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900"
                    onClick={() => toggleGroup(group.group)}
                  >
                    <div className="grid grid-cols-[300px_1fr] gap-0">
                      <div className="p-3 flex items-center space-x-2 border-r border-gray-200">
                        {expandedGroups.has(group.group) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        <span className="font-medium">{group.group}</span>
                        <Badge variant="outline">{group.modules.length}</Badge>
                      </div>
                      <div className="p-3"></div>
                    </div>
                  </div>

                  {/* Module Rows */}
                  {expandedGroups.has(group.group) &&
                    group.modules.map((module) => {
                      // Calculate if all valid cells for this module are selected
                      const validCellsForModule = allActions
                        .filter(action => module.actions.includes(action))
                        .map(action => `${module.moduleId}-${action}`)
                        .filter(cellKey => {
                          const cell = permissions[selectedRole]?.[cellKey];
                          if (bulkMode === "") return true; // In empty mode, all are valid
                          if (bulkMode === "assign") return cell?.effect === "inherit";
                          if (bulkMode === "revoke") return cell?.effect === "allow";
                          return false;
                        });
                      
                      const allModuleCellsSelected = validCellsForModule.length > 0 && 
                        validCellsForModule.every(cellKey => selectedCells.has(cellKey));
                      const someModuleCellsSelected = validCellsForModule.some(cellKey => selectedCells.has(cellKey));

                      return (
                      <div
                        key={module.moduleId}
                        className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-900"
                      >
                        <div className="grid grid-cols-[300px_1fr] gap-0">
                          <div className="p-4 border-r border-gray-200">
                            <div className="flex items-center gap-2">
                              {bulkEditMode && (
                                <Checkbox
                                  checked={someModuleCellsSelected && !allModuleCellsSelected ? "indeterminate" : allModuleCellsSelected}
                                  onCheckedChange={() => handleSelectAllForModule(module.moduleId, module.actions)}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              )}
                              <div>
                                <div className="font-medium">{module.label}</div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {(module as any).pageName || module.label.toLowerCase()}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div
                            className="grid gap-0"
                            style={{
                              gridTemplateColumns: `repeat(${allActions.length}, 100px)`,
                            }}
                          >
                            {allActions.map((action) => {
                              const hasAction = module.actions.includes(action);
                              const cell = getCellPermission(
                                permissions,
                                selectedRole,
                                module.moduleId,
                                action
                              );
                              const cellKey = `${module.moduleId}-${action}`;
                              const isSelected = selectedCells.has(cellKey);
                              const isAlreadyPermitted = cell.effect !== "inherit";
                              // Allow all cells when mode is empty (for initial detection)
                              const cannotSelect = bulkMode === "" 
                                ? false 
                                : bulkMode === "assign" 
                                  ? isAlreadyPermitted 
                                  : !isAlreadyPermitted;

                              return (
                                <div
                                  key={action}
                                  className="p-2 border-r border-gray-200 last:border-r-0 flex items-center justify-center"
                                >
                                  {hasAction ? (
                                    <div className="relative">
                                      {bulkEditMode && (
                                        <Checkbox
                                          checked={isSelected}
                                          disabled={cannotSelect}
                                          onCheckedChange={() =>
                                            handleCellClick(module.moduleId, action)
                                          }
                                          className="absolute -top-1 -left-1 z-10"
                                        />
                                      )}
                                      <button
                                        onClick={() =>
                                          handleCellClick(module.moduleId, action)
                                        }
                                        disabled={bulkEditMode && cannotSelect}
                                        className={cn(
                                          "w-8 h-8 rounded border-2 flex items-center justify-center transition-all hover:scale-105 relative",
                                          getCellColor(cell),
                                          isSelected && bulkEditMode && "ring-2 ring-blue-500",
                                          bulkEditMode && !cannotSelect && "cursor-pointer",
                                          bulkEditMode && cannotSelect && "cursor-not-allowed opacity-60"
                                        )}
                                        title={
                                          bulkEditMode && cannotSelect
                                            ? bulkMode === "assign"
                                              ? "Already has permission - cannot bulk assign"
                                              : "No permission to revoke"
                                            : `${cell.effect} - ${cell.source}`
                                        }
                                      >
                                        {getCellIcon(cell)}
                                        {cell.hasConditions && (
                                          <AlertTriangle className="h-2 w-2 text-orange-500 absolute -bottom-0.5 -right-0.5" />
                                        )}
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="w-8 h-8 rounded border border-gray-200"></div>
                                  )}
                                </div>
                              );
                            })}

                        </div>
                      </div>
                    </div>
                      );
                    })}
                </div>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Bulk Action Bar */}
    <BulkActionBar
      selectedCount={selectedCells.size}
      bulkMode={bulkMode}
      onModeChange={() => {}} // Mode is auto-detected, not manually changed
      onConfigure={openBulkDialog}
      onCancel={clearSelectedCells}
    />
  </>
  );
};
