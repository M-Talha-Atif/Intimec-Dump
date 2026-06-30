import React from "react";
import { Badge } from "@/components/ui/badge";
import { useEditRoleContext } from "../contexts/EditRoleContext";

export const RoleInfoSection: React.FC = () => {
  const { role } = useEditRoleContext();

  return (
    <div className="bg-muted/50 rounded-lg p-4">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">Type:</span>
          <Badge variant="secondary" className="ml-2">
            {role.type}
          </Badge>
        </div>
        <div>
          <span className="text-muted-foreground">Users:</span>
          <span className="ml-2 font-medium">{role.userCount}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Risk Score:</span>
          <span className="ml-2 font-medium">{role.riskScore}/100</span>
        </div>
        <div>
          <span className="text-muted-foreground">Last Modified:</span>
          <span className="ml-2 font-medium">
            {new Date(role.lastModified).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
};
