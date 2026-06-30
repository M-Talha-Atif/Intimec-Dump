import React from "react";

interface AttributePermissionsHeaderProps {
  className?: string;
}

export const AttributePermissionsHeader: React.FC<
  AttributePermissionsHeaderProps
> = ({ className }) => {
  return (
    <div className={className}>
      <h2 className="text-2xl font-bold">Attribute-Level Permissions</h2>
      <p className="">
        Configure fine-grained access controls for identity attributes
      </p>
    </div>
  );
};
