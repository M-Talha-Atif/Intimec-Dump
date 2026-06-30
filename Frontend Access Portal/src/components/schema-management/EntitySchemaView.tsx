"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Plus,
  Search,
  Upload,
  Download,
  Trash2,
  Lock,
  RefreshCw,
} from "lucide-react";
import { AttributeDialog } from "./AttributeDialog";
import { SchemaVersionHistoryDialog } from "./SchemaVersionHistoryDialog";
import { SchemaImportExportDialog } from "./SchemaImportExportDialog";
import { DeleteAttributeModal } from "./DeleteAttributeModal";
import { SchemaConfirmationDialog } from "./SchemaConfirmationDialog";
import { clearStatisticsCache } from "./SchemaOverview";
import { useSchemaManagement } from "@/contexts/schema-management-context";
import {
  CreateAttributeRequest,
  UpdateAttributeRequest,
  SchemaAttribute,
} from "@/types/schema-mangement";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export const EntitySchemaView = () => {
  const {
    state,
    getEntityDisplayName,
    getCurrentEntityData,
    addAttributeToEntity,
    deleteAttributeFromEntity,
    updateAttribute,
    updateAttributeFromEntity,
    setSearchTerm,
    setFilterType,
    loadEntityFields,
  } = useSchemaManagement();

  // Local state for dialogs and UI
  const [editingAttribute, setEditingAttribute] =
    useState<SchemaAttribute | null>(null);
  const [isAddingAttribute, setIsAddingAttribute] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);
  const [deleteAttribute, setDeleteAttribute] =
    useState<SchemaAttribute | null>(null);
  const [showToggleConfirmation, setShowToggleConfirmation] = useState(false);
  const [pendingToggle, setPendingToggle] = useState<{
    attributeName: string;
    field: string;
    value: boolean;
    attribute: SchemaAttribute;
  } | null>(null);

  // Load entity fields when active entity changes (only if not already loaded)
  useEffect(() => {
    if (state.activeEntity) {
      const currentEntityData = getCurrentEntityData();
      const isLoading = state.loadingStates.entityFields[state.activeEntity];
      const hasError = state.errors.entityFields[state.activeEntity];

      // Only load if we don't have data, aren't currently loading, and don't have an error
      // Check if the entity data exists at all (not just if attributes exist)
      if (!currentEntityData && !isLoading && !hasError) {
        loadEntityFields(state.activeEntity);
      }
    }
  }, [
    state.activeEntity,
    state.loadingStates.entityFields,
    state.errors.entityFields,
    getCurrentEntityData,
    loadEntityFields,
  ]);

  const currentEntityData = getCurrentEntityData();
  const attributes = currentEntityData?.attributes || [];
  // console.log("Current entity attributes:", attributes);

  const filteredAttributes = attributes.filter((attr) => {
    const matchesSearch =
      attr.displayName.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
      (attr.systemKey?.toLowerCase().includes(state.searchTerm.toLowerCase()) ??
        false);

    if (state.filterType === "all") return matchesSearch;
    if (state.filterType === "required")
      return matchesSearch && attr.isRequired;
    if (state.filterType === "sensitive")
      return matchesSearch && attr.isSensitive;
    if (state.filterType === "custom")
      return matchesSearch && attr.systemKey !== attr.displayName;
    if (state.filterType === "unique") return matchesSearch && attr.isUnique;

    return matchesSearch;
  });

  const handleEditAttribute = (attribute: SchemaAttribute) => {
    setEditingAttribute(attribute);
  };

  const handleAddAttribute = () => {
    setIsAddingAttribute(true);
  };

  const handleSaveAttribute = async (attributeData: SchemaAttribute) => {
    try {
      if (editingAttribute) {
        // Editing existing attribute - use API call to update
        const updateRequest: UpdateAttributeRequest = {
          displayName: attributeData.displayName.trim(),
          isRequired: attributeData.isRequired,
          description: attributeData.description || "",
          isSensitive: attributeData.isSensitive,
          // Persist using backend field name in save payload
          isWritable: attributeData.isEditable,
          defaultValue: attributeData.defaultValue || null,
          clearDefaultValue: !attributeData.defaultValue ||
            (typeof attributeData.defaultValue === 'string' && attributeData.defaultValue.trim() === "") ||
            (typeof attributeData.defaultValue === 'object' && (!attributeData.defaultValue || Object.keys(attributeData.defaultValue).length === 0)),
        };

        await updateAttributeFromEntity(
          state.activeEntity,
          editingAttribute.id,
          updateRequest
        );

        toast.success("Attribute Updated", {
          description: `Successfully updated ${attributeData.displayName
            } in ${getEntityDisplayName(state.activeEntity)}`,
        });
      } else {
        // Creating new attribute - use API call (validation already done in AttributeDialog)
        const createRequest: CreateAttributeRequest = {
          displayName: attributeData.displayName.trim(),
          systemKey: attributeData.systemKey.trim(),
          dataType: attributeData.dataType || "String",
          description: attributeData.description?.trim() || "",
          isRequired: attributeData.isRequired || false,
          isSensitive: attributeData.isSensitive || false,
          isWritable: attributeData.isEditable || false,
          defaultValue: attributeData.defaultValue || null,
          isUnique: attributeData.isUnique || false,
        };

        await addAttributeToEntity(state.activeEntity, createRequest);

        // Clear the statistics cache to ensure Overview tab shows updated data
        clearStatisticsCache(state.activeEntity);

        toast.success("Attribute Added", {
          description: `Successfully added ${attributeData.displayName
            } to ${getEntityDisplayName(state.activeEntity)}`,
        });
      }

      // Clear the statistics cache for both add and update operations
      clearStatisticsCache(state.activeEntity);

      setEditingAttribute(null);
      setIsAddingAttribute(false);
    } catch (error) {
      toast.error("Error", {
        description:
          error instanceof Error ? error.message : "Failed to save attribute",
      });
    }
  };

  const openDeleteModal = (attribute: SchemaAttribute) => {
    setDeleteAttribute(attribute);
  };

  const handleAttributeToggle = async (
    attributeName: string,
    field: string,
    value: boolean
  ) => {
    const attr = attributes.find((a) => a.displayName === attributeName);
    if (attr) {
      // Store the pending toggle operation
      setPendingToggle({
        attributeName,
        field,
        value,
        attribute: attr,
      });
      setShowToggleConfirmation(true);
    }
  };

  const handleConfirmToggle = async () => {
    if (!pendingToggle) return;

    const { attributeName, field, value, attribute } = pendingToggle;

    try {
      await updateAttribute(state.activeEntity, attribute.id, { [field]: value });

      // Show success message
      const fieldName = field === "isRequired" ? "Required" :
                       field === "isSensitive" ? "Sensitive" :
                       field === "isEditable" ? "Editable" : field;
      toast.success("Attribute Updated", {
        description: `${fieldName} status updated for ${attributeName}`,
      });
    } catch (error) {
      toast.error("Update Failed", {
        description: error instanceof Error ? error.message : "Failed to update attribute",
      });
    } finally {
      setShowToggleConfirmation(false);
      setPendingToggle(null);
    }
  };


  const handleImportExport = (type: "import" | "export") => {
    console.log("Import/Export type:", type);
    setShowImportExport(true);
  };

  const handleDeleteAttribute = async () => {
    if (!deleteAttribute) return;

    // Capture values immediately to avoid stale closures
    const attributeName = deleteAttribute.displayName;
    const entityId = state.activeEntity;
    const entityDisplayName = getEntityDisplayName(entityId);

    try {
      await deleteAttributeFromEntity(entityId, deleteAttribute.id);
      setDeleteAttribute(null);

      // Clear the statistics cache to ensure Overview tab shows updated data
      clearStatisticsCache(entityId);

      // Use captured values to ensure consistency
      toast.success("Attribute Deleted", {
        description: `Successfully deleted ${attributeName} from ${entityDisplayName}`,
      });
    } catch (error) {
      toast.error("Error", {
        description:
          error instanceof Error ? error.message : "Failed to delete attribute",
      });
    }
  };

  // TODO: Add sync button to use this function
  // const handleSyncAttribute = (attributeId: string) => {
  //   const attr = attributes.find((a) => a.id === attributeId);

  //   // Update both sync status and sync flag
  //   updateAttribute(state.activeEntity, attributeId, {
  //     syncStatus: "synced",
  //     syncFlag: true,
  //     lastModified: new Date().toISOString().split("T")[0],
  //   });

  //   // Also call the syncAttribute action for any additional logic
  //   syncAttribute(state.activeEntity, attributeId);

  //   toast.success("Attribute Synced", {
  //     description: `Successfully synced "${attr?.displayName}" from source mapping.`,
  //   });
  // };

  return (
    <div className="w-full space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search attributes..."
              value={state.searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
          <Select value={state.filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Filter type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="required">Required</SelectItem>
              <SelectItem value="sensitive">Sensitive</SelectItem>
              <SelectItem value="writable">Writable</SelectItem>
              <SelectItem value="unique">Unique</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap gap-2 justify-start lg:justify-center items-center w-full lg:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleImportExport("export")}
          >
            <Download className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Export Schema</span>
            <span className="sm:hidden">Export</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleImportExport("import")}
          >
            <Upload className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Import Schema</span>
            <span className="sm:hidden">Import</span>
          </Button>

          <Button size="sm" onClick={handleAddAttribute}>
            <Plus className="h-4 w-4 mr-2" />
            Add Attribute
          </Button>
        </div>
      </div>

      {/* Schema Table */}
      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Schema Attributes - {getEntityDisplayName(state.activeEntity)}
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage the schema for{" "}
            {getEntityDisplayName(state.activeEntity).toLowerCase()} objects.
            Changes are tracked and versioned.
          </p>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>IGA Attribute</TableHead>
                <TableHead>Native Name</TableHead>
                <TableHead>Data Type</TableHead>
                <TableHead>Field Type</TableHead>
                <TableHead>Required</TableHead>
                <TableHead>Sensitive</TableHead>
                <TableHead>Writable</TableHead>
                <TableHead>Unique</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.loadingStates.entityFields[state.activeEntity] ? (
                // Enhanced loading skeleton for table rows with realistic dimensions
                Array.from({ length: 10 }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`} >
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Skeleton className="h-5 w-40 animate-pulse" />
                        <Skeleton className="h-4 w-4 rounded animate-pulse" />
                        <Skeleton className="h-4 w-6 rounded-full animate-pulse" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32 font-mono animate-pulse" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-20 rounded-full animate-pulse" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-20 rounded-full animate-pulse" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-12 rounded animate-pulse" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-12 rounded animate-pulse" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-12 rounded animate-pulse" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-12 rounded animate-pulse" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-64 animate-pulse" />
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Skeleton className="h-9 w-16 animate-pulse" />
                        <Skeleton className="h-9 w-16 animate-pulse" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : state.errors.entityFields[state.activeEntity] ? (
                <TableRow >
                  <TableCell colSpan={12} className="text-center py-6">
                    <div className="text-destructive">
                      Error loading attributes:{" "}
                      {state.errors.entityFields[state.activeEntity]}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() =>
                        loadEntityFields(state.activeEntity)
                      }
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Retry
                    </Button>
                  </TableCell>
                </TableRow>
              ) : filteredAttributes.length === 0 ? (
                <TableRow >
                  <TableCell colSpan={12} className="text-center py-6">
                    <div className="text-muted-foreground">
                      No attributes found for this entity.
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAttributes.map((attr) => (
                  <TableRow key={attr.displayName} >
                    <TableCell className="font-medium flex items-center space-x-2">
                      <span>{attr.displayName}</span>
                      {attr.isSystemAttribute && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Lock className="h-3 w-3 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>System attribute - cannot be deleted</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      {attr.isUnique && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Badge
                                variant="secondary"
                                className="text-xs px-1 py-0"
                              >
                                U
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Unique constraint - values must be unique</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {attr.systemKey}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{attr.dataType}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="text-primary bg-primary/10"
                      >
                        {attr.dataType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={attr.isRequired}
                        disabled={attr.isCoreField}
                        onCheckedChange={(checked) =>
                          handleAttributeToggle(
                            attr.displayName,
                            "isRequired",
                            checked
                          )
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={attr.isSensitive}
                        disabled={attr.isCoreField}
                        onCheckedChange={(checked) =>
                          handleAttributeToggle(
                            attr.displayName,
                            "isSensitive",
                            checked
                          )
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={attr.isEditable ?? false}
                        disabled={attr.isCoreField}
                        onCheckedChange={(checked) =>
                          handleAttributeToggle(
                            attr.displayName,
                            "isEditable",
                            checked
                          )
                        }
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch checked={attr.isUnique} disabled={true} />
                    </TableCell>

                    <TableCell className="max-w-xs truncate">
                      {attr.description}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {attr.isEditable && !attr.isCoreField && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditAttribute(attr)}
                          >
                            Edit
                          </Button>
                        )}

                        {!attr.isSystemAttribute && !attr.isCoreField && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openDeleteModal(attr)}
                                  className="hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Delete this attribute and check impact</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Schema Statistics moved to main header area */}

      {/* Modals and Dialogs */}
      <>
        <AttributeDialog
          open={!!editingAttribute || isAddingAttribute}
          onOpenChange={(open) => {
            if (!open) {
              setEditingAttribute(null);
              setIsAddingAttribute(false);
            }
          }}
          attribute={editingAttribute || undefined}
          entityType={getEntityDisplayName(state.activeEntity)}
          onSave={handleSaveAttribute}
        />
        <SchemaVersionHistoryDialog
          open={showVersionHistory}
          onOpenChange={setShowVersionHistory}
          entityType={state.activeEntity}
        />
        <SchemaImportExportDialog
          open={showImportExport}
          onOpenChange={setShowImportExport}
          entityType={state.activeEntity}
        />
        <DeleteAttributeModal
          open={!!deleteAttribute}
          onOpenChange={(open) => {
            if (!open) setDeleteAttribute(null);
          }}
          attribute={deleteAttribute}
          entityType={state.activeEntity}
          onDelete={handleDeleteAttribute}
          tenantStatistics={state.tenantStatistics}
        />
        <SchemaConfirmationDialog
          open={showToggleConfirmation}
          onOpenChange={setShowToggleConfirmation}
          onConfirm={handleConfirmToggle}
          title="Confirm Attribute Property Change"
          description={`You are about to change the ${pendingToggle?.field === "isRequired" ? "required" :
            pendingToggle?.field === "isSensitive" ? "sensitive" :
            pendingToggle?.field === "isEditable" ? "editable" : ""} property for "${pendingToggle?.attributeName}". This may affect existing identities and workflows.`}
          actionType="update"
          entityType={state.activeEntity}
          attributeName={pendingToggle?.attributeName}
          identitiesAffected={0} // Could be calculated based on tenant statistics
          isLoading={false}
        />
      </>
    </div>
  );
};