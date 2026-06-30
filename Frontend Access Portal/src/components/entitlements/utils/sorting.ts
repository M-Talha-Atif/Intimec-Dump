import type { SortConfig } from "../types/table";

export const createSortHandler = (
  sortConfig: SortConfig,
  onSort: (config: SortConfig) => void
) => {
  return (key: string) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    onSort({ key, direction });
  };
};
