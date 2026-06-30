import React from "react";
import { Button } from "@/components/ui/button";
import { useUserAssignmentContext } from "../contexts/UserAssignmentContext";

export const UserResultsSummary: React.FC = () => {
  const { filteredUsers, apiUsers, selectedUsers, handleSelectAll, usersData } =
    useUserAssignmentContext();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {filteredUsers.length} of {apiUsers.length} users
        </span>
        {filteredUsers.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSelectAll}
            className="h-auto p-1"
          >
            {selectedUsers.length === filteredUsers.length
              ? "Deselect All"
              : "Select All"}
          </Button>
        )}
      </div>

      {/* Show API data summary if available */}
      {usersData && (
        <div className="flex items-center gap-4 text-xs text-muted-foreground border rounded-md p-2 bg-muted/30">
          <span>Total: {usersData.totalCount}</span>
          <span>With Role: {usersData.usersWithRoleCount}</span>
          <span>Without Role: {usersData.usersWithoutRoleCount}</span>
        </div>
      )}
    </div>
  );
};
