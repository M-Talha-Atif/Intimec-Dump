import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FilterSection } from "./FilterSection";
import type { RadioFilterSectionProps } from "../types";

export const RadioFilterSection = ({
  title,
  value,
  options,
  onValueChange,
}: RadioFilterSectionProps) => {
  return (
    <FilterSection title={title}>
      <RadioGroup value={value} onValueChange={onValueChange}>
        {options.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <RadioGroupItem value={option.value} id={option.id} />
            <Label htmlFor={option.id} className="font-normal">
              {option.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </FilterSection>
  );
};
