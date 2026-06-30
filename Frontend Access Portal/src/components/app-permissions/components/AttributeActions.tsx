import React from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export const AttributeActions: React.FC = () => {
  return (
    <div className="flex flex-col space-y-2">
      <Button variant="outline" size="sm">
        Configure
      </Button>
      <Switch />
    </div>
  );
};
