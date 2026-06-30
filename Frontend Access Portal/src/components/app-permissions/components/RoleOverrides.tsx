import React from "react";
import { getAccessIcon, formatRoleName } from "../utils";

interface RoleOverridesProps {
  roleOverrides: Record<string, string>;
}

export const RoleOverrides: React.FC<RoleOverridesProps> = ({
  roleOverrides,
}) => {
  if (Object.keys(roleOverrides).length === 0) {
    return null;
  }

  return (
    <div className="mt-4 p-4 rounded-lg">
      <h4 className="text-sm font-medium text-gray-700 mb-2">
        Role-Specific Access
      </h4>
      <div className="space-y-2">
        {Object.entries(roleOverrides).map(([role, access]) => {
          const AccessIcon = getAccessIcon(access);

          return (
            <div
              key={role}
              className="flex items-center justify-between text-sm"
            >
              <span className="">{formatRoleName(role)}</span>
              <div className="flex items-center space-x-1">
                {AccessIcon && <AccessIcon className="h-4 w-4" />}
                <span className="capitalize">{access}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
