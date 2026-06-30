import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { SystemAttributeMapping } from "../../types/index";
import { MappingHeader } from "./MappingHeader";
import { MappingFormFields } from "./MappingFormFields";
import { AdditionalConfiguration } from "./AdditionalConfiguration";
import { MappingActions } from "./MappingActions";

interface MappingCardProps {
  mapping: SystemAttributeMapping;
  onMappingChange: (
    id: string,
    updates: Partial<SystemAttributeMapping>
  ) => void;
  hasUnsavedChanges?: boolean;
}

export const MappingCard: React.FC<MappingCardProps> = ({
  mapping,
  onMappingChange,
  hasUnsavedChanges = false,
}) => {
  const handleSystemFieldChange = <T extends keyof SystemAttributeMapping>(
    field: T,
    value: SystemAttributeMapping[T]
  ) => {
    onMappingChange(mapping.id, { [field]: value });
  };

  const handleSystemBatchChange = (updates: Partial<SystemAttributeMapping>) => {
    onMappingChange(mapping.id, updates);
  };

  return (
    <Collapsible
      key={mapping.id}
      open={!mapping.isCollapsed}
      onOpenChange={() =>
        onMappingChange(mapping.id, { isCollapsed: !mapping.isCollapsed })
      }
    >
      <Card
        id={`mapping-${mapping.id}`}
        className="border-l-4 border-l-brand-teal transition-all duration-300"
      >
        <CardContent className="p-4">
          {hasUnsavedChanges && (
            <div className="mb-2 flex items-center gap-2">
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-semibold">
                Unsaved changes
              </span>
            </div>
          )}
          <div className="flex items-center justify-between mb-3">
            <MappingHeader
              mapping={mapping}
              onFieldChange={handleSystemFieldChange}
              onBatchChange={handleSystemBatchChange}
            />
            {/* TODO: Update MappingActions to work with SystemAttributeMapping */}
            <MappingActions mapping={mapping} />
          </div>

          <CollapsibleContent className="space-y-4">
            <MappingFormFields
              mapping={mapping}
              onFieldChange={handleSystemFieldChange}
            />

            {/* TODO: Add AdditionalConfiguration for SystemAttributeMapping */}
            <AdditionalConfiguration
              mapping={mapping}
              onFieldChange={handleSystemFieldChange}
            />
          </CollapsibleContent>
        </CardContent>
      </Card>
    </Collapsible>
  );
};
