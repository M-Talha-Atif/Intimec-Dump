import React from "react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { AttributePermission } from "../data";
import { getSensitivityColor, getAccessIcon } from "../utils";

interface AttributeHeaderProps {
  attribute: AttributePermission;
}

export const AttributeHeader: React.FC<AttributeHeaderProps> = ({
  attribute,
}) => {
  return (
    <div className="flex items-center space-x-3 mb-2">
      <h3 className="text-lg font-semibold">{attribute.attribute}</h3>
      <Badge variant="outline">{attribute.category}</Badge>
      <Badge className={getSensitivityColor(attribute.sensitivity)}>
        {attribute.sensitivity}
      </Badge>
    </div>
  );
};

interface AttributeDetailsProps {
  attribute: AttributePermission;
}

export const AttributeDetails: React.FC<AttributeDetailsProps> = ({
  attribute,
}) => {
  const AccessIcon = getAccessIcon(attribute.defaultAccess);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
      <div>
        <Label className="text-sm font-medium text-gray-700">Data Type</Label>
        <p className="text-sm">{attribute.dataType}</p>
      </div>

      <div>
        <Label className="text-sm font-medium text-gray-700">
          Default Access
        </Label>
        <div className="flex items-center space-x-2 mt-1">
          {AccessIcon && <AccessIcon className="h-4 w-4" />}
          <span className="text-sm capitalize">{attribute.defaultAccess}</span>
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium text-gray-700">
          Role Overrides
        </Label>
        <p className="text-sm">
          {Object.keys(attribute.roleOverrides).length} configured
        </p>
      </div>
    </div>
  );
};
