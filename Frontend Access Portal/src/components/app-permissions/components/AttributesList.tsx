import React from "react";
import { useAttributePermissionsContext } from "../contexts";
import { AttributeCard } from "./AttributeCard";

export const AttributesList: React.FC = () => {
  const { filteredAttributes } = useAttributePermissionsContext();

  return (
    <div className="space-y-4">
      {filteredAttributes.map((attr) => (
        <AttributeCard key={attr.id} attribute={attr} />
      ))}
    </div>
  );
};
