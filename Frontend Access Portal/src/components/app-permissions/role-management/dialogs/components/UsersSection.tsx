import React from "react";
import { useCreateRoleContext } from "../contexts/CreateRoleContext";
import OwnerSelector from "@/components/applications/add-application/common/OwnerSelector";

export const UsersSection: React.FC = () => {
  const { allUsers, isLoadingUsers, usersError, ownerIds, setOwnerIds } =
    useCreateRoleContext();
  const selectedUsers = allUsers.filter((user) => ownerIds.includes(user.id));

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium">Assign Owners</h3>
        <p className="text-sm text-muted-foreground">
          Select owners to assign to this role
        </p>
      </div>

      <OwnerSelector
        value={selectedUsers}
        onChange={(users) => setOwnerIds(users.map((u) => u.id))}
        data={allUsers}
        isLoading={isLoadingUsers}
        error={usersError ? new Error(usersError) : null}
        title="Select Owners for Role"
        description="Choose owners to assign to this role"
        buttonText="Choose owners"
        showNamesInButton={false}
      />

      {selectedUsers.length > 0 && (
        <div className="p-3 rounded-md bg-muted max-h-40 overflow-y-auto">
          <p className="text-sm font-medium">
            Selected {selectedUsers.length} user(s):
          </p>
          <ul className="mt-2 space-y-1">
            {selectedUsers.map((user) => (
              <li
                key={user.id}
                className="text-sm text-muted-foreground break-words"
              >
                • {user.displayName || `${user.firstName} ${user.lastName}`} (
                {user.email})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
