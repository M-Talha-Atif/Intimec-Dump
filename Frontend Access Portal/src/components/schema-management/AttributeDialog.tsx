import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Loader } from "lucide-react";
import { SchemaAttribute } from "@/types/schema-mangement";
import { SchemaConfirmationDialog } from "./SchemaConfirmationDialog";

interface AttributeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attribute?: SchemaAttribute;
  entityType: string;
  onSave: (attributeData: SchemaAttribute) => Promise<void>;
}

interface FormData {
  displayName: string;
  systemKey: string;
  dataType: string;
  isEditable: boolean;
  isRequired: boolean;
  isSensitive: boolean;
  defaultValue: string | object | null;
  description: string;
  complianceTags: string[];
  isUnique: boolean;
}

export const AttributeDialog = ({
  open,
  onOpenChange,
  attribute,
  entityType,
  onSave,
}: AttributeDialogProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingAttributeData, setPendingAttributeData] =
    useState<SchemaAttribute | null>(null);
  const [formData, setFormData] = useState<FormData>({
    displayName: "",
    systemKey: "",
    dataType: "String",
    isEditable: true,
    isRequired: false,
    isSensitive: false,
    defaultValue: "",
    description: "",
    complianceTags: [],
    isUnique: false, // New field for uniqueness
  });

  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    if (attribute) {
      const isObjectType =
        String(attribute.dataType).toUpperCase() === "OBJECT";
      setFormData({
        displayName: attribute.displayName || "",
        systemKey: attribute.systemKey || "",
        dataType: attribute.dataType
          ? attribute.dataType.charAt(0).toUpperCase() +
            attribute.dataType.slice(1).toLowerCase()
          : "String",
        isEditable: attribute.isEditable ?? true,
        isRequired: attribute.isRequired ?? false,
        isSensitive: attribute.isSensitive ?? false,
        defaultValue: isObjectType
          ? attribute.defaultValue ?? null
          : attribute.defaultValue != null &&
            typeof attribute.defaultValue !== "object"
          ? String(attribute.defaultValue)
          : "",
        description: attribute.description || "",
        complianceTags: attribute.complianceTags || [],
        isUnique: attribute.isUnique ?? false,
      });
    } else {
      // Reset form for new attribute
      setFormData({
        displayName: "",
        systemKey: "",
        dataType: "String",
        isEditable: true,
        isRequired: false,
        isSensitive: false,
        defaultValue: "",
        description: "",
        complianceTags: [],
        isUnique: false, // New field for uniqueness
      });
    }

    // Reset saving state when dialog opens/closes
    setIsSaving(false);
  }, [attribute, open]);

  const dataTypes = [
    "String",
    "Number",
    "Boolean",
    "Date",
    "Array",
    "Object",
    "Reference",
  ];
  const predefinedTags = [
    "GDPR",
    "HIPAA",
    "SOX",
    "PII",
    "Internal",
    "Risk",
    "Audit",
    "Compliance",
    "Sensitive",
  ];

  const handleAddTag = () => {
    if (newTag && !formData.complianceTags.includes(newTag)) {
      setFormData({
        ...formData,
        complianceTags: [...formData.complianceTags, newTag],
      });
      setNewTag("");
    }
  };
  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      complianceTags: formData.complianceTags.filter(
        (tag) => tag !== tagToRemove
      ),
    });
  };

  const handleSave = async () => {
    // Validate required fields
    if (!formData.displayName?.trim()) {
      toast.error("Display Name is required and cannot be empty.");
      return;
    }

    if (!formData.systemKey?.trim()) {
      toast.error("System Key is required and cannot be empty.");
      return;
    }

    // Validate field lengths (without trimming)
    if (formData.displayName.length > 100) {
      toast.error("Display Name must be 100 characters or less.");
      return;
    }

    if (formData.systemKey.length > 100) {
      toast.error("System Key must be 100 characters or less.");
      return;
    }

    // Create SchemaAttribute object for confirmation
    const schemaAttribute: SchemaAttribute = {
      id: attribute?.id || `attr_${Date.now()}`, // Generate ID for new attributes
      displayName: formData.displayName.trim(),
      systemKey: formData.systemKey.trim(),
      dataType: formData.dataType,
      isEditable: formData.isEditable,
      isRequired: formData.isRequired,
      isSensitive: formData.isSensitive,
      defaultValue: formData.defaultValue,
      description: formData.description?.trim() || "",
      complianceTags: formData.complianceTags,
      usageContext: "",
      // Optional fields with defaults
      category: attribute?.category || "Custom",
      validationRules: attribute?.validationRules || [],
      lastModified: new Date().toISOString().split("T")[0],
      modifiedBy: "user", // Could be replaced with actual user info
      isSystemAttribute: attribute?.isSystemAttribute || false,
      isUnique: formData.isUnique, // New field for uniqueness
    };

    // Show confirmation dialog
    setPendingAttributeData(schemaAttribute);
    setShowConfirmation(true);
  };

  const handleConfirmSave = async () => {
    if (!pendingAttributeData) return;

    setIsSaving(true);
    setShowConfirmation(false);

    try {
      await onSave(pendingAttributeData);
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the parent component
      console.error("Failed to save attribute:", error);
    } finally {
      setIsSaving(false);
      setPendingAttributeData(null);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(open) => {
          // Prevent closing the dialog while saving
          if (!open && isSaving) {
            return;
          }
          onOpenChange(open);
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{attribute ? "Edit Attribute" : "Add New Attribute"}</span>
            </DialogTitle>
            <DialogDescription>
              Configure the attribute for the {entityType} entity
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="flex justify-center w-full">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="config">Configuration</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">
                    Display Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="displayName"
                    value={formData.displayName}
                    onChange={(e) =>
                      setFormData({ ...formData, displayName: e.target.value })
                    }
                    placeholder="e.g., Employee ID"
                    required
                    className={
                      !formData.displayName?.trim() ? "border-red-300" : ""
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="systemKey">
                    System Key <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="systemKey"
                    value={formData.systemKey}
                    onChange={
                      attribute
                        ? undefined // Read-only when editing
                        : (e) =>
                            setFormData({
                              ...formData,
                              systemKey: e.target.value,
                            })
                    }
                    placeholder="e.g., employeeId"
                    required
                    disabled={!!attribute} // Disable when editing
                    className={
                      !formData.systemKey?.trim()
                        ? "border-red-300"
                        : attribute
                        ? "bg-slate-50 text-slate-600" // Different styling when disabled
                        : ""
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dataType">Data Type</Label>
                  <Select
                    value={formData.dataType}
                    onValueChange={
                      attribute
                        ? undefined // Read-only when editing
                        : (value) =>
                            setFormData({ ...formData, dataType: value })
                    }
                    disabled={!!attribute} // Disable when editing
                  >
                    <SelectTrigger id="dataType"
                      className={attribute ? "bg-slate-50 text-slate-600" : ""}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {dataTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe the purpose and usage of this attribute"
                />
              </div>
            </TabsContent>

            <TabsContent value="config" className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="isRequired">Required Field</Label>
                    <Switch
                      id="isRequired"
                      checked={formData.isRequired}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, isRequired: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="isEditable">Editable</Label>
                    <Switch
                      id="isEditable"
                      checked={formData.isEditable}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, isEditable: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="isSensitive">Sensitive Data</Label>
                    <Switch
                      id="isSensitive"
                      checked={formData.isSensitive}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, isSensitive: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="isUnique">Unique Field</Label>
                      <p className="text-sm text-muted-foreground">
                        Enforce unique values across all records
                        {attribute && " (cannot be changed after creation)"}
                      </p>
                    </div>
                    <Switch
                      id="isUnique"
                      checked={formData.isUnique}
                      onCheckedChange={
                        attribute
                          ? undefined // Read-only when editing
                          : (checked) =>
                              setFormData({ ...formData, isUnique: checked })
                      }
                      disabled={!!attribute} // Disable when editing
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="defaultValue">Default Value</Label>
                    {String(formData.dataType).toUpperCase() === "OBJECT" ? (
                      <Textarea
                        id="defaultValue"
                        value={
                          formData.defaultValue == null
                            ? ""
                            : typeof formData.defaultValue === "string"
                            ? formData.defaultValue
                            : JSON.stringify(formData.defaultValue, null, 2)
                        }
                        onChange={(e) => {
                          try {
                            const parsed = e.target.value.trim()
                              ? JSON.parse(e.target.value)
                              : null;
                            setFormData({
                              ...formData,
                              defaultValue: parsed,
                            });
                          } catch {
                            // If JSON is invalid, store as string for now
                            setFormData({
                              ...formData,
                              defaultValue: e.target.value,
                            });
                          }
                        }}
                        placeholder="Enter JSON object for default value"
                        className="font-mono text-sm"
                        rows={4}
                      />
                    ) : (
                      <Input
                        id="defaultValue"
                        value={
                          typeof formData.defaultValue === "string"
                            ? formData.defaultValue
                            : ""
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            defaultValue: e.target.value || "",
                          })
                        }
                        placeholder="Optional default value"
                        className=""
                      />
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="compliance" className="space-y-4">
              <div className="space-y-3">
                {/* tags section */}
                <Label>Compliance Tags</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.complianceTags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center space-x-1"
                    >
                      <span>{tag}</span>
                      {!attribute && (
                        <button onClick={() => handleRemoveTag(tag)}>
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
                {!attribute && (
                  <>
                    <div className="flex space-x-2 mt-2">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add compliance tag"
                        onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                      />
                      <Button variant="outline" onClick={handleAddTag}>
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {predefinedTags.map((tag) => (
                        <Button
                          key={tag}
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (!formData.complianceTags.includes(tag)) {
                              setFormData({
                                ...formData,
                                complianceTags: [
                                  ...formData.complianceTags,
                                  tag,
                                ],
                              });
                            }
                          }}
                          className="text-xs"
                        >
                          + {tag}
                        </Button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center space-x-2"
            >
              {isSaving && <Loader className="h-4 w-4 animate-spin" />}
              <span>
                {isSaving
                  ? attribute
                    ? "Updating..."
                    : "Creating..."
                  : (attribute ? "Update" : "Create") + " Attribute"}
              </span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <SchemaConfirmationDialog
        open={showConfirmation}
        onOpenChange={setShowConfirmation}
        onConfirm={handleConfirmSave}
        title={
          attribute ? "Confirm Attribute Update" : "Confirm Attribute Creation"
        }
        description={`You are about to ${
          attribute ? "update" : "create"
        } an attribute in the ${entityType} schema. This action cannot be easily undone and may require significant system resources.`}
        actionType={attribute ? "update" : "create"}
        entityType={entityType}
        attributeName={formData.displayName || "New Attribute"}
        identitiesAffected={0} // This could be calculated based on tenant statistics
        isLoading={isSaving}
      />
    </>
  );
};
