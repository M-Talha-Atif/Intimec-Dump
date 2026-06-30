import React from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { FilterOptionGroup } from "@/types/filters";

interface CheckboxPanelProps {
  filter: FilterOptionGroup;
  defaultValues?: string[]; // Optional prop for default checked values
}

export default function CheckboxPanel({
  filter,
  defaultValues,
}: CheckboxPanelProps) {
  return (
    <div className="space-y-2">
      {filter.options.map((option) => (
        <div key={option.value} className="flex items-center space-x-2">
          <Checkbox
            className="border-1 border-slate-400 hover:border-slate-400 tex "
            value={option.value}
            id={option.value}
            name={filter.key} // Ensure the checkbox is grouped by filter key
            defaultChecked={defaultValues?.includes(option.value) || false}
          />
          <label htmlFor={option.value} className="text-sm">
            {option.label}
          </label>
        </div>
      ))}
    </div>
  );
}
