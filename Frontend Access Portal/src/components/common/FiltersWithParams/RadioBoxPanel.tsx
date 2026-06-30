import React from "react";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FilterOptionGroup } from "@/types/filters";
interface RadioBoxPanelProps {
  filter: FilterOptionGroup;
  defaultValue?: string; // Optional prop for default checked value
}

export default function RadioBoxPanel({
  filter,
  defaultValue,
}: RadioBoxPanelProps) {
  return (
    <RadioGroup name={filter.key} defaultValue={defaultValue}>
      {filter.options.map((option) => (
        <div key={option.value} className="flex items-center space-x-2">
          <RadioGroupItem value={option.value} id={option.value} />
          <label htmlFor={option.value} className="text-sm">
            {option.label}
          </label>
        </div>
      ))}
    </RadioGroup>
  );
}
