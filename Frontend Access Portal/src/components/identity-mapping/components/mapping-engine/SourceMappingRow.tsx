import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
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
import ScriptEditor from "@/components/script-editor/ScriptEditor";
import { ScriptEditorContent } from "@/components/script-editor/schema";

import { SourceMapping, IdentityType, ScriptType } from "../../types/index";
import { useMappingContext } from "../../context/MappingContext";
import { TRANSFORMATIONS } from "../../data/constants";

interface SourceMappingRowProps {
  sourceMapping: SourceMapping;
  index: number;
  identityType: IdentityType;
  onSourceMappingChange: (
    index: number,
    updates: Partial<SourceMapping>
  ) => void;
  onRemoveSourceMapping: (index: number) => void;
  canRemove: boolean;
}

export const SourceMappingRow: React.FC<SourceMappingRowProps> = ({
  sourceMapping,
  index,
  onSourceMappingChange,
  onRemoveSourceMapping,
  canRemove,
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const {
    sourceAttributes,
    isLoadingSourceAttributes,
    sourceAttributesError,
    fetchSourceAttributesForSource,
    sources,
  } = useMappingContext();

  // Fetch source attributes when resourceId changes (only if not already loaded or loading)
  useEffect(() => {
    if (
      sourceMapping.resourceId &&
      !sourceAttributes[sourceMapping.resourceId] &&
      !isLoadingSourceAttributes[sourceMapping.resourceId]
    ) {
      fetchSourceAttributesForSource(sourceMapping.resourceId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceMapping.resourceId]);

  // Get available source attributes for the current source
  const getSourceAttributes = () => {
    if (
      sourceMapping.resourceId &&
      sourceAttributes[sourceMapping.resourceId]
    ) {
      return sourceAttributes[sourceMapping.resourceId].map(
        (attr) => attr.nativeAttributeName
      );
    }
    return [];
  };

  const isLoadingCurrentSourceAttributes = sourceMapping.resourceId
    ? isLoadingSourceAttributes[sourceMapping.resourceId] || false
    : false;
  const currentSourceAttributesError = sourceMapping.resourceId
    ? sourceAttributesError[sourceMapping.resourceId]
    : null;

  const handleScriptChange = (value: string) => {
    onSourceMappingChange(index, {
      script: {
        type: sourceMapping.script?.type || "JAVASCRIPT",
        content: value,
      },
    });
  };

  const handleLangChange = (lang: ScriptEditorContent["lang"]) => {
    // Map ScriptEditor language to script type
    const scriptTypeMap: Record<ScriptEditorContent["lang"], ScriptType> = {
      typescript: "JAVASCRIPT",
      python: "JAVASCRIPT", // Map to JAVASCRIPT as PYTHON is not in ScriptType
      shell: "JAVASCRIPT", // Map to JAVASCRIPT as SHELL is not in ScriptType
      groovy: "GROOVY",
      beanshell: "BEANSHELL",
    };

    onSourceMappingChange(index, {
      script: {
        type: scriptTypeMap[lang],
        content: sourceMapping.script?.content || "",
      },
    });
  };

  // Map script type to ScriptEditor language
  const getEditorLanguage = (): ScriptEditorContent["lang"] => {
    const langMap: Record<ScriptType, ScriptEditorContent["lang"]> = {
      JAVASCRIPT: "typescript",
      GROOVY: "groovy",
      BEANSHELL: "beanshell",
    };

    return langMap[sourceMapping.script?.type || "JAVASCRIPT"] || "typescript";
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDeletion = () => {
    onRemoveSourceMapping(index);
    setIsDeleteDialogOpen(false);
  };

  // Get the source name for display in the dialog
  const sourceName =
    sources.find((s) => s.id === sourceMapping.resourceId)?.name ||
    "Unknown Source";

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-3 border rounded-lg bg-gray-50">
        {/* Source */}
        <div className="md:col-span-3">
          <Label className="text-xs text-slate-600">Source Application</Label>
          <Select
            value={sourceMapping.resourceId}
            onValueChange={(value) =>
              onSourceMappingChange(index, { resourceId: value })
            }
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              {sources.filter((source) => !!source.id).map((source) => (
                <SelectItem key={source.id} value={source.id}>
                  {source.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Source Attribute */}
        <div className="md:col-span-4">
          <Label className="text-xs text-slate-600">
            Source application Attribute
          </Label>
          <Select
            value={sourceMapping.sourceAttributeName}
            onValueChange={(value) =>
              onSourceMappingChange(index, { sourceAttributeName: value })
            }
            disabled={
              !sourceMapping.resourceId || isLoadingCurrentSourceAttributes
            }
          >
            <SelectTrigger className="h-8">
              <SelectValue
                placeholder={
                  isLoadingCurrentSourceAttributes
                    ? "Loading attributes..."
                    : currentSourceAttributesError
                    ? "Error loading attributes"
                    : "Select source attribute"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {getSourceAttributes().filter((attribute) => !!attribute).map((attribute) => (
                <SelectItem key={attribute} value={attribute}>
                  {attribute}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {currentSourceAttributesError && (
            <p className="text-xs text-red-500 mt-1">
              {currentSourceAttributesError}
            </p>
          )}
        </div>

        {/* Transformation */}
        <div className="md:col-span-4">
          <Label className="text-xs text-slate-600">Transformation</Label>
          <Select
            value={sourceMapping.transformation}
            onValueChange={(value) =>
              onSourceMappingChange(index, { transformation: value })
            }
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Select transformation" />
            </SelectTrigger>
            <SelectContent>
              {TRANSFORMATIONS.map((transform) => (
                <SelectItem key={transform} value={transform}>
                  {transform}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Remove Button */}
        <div className="md:col-span-1 flex justify-end">
          {canRemove && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteClick}
              className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Transformation Script Editor */}
      {sourceMapping.transformation === "script" && (
        <div className="ml-3 mr-3 border rounded-lg p-4 bg-gray-50">
          <Label className="text-sm font-medium text-slate-700 mb-2 block">
            Script Editor
          </Label>
          <ScriptEditor
            scriptValue={sourceMapping.script?.content || ""}
            onScriptChange={handleScriptChange}
            lang={getEditorLanguage()}
            onLangChange={handleLangChange}
            className="h-[300px]"
          />
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Source Mapping</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the source mapping from &quot;
              {sourceName}&quot;
              {sourceMapping.sourceAttributeName &&
                ` for attribute "${sourceMapping.sourceAttributeName}"`}
              ? This action cannot be undone and will remove this source from
              the mapping configuration.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeletion}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Source Mapping
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
