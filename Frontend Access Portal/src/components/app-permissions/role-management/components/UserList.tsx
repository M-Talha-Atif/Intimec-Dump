import React, { useMemo } from "react";
import { Users } from "lucide-react";
import { UserItem } from "./UserItem";
import { useUserAssignmentContext } from "../contexts/UserAssignmentContext";

interface UserListProps {
  filterByHasRole?: boolean;
  disableIfHasRole?: boolean;
}

export const UserList: React.FC<UserListProps> = ({
  filterByHasRole = false,
  disableIfHasRole = false,
}) => {
  const { filteredUsers, apiUsers } = useUserAssignmentContext();

  // Filter users based on hasRole if needed
  const displayUsers = useMemo(() => {
    if (!filterByHasRole) {
      return filteredUsers;
    }

    // Only show users who have the role
    return filteredUsers.filter((user) => {
      const apiUser = apiUsers.find((apiU) => apiU.id === user.id);
      return apiUser?.hasRole === true;
    });
  }, [filteredUsers, filterByHasRole, apiUsers]);

  if (displayUsers.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>
          {filterByHasRole
            ? "No users with this role found"
            : "No users found matching your criteria"}
        </p>
      </div>
    );
  }

  return (
    <div className="max-h-96 overflow-y-auto space-y-1">
      {displayUsers.map((user) => (
        <UserItem
          key={user.id}
          user={user}
          disableIfHasRole={disableIfHasRole}
        />
      ))}
    </div>
  );
};
