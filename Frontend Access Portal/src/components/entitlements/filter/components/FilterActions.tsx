import { Button } from "@/components/ui/button";
import type { Filters } from "../types";

interface FilterActionsProps {
  localFilters: Filters;
  onApplyFilters: (filters: Filters) => void;
  onClearFilters: () => void;
}

export const FilterActions = ({
  localFilters,
  onApplyFilters,
  onClearFilters,
}: FilterActionsProps) => {
  const handleApplyFilters = () => {
    onApplyFilters(localFilters);
  };

  return (
    <div className="p-4 mt-auto flex flex-col gap-2">
      <Button onClick={handleApplyFilters}>Apply Filters</Button>
      <Button variant="outline" onClick={onClearFilters}>
        Clear Filters
      </Button>
    </div>
  );
};
