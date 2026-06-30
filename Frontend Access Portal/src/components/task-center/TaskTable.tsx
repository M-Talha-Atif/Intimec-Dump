import React from "react";
import { Table, TableBody } from "@/components/ui/table";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Task } from "@/services/responsibilities";
import { TaskTableHeader } from "./components/TaskTableHeader";
import { TaskTableRow } from "./components/TaskTableRow";
import CustomPagination from "@/components/applications/common/CustomPagination";

interface TaskTableProps {
  tasks: Task[];
  selectedTasks: string[];
  onTaskSelect: (taskId: string) => void;
  onApprove: (taskId: string) => void;
  onReject: (taskId: string) => void;
  onSelectionChange: (selectedTasks: string[]) => void;
  selectedTaskId?: string;
  approveMutationPending?: boolean;
  rejectMutationPending?: boolean;
  // Pagination props
  totalElements?: number;
  totalPages?: number;
  page?: number;
  size?: number;
  onPageChange?: (page: number) => void;
  onSizeChange?: (size: number) => void;
}

export const TaskTable: React.FC<TaskTableProps> = ({
  tasks,
  selectedTasks,
  onTaskSelect,
  onApprove,
  onReject,
  onSelectionChange,
  selectedTaskId,
  approveMutationPending = false,
  rejectMutationPending = false,
  totalElements,
  totalPages,
  page,
  size,
  onPageChange,
  onSizeChange,
}) => {
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(tasks.map((task) => task.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectTask = (taskId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedTasks, taskId]);
    } else {
      onSelectionChange(selectedTasks.filter((id) => id !== taskId));
    }
  };

  const allSelected = tasks.length > 0 && selectedTasks.length === tasks.length;
  const someSelected =
    selectedTasks.length > 0 && selectedTasks.length < tasks.length;

  return (
    <TooltipProvider>
      <div className="border rounded-lg bg-background">
        <Table>
          <TaskTableHeader
            allSelected={allSelected}
            someSelected={someSelected}
            onSelectAll={handleSelectAll}
          />
          <TableBody>
            {tasks.map((task) => (
              <TaskTableRow
                key={task.id}
                task={task}
                isSelected={selectedTasks.includes(task.id)}
                selectedTaskId={selectedTaskId}
                onSelect={onTaskSelect}
                onToggleSelection={handleSelectTask}
                onApprove={onApprove}
                onReject={onReject}
                approveMutationPending={approveMutationPending}
                rejectMutationPending={rejectMutationPending}
              />
            ))}
          </TableBody>
        </Table>

        {tasks.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No tasks found matching the current filters.
          </div>
        )}

        {tasks.length > 0 && totalPages !== undefined && totalPages > 0 && (
          <CustomPagination
            totalElements={totalElements}
            totalPages={totalPages}
            page={page}
            size={size}
            useCallbackMode={true}
            onPageChange={onPageChange}
            onSizeChange={onSizeChange}
          />
        )}
      </div>
    </TooltipProvider>
  );
};
