import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AttributePermission } from "../data";
import { AttributeHeader, AttributeDetails } from "./AttributeDetails";
import { RoleOverrides } from "./RoleOverrides";
import { AttributeActions } from "./AttributeActions";

interface AttributeCardProps {
  attribute: AttributePermission;
}

export const AttributeCard: React.FC<AttributeCardProps> = ({ attribute }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <AttributeHeader attribute={attribute} />
            <AttributeDetails attribute={attribute} />
            <RoleOverrides roleOverrides={attribute.roleOverrides} />
          </div>
          <AttributeActions />
        </div>
      </CardContent>
    </Card>
  );
};
