import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

import { SystemAttributeMapping, SourceMapping } from "../../types/index";
import { SourceMappingRow } from "./SourceMappingRow";
import { useMappingContext } from "../../context/MappingContext";

interface MappingFormFieldsProps {
  mapping: SystemAttributeMapping;
  onFieldChange: <T extends keyof SystemAttributeMapping>(
    field: T,
    value: SystemAttributeMapping[T]
  ) => void;
}

export const MappingFormFields: React.FC<MappingFormFieldsProps> = ({
  mapping,
  onFieldChange,
}) => {
  const { sources } = useMappingContext();
  const knownSourceIds = new Set(sources.map((s) => s.id));

  const handleSourceMappingChange = (
    index: number,
    updates: Partial<SourceMapping>
  ) => {
    const updatedMappings = [...mapping.mappings];
    updatedMappings[index] = { ...updatedMappings[index], ...updates };
    onFieldChange("mappings", updatedMappings);
  };

  const handleRemoveSourceMapping = (index: number) => {
    const updatedMappings = mapping.mappings.filter((_, i) => i !== index);
    onFieldChange("mappings", updatedMappings);
  };

  const handleAddSourceMapping = () => {
    const newSourceMapping: SourceMapping = {
      resourceId: "",
      sourceAttributeName: "",
      transformation: "direct",
    };
    const updatedMappings = [...mapping.mappings, newSourceMapping];
    onFieldChange("mappings", updatedMappings);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700">Source Mappings</h4>
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddSourceMapping}
          className="h-8"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Source
        </Button>
      </div>

      <div className="space-y-3">
        {mapping.mappings.map((sourceMapping, index) => {
          // Hide rows that reference an app no longer in the known sources list
          // (e.g. soft-deleted / decommissioned apps). New unsaved rows have an
          // empty resourceId and must always be shown.
          if (
            sourceMapping.resourceId &&
            !knownSourceIds.has(sourceMapping.resourceId)
          ) {
            return null;
          }
          return (
            <SourceMappingRow
              key={`${mapping.id ?? mapping.systemAttributeName}-${index}`}
              sourceMapping={sourceMapping}
              index={index}
              identityType={mapping.identityType}
              onSourceMappingChange={handleSourceMappingChange}
              onRemoveSourceMapping={handleRemoveSourceMapping}
              canRemove={mapping.mappings.length >= 1}
            />
          );
        })}
      </div>

      {mapping.mappings.length === 0 && (
        <div className="text-center py-6 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-sm">No source mappings configured</p>
          <p className="text-xs mt-1">
            Click &ldquo;Add Source&rdquo; to create a mapping
          </p>
        </div>
      )}
    </div>
  );
};
