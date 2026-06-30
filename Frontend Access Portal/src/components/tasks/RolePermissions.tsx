import React from "react";
import { RolePermissionsList } from "../access-portal/access-items/RolePermissionsList";

interface RolePermissionsProps {
  roleId: string;
  permissionsCount?: number;
}

export const RolePermissions: React.FC<RolePermissionsProps> = ({
  roleId,
  permissionsCount = 0,
}) => {
  if (!roleId) return null;

  return (
    <RolePermissionsList
      roleId={roleId}
      permissionsCount={permissionsCount}
    />
  );
};