import React from "react";
import { useEditRoleContext } from "../contexts/EditRoleContext";
import OwnerSelector from "@/components/applications/add-application/common/OwnerSelector";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";

export const EditUsersSection: React.FC = () => {
  const {
    allUsers,
    isLoadingUsers,
    usersError,
    ownerIds,
    setOwnerIds,
  } = useEditRoleContext();
  
  const selectedUsers = React.useMemo(() => {
    return allUsers.filter((user) => ownerIds.includes(user.id));
  }, [allUsers, ownerIds]);
  
  // Debug logging
  React.useEffect(() => {
    console.log('[EditUsersSection] State:', {
      allUsersCount: allUsers.length,
      ownerIds: ownerIds,
      ownerIdsCount: ownerIds.length,
      selectedUsersCount: selectedUsers.length,
      selectedUserIds: selectedUsers.map(u => u.id),
      isLoadingUsers,
    });
  }, [allUsers, ownerIds, selectedUsers, isLoadingUsers]);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium">Assign Owners</h3>
        <p className="text-sm text-muted-foreground">
          Select owners to assign to this role. This will replace all existing
          owners.
        </p>
      </div>

      {/* Show loading state */}
      {isLoadingUsers && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 border rounded-md">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading users and owners...</span>
        </div>
      )}

      {/* Show error */}
      {usersError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {usersError}. You can still select new owners manually.
          </AlertDescription>
        </Alert>
      )}

      <OwnerSelector
        key={`owner-selector-${ownerIds.join('-')}`}
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
