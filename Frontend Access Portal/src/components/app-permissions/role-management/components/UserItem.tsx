import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mail, Building, Clock } from "lucide-react";
import { User } from "../data/mockUsers";
import { getInitials, formatLastLogin } from "../utils/userAssignmentUtils";
import { useUserAssignmentContext } from "../contexts/UserAssignmentContext";

interface UserItemProps {
  user: User;
  disableIfHasRole?: boolean;
}

export const UserItem: React.FC<UserItemProps> = ({
  user,
  disableIfHasRole = false,
}) => {
  const { selectedUsers, handleUserToggle, apiUsers } =
    useUserAssignmentContext();

  // Find the corresponding API user to check role status
  const apiUser = apiUsers.find((apiU) => apiU.id === user.id);
  const hasRole = apiUser?.hasRole || false;

  return (
    <div
      className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
        selectedUsers.includes(user.id)
          ? "bg-primary/5 border-primary/20"
          : "bg-background border-border hover:bg-muted/50"
      }`}
    >
      <Checkbox
        checked={selectedUsers.includes(user.id)}
        disabled={disableIfHasRole && hasRole}
        onCheckedChange={(checked) =>
          handleUserToggle(user.id, checked as boolean)
        }
      />

      <Avatar className="h-10 w-10">
        <AvatarFallback className="text-sm font-medium">
          {getInitials(user.name)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-sm truncate">{user.name}</h4>
          <Badge
            variant={user.status === "active" ? "default" : "secondary"}
            className="text-xs"
          >
            {user.status}
          </Badge>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
          <div className="flex items-center gap-1">
            <Mail className="h-3 w-3" />
            <span className="truncate">{user.email}</span>
          </div>
          {user.department && (
            <div className="flex items-center gap-1">
              <Building className="h-3 w-3" />
              <span>{user.department}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
          {user.title && <span className="font-medium">{user.title}</span>}
          {user.lastLogin && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Last login: {formatLastLogin(user.lastLogin)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
