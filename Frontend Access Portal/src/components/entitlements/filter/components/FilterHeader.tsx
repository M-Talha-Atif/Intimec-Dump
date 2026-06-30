import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface FilterHeaderProps {
  onClose: () => void;
}

export const FilterHeader = ({ onClose }: FilterHeaderProps) => {
  return (
    <div className="p-4 flex items-center justify-between">
      <h3 className="text-lg font-semibold text-slate-800">Advanced Filters</h3>
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        aria-label="Close filters"
      >
        <X className="h-5 w-5" />
      </Button>
    </div>
  );
};
