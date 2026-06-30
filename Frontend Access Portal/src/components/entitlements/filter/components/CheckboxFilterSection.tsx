import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FilterSection } from "./FilterSection";
import type { CheckboxFilterSectionProps } from "../types";

export const CheckboxFilterSection = ({
  title,
  options,
  selectedValues,
  onValueChange,
}: CheckboxFilterSectionProps) => {
  return (
    <FilterSection title={title}>
      <>
        {options.map((option) => (
          <div key={option} className="flex items-center space-x-2">
            <Checkbox
              id={`${title.toLowerCase().replace(/\s+/g, "-")}-${option
                .toLowerCase()
                .replace(/\s+/g, "-")}`}
              checked={selectedValues.includes(option)}
              onCheckedChange={(checked) => onValueChange(!!checked, option)}
            />
            <Label
              htmlFor={`${title.toLowerCase().replace(/\s+/g, "-")}-${option
                .toLowerCase()
                .replace(/\s+/g, "-")}`}
              className="font-normal"
            >
              {option}
            </Label>
          </div>
        ))}
      </>
    </FilterSection>
  );
};
