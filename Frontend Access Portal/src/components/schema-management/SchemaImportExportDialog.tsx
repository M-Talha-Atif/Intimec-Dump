import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Download,
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useSchemaManagement } from "@/contexts/schema-management-context";
import {
  ExportOptions,
  ValidationResults,
  ExportFormat,
  prepareAttributesData,
  createExportData,
  generateFilename,
  createCSVBlob,
  createXLSXBlob,
  createXMLBlob,
  createJSONBlob,
  downloadFile,
  parseImportFile,
  validateImportData,
  validateSchemaAttributes,
} from "./helpers";

interface SchemaImportExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType: string;
}

export const SchemaImportExportDialog = ({
  open,
  onOpenChange,
  entityType,
}: SchemaImportExportDialogProps) => {
  const { getCurrentEntityData, getEntityDisplayName } = useSchemaManagement();
  const [activeTab, setActiveTab] = useState("export");
  const [exportFormat, setExportFormat] = useState<ExportFormat>("json");
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    includeMetadata: true,
    includeVersionHistory: false,
    includeComplianceTags: true,
    includeMultiLang: true,
  });
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [validationResults, setValidationResults] =
    useState<ValidationResults | null>(null);

  // Clear import state when dialog closes or entity changes
  const clearImportState = () => {
    setImportFile(null);
    setImportPreview(null);
    setValidationResults(null);
  };

  // Handle dialog close with cleanup
  const handleDialogClose = (open: boolean) => {
    if (!open) {
      clearImportState();
    }
    onOpenChange(open);
  };

  // Clear import state when entity type changes
  useEffect(() => {
    clearImportState();
  }, [entityType]);

  const handleExport = () => {
    const currentEntityData = getCurrentEntityData();
    const entityDisplayName = getEntityDisplayName(entityType);

    console.log("Exporting schema:", {
      entityType,
      format: exportFormat,
      options: exportOptions,
    });

    // Get actual data from context
    const attributes = currentEntityData?.attributes || [];

    // Prepare attributes data using helper
    const attributesData = prepareAttributesData(attributes, exportOptions);

    // Create export data using helper
    const exportData = createExportData(
      attributes,
      attributesData,
      exportOptions,
      entityDisplayName,
      entityType,
      currentEntityData
    );

    // Generate filename using helper
    const filename = generateFilename(entityDisplayName, exportFormat);

    // Create blob based on format using helpers
    let blob: Blob;
    switch (exportFormat) {
      case "csv":
        blob = createCSVBlob(attributes);
        break;
      case "xlsx":
        blob = createXLSXBlob(attributes);
        break;
      case "xml":
        blob = createXMLBlob(
          attributes,
          exportOptions,
          entityDisplayName,
          entityType
        );
        break;
      default: // JSON
        blob = createJSONBlob(exportData);
    }

    // Download file using helper
    downloadFile(blob, filename);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFile(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const entityDisplayName = getEntityDisplayName(entityType);

          // Parse import file using helper
          const data = parseImportFile(
            content,
            file.name,
            entityDisplayName,
            entityType
          );
          setImportPreview(data);

          // Validate import data using helper
          const currentEntityData = getCurrentEntityData();
          const validationResults = validateImportData(
            data,
            currentEntityData?.attributes
          );
          setValidationResults(validationResults);
        } catch (error) {
          setValidationResults({
            valid: false,
            errors: [
              error instanceof Error ? error.message : "Failed to parse file",
            ],
          });
        }
      };
      reader.readAsText(file);
    }
  };

  const handleImport = () => {
    if (!importFile || !importPreview) return;

    console.log("Importing schema:", {
      entityType,
      file: importFile.name,
      data: importPreview,
    });
    // Here you would implement the actual import logic
    handleDialogClose(false);
  };

  const handleValidateSchema = () => {
    const currentEntityData = getCurrentEntityData();

    console.log("Validating schema for entity:", entityType);

    const attributes = currentEntityData?.attributes || [];

    // Use validation helper function
    const validationResults = validateSchemaAttributes(attributes);
    setValidationResults(validationResults);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Schema Import/Export - {getEntityDisplayName(entityType)}
          </DialogTitle>
          <DialogDescription>
            Export schema to file or import schema from external source for{" "}
            {getEntityDisplayName(entityType)}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="export">Export Schema</TabsTrigger>
            <TabsTrigger value="import">Import Schema</TabsTrigger>
            <TabsTrigger value="validate">Validate Schema</TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>Export Configuration</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="exportFormat">Export Format</Label>
                    <Select
                      value={exportFormat}
                      onValueChange={(value) =>
                        setExportFormat(value as ExportFormat)
                      }
                    >
                      <SelectTrigger id="exportFormat">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="json">JSON</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                        <SelectItem value="xml">XML</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Export Options</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Export Format</span>
                      <Select
                        value={exportOptions.includeMetadata ? "full" : "array"}
                        onValueChange={(value) =>
                          setExportOptions({
                            ...exportOptions,
                            includeMetadata: value === "full",
                          })
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="array">Array Only</SelectItem>
                          <SelectItem value="full">Full Schema</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {exportOptions.includeMetadata && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">
                            Include Version History
                          </span>
                          <Switch
                            checked={exportOptions.includeVersionHistory}
                            onCheckedChange={(checked) =>
                              setExportOptions({
                                ...exportOptions,
                                includeVersionHistory: checked,
                              })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">
                            Include Compliance Tags
                          </span>
                          <Switch
                            checked={exportOptions.includeComplianceTags}
                            onCheckedChange={(checked) =>
                              setExportOptions({
                                ...exportOptions,
                                includeComplianceTags: checked,
                              })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">
                            Include Multi-Language Labels
                          </span>
                          <Switch
                            checked={exportOptions.includeMultiLang}
                            onCheckedChange={(checked) =>
                              setExportOptions({
                                ...exportOptions,
                                includeMultiLang: checked,
                              })
                            }
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Schema Summary */}
                <div className="p-3 bg-muted/50 rounded-lg">
                  <h4 className="text-sm font-medium mb-2">
                    Current Schema Summary
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      Total Attributes:{" "}
                      {getCurrentEntityData()?.attributes?.length || 0}
                    </div>
                    <div>
                      Required:{" "}
                      {getCurrentEntityData()?.attributes?.filter(
                        (attr) => attr.isRequired
                      ).length || 0}
                    </div>
                    <div>
                      Sensitive:{" "}
                      {getCurrentEntityData()?.attributes?.filter(
                        (attr) => attr.isSensitive
                      ).length || 0}
                    </div>
                    <div>
                      Custom:{" "}
                      {getCurrentEntityData()?.attributes?.filter(
                        (attr) => attr.category === "Custom"
                      ).length || 0}
                    </div>
                  </div>
                </div>

                <Button onClick={handleExport} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Export Schema
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="import" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="h-4 w-4" />
                  <span>Import Schema</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="importFile">Select Schema File</Label>
                  <Input
                    id="importFile"
                    type="file"
                    accept=".json,.csv,.xlsx,.xml"
                    onChange={handleFileUpload}
                    value="" // Always empty to allow re-selecting same file
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Supported formats: JSON, CSV, Excel, XML
                  </p>
                </div>

                {importFile && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">{importFile.name}</span>
                        <Badge variant="secondary">
                          {(importFile.size / 1024).toFixed(1)} KB
                        </Badge>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearImportState}
                        className="text-xs"
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                )}

                {validationResults && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center space-x-2">
                        {validationResults.valid ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span>Validation Results</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {validationResults.attributeCount && (
                        <div className="text-sm">
                          <strong>Attributes found:</strong>{" "}
                          {validationResults.attributeCount}
                        </div>
                      )}

                      {validationResults.warnings &&
                        validationResults.warnings.length > 0 && (
                          <div>
                            <div className="text-sm font-medium text-yellow-600 mb-1">
                              Warnings:
                            </div>
                            <ul className="text-sm text-yellow-700 space-y-1">
                              {validationResults.warnings.map(
                                (warning: string, index: number) => (
                                  <li key={index}>• {warning}</li>
                                )
                              )}
                            </ul>
                          </div>
                        )}

                      {validationResults.errors &&
                        validationResults.errors.length > 0 && (
                          <div>
                            <div className="text-sm font-medium text-red-600 mb-1">
                              Errors:
                            </div>
                            <ul className="text-sm text-red-700 space-y-1">
                              {validationResults.errors.map(
                                (error: string, index: number) => (
                                  <li key={index}>• {error}</li>
                                )
                              )}
                            </ul>
                          </div>
                        )}
                    </CardContent>
                  </Card>
                )}

                <Button
                  onClick={handleImport}
                  disabled={!importFile || !validationResults?.valid}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import Schema
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="validate" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Schema Validation</CardTitle>
                <CardDescription>
                  Validate the current schema for consistency and compliance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={handleValidateSchema} className="w-full">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Validate Current Schema
                </Button>

                {validationResults && (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      {validationResults.valid ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-600" />
                      )}
                      <span className="font-medium">
                        {validationResults.valid
                          ? "Schema is valid"
                          : "Schema has issues"}
                      </span>
                    </div>

                    {validationResults.attributeCount && (
                      <div className="text-sm text-gray-600">
                        Total attributes: {validationResults.attributeCount}
                      </div>
                    )}

                    {validationResults.warnings &&
                      validationResults.warnings.length > 0 && (
                        <div className="p-3 bg-yellow-50 rounded-lg">
                          <div className="font-medium text-yellow-800 mb-2">
                            Warnings
                          </div>
                          <ul className="text-sm text-yellow-700 space-y-1">
                            {validationResults.warnings.map(
                              (warning: string, index: number) => (
                                <li key={index}>• {warning}</li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={() => handleDialogClose(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
