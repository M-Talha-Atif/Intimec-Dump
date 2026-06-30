import React from "react";
import { Badge } from "@/components/ui/badge";
import { useUserAssignmentContext } from "../contexts/UserAssignmentContext";

export const SelectedUsersSummary: React.FC = () => {
  const { selectedUsers, apiUsers } = useUserAssignmentContext();

  if (selectedUsers.length === 0) {
    return null;
  }

  return (
    <div className="bg-muted/50 rounded-lg p-3">
      <h4 className="font-medium text-sm mb-2">
        Selected Users ({selectedUsers.length})
      </h4>
      <div className="flex flex-wrap gap-1">
        {selectedUsers.slice(0, 5).map((userId) => {
          const user = apiUsers.find((u) => u.id === userId);
          return user ? (
            <Badge key={userId} variant="secondary" className="text-xs">
              {user.username}
            </Badge>
          ) : null;
        })}
        {selectedUsers.length > 5 && (
          <Badge variant="outline" className="text-xs">
            +{selectedUsers.length - 5} more
          </Badge>
        )}
      </div>
    </div>
  );
};
