export interface Filters {
  ownership: string;
  governance: string[];
  requestable: string;
  classification: string[];
  entitlementType: string[];
}

export interface EntitlementsFilterPanelProps {
  onClose: () => void;
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
}

export interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
}

export interface RadioFilterSectionProps {
  title: string;
  value: string;
  options: { value: string; label: string; id: string }[];
  onValueChange: (value: string) => void;
}

export interface CheckboxFilterSectionProps {
  title: string;
  options: string[];
  selectedValues: string[];
  onValueChange: (checked: boolean, value: string) => void;
}
