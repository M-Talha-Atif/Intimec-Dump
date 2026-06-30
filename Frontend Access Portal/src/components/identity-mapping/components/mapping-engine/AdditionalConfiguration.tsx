import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SystemAttributeMapping } from "../../types/index";

interface AdditionalConfigurationProps {
  mapping: SystemAttributeMapping;
  onFieldChange: <T extends keyof SystemAttributeMapping>(
    field: T,
    value: SystemAttributeMapping[T]
  ) => void;
}

export const AdditionalConfiguration: React.FC<
  AdditionalConfigurationProps
> = ({ mapping, onFieldChange }) => {
  return (
    <div className="mt-4">
      <div>
        <Label className="text-xs text-slate-600">
          Fallback Value (Optional)
        </Label>
        <Input
          placeholder="Default value if source is empty"
          value={mapping.fallbackValue || ""}
          onChange={(e) => onFieldChange("fallbackValue", e.target.value)}
          className="h-8"
        />
      </div>
    </div>
  );
};
