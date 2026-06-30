// Represents an individual filter option
interface FilterOptionItem {
  label: string;
  value: string;
}

// Represents a filter category (e.g., "Status", "Risk Level")
export interface FilterOptionGroup {
  title: string;
  type: "checkbox" | "radio";
  key: string; // Unique key for the filter group, used for normalization
  options: FilterOptionItem[];
  defaultValue: string | null; // Default selected value for radio type
}

export type NormalizedFilterState = Record<string, string[]>;
