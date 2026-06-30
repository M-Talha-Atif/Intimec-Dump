import React from "react";
import { Badge } from "@/components/ui/badge";
import { InternalRole } from "@/types/roleManagement";
import { shortDate } from "@/utils/dateFormat";
import { RolePermissionsPopover } from "./RolePermissionsPopover";
import { RoleMembersPopover } from "./RoleMembersPopover";

interface RoleCardContentProps {
  role: InternalRole;
}

export const RoleCardContent: React.FC<RoleCardContentProps> = ({ role }) => {
  return (
    <div className="mb-4">
      <div className="grid grid-cols-2 gap-6 mb-4">
        {/* Left column */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Permissions:</span>
              <RolePermissionsPopover
                roleId={role.id}
                permissionsCount={role.permissionsCount}
              >
                <span className="font-medium">{role.permissionsCount}</span>
              </RolePermissionsPopover>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Members:</span>
            <RoleMembersPopover roleId={role.id} userCount={role.userCount}>
              <span className="font-medium">{role.userCount}</span>
            </RoleMembersPopover>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Created By:</span>
            <Badge variant="outline" className="text-xs">
              {role.owner}
            </Badge>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Created:</span>
            <Badge variant="secondary" className="text-xs">
              {shortDate(role.created)}
            </Badge>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Last Modified:</span>
            <Badge variant="secondary" className="text-xs">
              {shortDate(role.lastModified)}
            </Badge>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-3">
          {role.tags && role.tags.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Tags:</p>
              <div className="flex flex-wrap gap-1">
                {role.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {role.scopes && role.scopes.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Used In:</p>
              <div className="flex flex-wrap gap-1">
                {role.scopes.map((scope) => (
                  <Badge key={scope} variant="outline" className="text-xs">
                    {scope}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {role.ownersData && role.ownersData.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Owners:</p>
              <div className="flex flex-wrap gap-1">
                {role.ownersData.map((owner) => (
                  <Badge key={owner.id} variant="outline" className="text-xs">
                    {owner.displayName ||
                      `${owner.firstName} ${owner.lastName}`}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Assignment Type Badges */}
      {(role.hasManualAssignments || role.hasDynamicRules) && (
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-2">Assignment Types:</p>
          <div className="flex flex-wrap gap-2">
            {role.hasManualAssignments && (
              <Badge 
                variant="outline" 
                className="text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-3 w-3 mr-1" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
                Manual Assignment
              </Badge>
            )}
            {role.hasDynamicRules && (
              <Badge 
                variant="outline" 
                className="text-xs bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-3 w-3 mr-1" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                Dynamic Rule
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
