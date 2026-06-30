
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TaskFilterSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const TaskFilterSearch: React.FC<TaskFilterSearchProps> = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="search">Search</Label>
      <Input
        id="search"
        placeholder="Search tasks by name, ID, application..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  );
};
