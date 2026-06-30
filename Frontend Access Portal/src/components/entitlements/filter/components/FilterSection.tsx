import { Label } from "@/components/ui/label";
import type { FilterSectionProps } from "../types";

export const FilterSection = ({ title, children }: FilterSectionProps) => {
  return (
    <div>
      <Label className="font-semibold text-slate-800">{title}</Label>
      <div className="mt-2 space-y-1">{children}</div>
    </div>
  );
};
