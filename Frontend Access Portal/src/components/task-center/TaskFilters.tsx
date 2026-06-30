import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Filter } from "lucide-react";
import { Task } from "@/services/responsibilities";
import { TaskFiltersState } from "./utils/taskHelpers";
import { useTaskFilters } from "./hooks/useTaskFilters";
import { TaskFilterSearch } from "./components/TaskFilterSearch";
import { TaskFilterSelect } from "./components/TaskFilterSelect";
import { TaskActiveFilters } from "./components/TaskActiveFilters";

interface TaskFiltersProps {
  tasks: Task[];
  onFilterChange: (filters: TaskFiltersState) => void;
  onSearchChange?: (searchTerm: string) => void;
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  tasks,
  onFilterChange,
  onSearchChange,
}) => {
  const {
    filters,
    searchTerm,
    updateFilter,
    clearFilters,
    handleSearchChange,
    activeFilterCount,
  } = useTaskFilters({ onFilterChange, onSearchChange });

  // Filter tasks based on current filters
  const filterTasksLocal = (taskList: Task[]): Task[] => {
    return taskList.filter((task) => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          task.title?.toLowerCase().includes(searchLower) ||
          task.id?.toLowerCase().includes(searchLower) ||
          task.roleName?.toLowerCase().includes(searchLower) ||
          task.workflowName?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters.status && filters.status.length > 0) {
        if (!filters.status.includes(task.status)) return false;
      }

      // Type filter
      if (filters.type && filters.type.length > 0) {
        if (!filters.type.includes(task.type)) return false;
      }

      return true;
    });
  };

  const filteredTasks = filterTasksLocal(tasks);

  // Status options for responsibilities Task
  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "timeout", label: "Timed Out" },
    { value: "completed", label: "Completed" },
  ];

  // Type options for responsibilities Task
  const typeOptions = [
    { value: "role_approval", label: "Role Approval" },
    { value: "certification", label: "Certification" },
    { value: "workflow", label: "Workflow" },
    { value: "delegation", label: "Delegation" },
  ];

  // Get unique workflow names from tasks
  const workflowOptions = Array.from(
    new Set(tasks.map((t) => t.workflowName).filter(Boolean)),
  ).map((name) => ({ value: name as string, label: name as string }));

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount} active
              </Badge>
            )}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <TaskFilterSearch
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
        />

        {/* Filter Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <TaskFilterSelect
            label="Status"
            placeholder="All statuses"
            value={filters.status?.[0] || "all"}
            options={statusOptions}
            onValueChange={(value) =>
              updateFilter("status", value === "all" ? [] : [value])
            }
          />
          <TaskFilterSelect
            label="Type"
            placeholder="All types"
            value={filters.type?.[0] || "all"}
            options={typeOptions}
            onValueChange={(value) =>
              updateFilter("type", value === "all" ? [] : [value])
            }
          />
          {workflowOptions.length > 0 && (
            <TaskFilterSelect
              label="Workflow"
              placeholder="All workflows"
              value={"all"}
              options={workflowOptions}
              onValueChange={(value) => console.log("Workflow filter:", value)}
            />
          )}
        </div>

        {/* Results Summary and Active Filters */}
        <TaskActiveFilters
          filters={filters}
          searchTerm={searchTerm}
          activeCount={activeFilterCount}
          totalTasks={tasks.length}
          filteredCount={filteredTasks.length}
        />
      </CardContent>
    </Card>
  );
};
