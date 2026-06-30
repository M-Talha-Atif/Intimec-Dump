import React from "react";
import { Button } from "@/components/ui/button";

import { ChevronDown, ChevronUp } from "lucide-react";
import { CollapsibleTrigger } from "@/components/ui/collapsible";
import { SystemAttributeMapping } from "../../types/index";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMappingContext } from "../../context/MappingContext";
import { TARGET_ATTRIBUTES_BY_TYPE } from "../../data/constants";

interface MappingHeaderProps {
  mapping: SystemAttributeMapping;
  onFieldChange: <T extends keyof SystemAttributeMapping>(
    field: T,
    value: SystemAttributeMapping[T]
  ) => void;
  /** Preferred: update multiple fields atomically in one state update */
  onBatchChange: (updates: Partial<SystemAttributeMapping>) => void;
}

export const MappingHeader: React.FC<MappingHeaderProps> = ({
  mapping,
  onFieldChange,
  onBatchChange,
}) => {
  const { entityFields, isLoadingEntityFields } = useMappingContext();

  // Build the raw option list from entity fields or the static fallback.
  const rawOptions: { value: string; label: string }[] =
    entityFields.length > 0
      ? entityFields.map((field) => ({
          value: field.systemKey,   // use systemKey as value to match what DB stores
          label: field.displayName, // show human-readable label
        }))
      : (TARGET_ATTRIBUTES_BY_TYPE[mapping.identityType] ?? []).map((attr) => ({
          value: attr,
          label: attr,
        }));

  // If the stored value is not in the options list (e.g. legacy / unmapped attribute),
  // inject it as the first option so the Select can display it instead of showing
  // an empty placeholder.  Guard against empty-string values which Radix treats as
  // "no selection" and would itself appear as a broken item.
  const currentValue = mapping.systemAttributeName;
  const seedOptions =
    currentValue && !rawOptions.some((opt) => opt.value === currentValue)
      ? [{ value: currentValue, label: currentValue }, ...rawOptions]
      : rawOptions;

  // Deduplicate by value — coreAttributes + extendedAttributes from the API can
  // occasionally share the same systemKey, which would produce duplicate keys and
  // trigger React's "unique key" warning inside SelectContent (Primitive.div).
  const seen = new Set<string>();
  const selectOptions = seedOptions.filter(({ value }) => {
    if (!value || seen.has(value)) return false;
    seen.add(value);
    return true;
  });

  return (
    <div className="flex items-center space-x-3">
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm">
          {mapping.isCollapsed ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronUp className="h-4 w-4" />
          )}
        </Button>
      </CollapsibleTrigger>

      {/* System Attribute Dropdown */}
      <div className="flex-1">
        <label className="text-xs text-slate-600 block mb-1">
          System Attribute
        </label>
        <Select
          value={mapping.systemAttributeName}
          onValueChange={(value) => {
            const selectedField = entityFields.find(
              (field) => field.systemKey === value
            );
            // Use a single atomic batch update so both fields change in one
            // setSystemMappings call, avoiding any intermediate render where
            // systemAttributeId and systemAttributeName are out of sync.
            onBatchChange({
              systemAttributeId: selectedField ? selectedField.systemKey : value,
              systemAttributeName: selectedField ? selectedField.systemKey : value,
            });
          }}
          disabled={isLoadingEntityFields}
        >
          <SelectTrigger className="h-8">
            <SelectValue
              placeholder={
                isLoadingEntityFields ? "Loading..." : "Select system attribute"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {selectOptions.map((opt) => (
              // Key MUST be the value only (not index-based) so Radix Select
              // can reuse the same item registration when options reload
              // (e.g. after entityFields fetch), preventing the
              // "all options selected" visual corruption.
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* TODO: Update ValidationBadge to work with SystemAttributeMapping */}
      {/* <ValidationBadge mapping={mapping} /> */}
    </div>
  );
};
