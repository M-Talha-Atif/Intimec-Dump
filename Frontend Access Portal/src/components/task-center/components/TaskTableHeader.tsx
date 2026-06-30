import React from "react";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

interface TaskTableHeaderProps {
  allSelected: boolean;
  someSelected: boolean;
  onSelectAll: (checked: boolean) => void;
}

export const TaskTableHeader: React.FC<TaskTableHeaderProps> = ({
  allSelected,
  someSelected,
  onSelectAll,
}) => {
  return (
    <TableHeader className="sticky top-0 bg-background z-10">
      <TableRow>
        <TableHead className="w-12">
          <Checkbox
            checked={allSelected}
            onCheckedChange={onSelectAll}
            className={someSelected ? "data-[state=checked]:bg-blue-500" : ""}
          />
        </TableHead>
        <TableHead>Task ID</TableHead>
        <TableHead>Title</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Type</TableHead>
        <TableHead>Requested By</TableHead>
        <TableHead>Delegated To</TableHead>
        <TableHead>Approver Type</TableHead>
        <TableHead>Priority</TableHead>
        <TableHead>Due Date</TableHead>
        <TableHead>Created</TableHead>
        <TableHead>Responded At</TableHead>
        <TableHead>Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};
