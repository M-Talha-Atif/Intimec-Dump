import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { InternalRole } from "@/types/roleManagement";
import { RoleCardHeader } from "./RoleCardHeader";
import { RoleCardContent } from "./RoleCardContent";
import { RoleCardActions } from "./RoleCardActions";

interface RoleCardProps {
  role: InternalRole;
}

export const RoleCard: React.FC<RoleCardProps> = ({ role }) => {
  return (
    <Card className="hover:shadow-md transition-shadow flex flex-col h-full">
      <CardHeader className="pb-3">
        <RoleCardHeader role={role} />
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1">
          <RoleCardContent role={role} />
        </div>
        <RoleCardActions role={role} />
      </CardContent>
    </Card>
  );
};
