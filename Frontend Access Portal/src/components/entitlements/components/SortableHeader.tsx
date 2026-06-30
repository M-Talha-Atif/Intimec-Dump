import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SortConfig } from "../types/table";

interface SortableHeaderProps {
  children: React.ReactNode;
  sortKey: string;
  sortConfig: SortConfig;
  onSort: (key: string) => void;
}

export const SortableHeader = ({
  children,
  sortKey,
  sortConfig,
  onSort,
}: SortableHeaderProps) => {
  const isSorted = sortConfig.key === sortKey;

  return (
    <Button variant="ghost" size="sm" onClick={() => onSort(sortKey)}>
      {children}
      <ArrowUpDown
        className={cn("ml-2 h-4 w-4", !isSorted && "text-muted-foreground/50")}
      />
    </Button>
  );
};
