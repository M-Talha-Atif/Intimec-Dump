
import { useState } from 'react';
import { TaskFiltersState } from '../utils/taskHelpers';

interface UseTaskFiltersProps {
  onFilterChange: (filters: TaskFiltersState) => void;
  onSearchChange?: (searchTerm: string) => void;
}

export const useTaskFilters = ({ onFilterChange, onSearchChange }: UseTaskFiltersProps) => {
  const [filters, setFilters] = useState<TaskFiltersState>({});
  const [searchTerm, setSearchTerm] = useState('');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateFilter = (key: keyof TaskFiltersState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
    onFilterChange({});
    onSearchChange?.('');
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    onSearchChange?.(term);
  };

  const activeFilterCount = Object.values(filters).filter(v => 
    Array.isArray(v) ? v.length > 0 : Boolean(v)
  ).length + (searchTerm ? 1 : 0);

  return {
    filters,
    searchTerm,
    updateFilter,
    clearFilters,
    handleSearchChange,
    activeFilterCount
  };
};
