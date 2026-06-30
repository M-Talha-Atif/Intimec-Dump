import React from "react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useEditRoleContext } from "../contexts/EditRoleContext";
import { availableScopes } from "../data/createRoleData";

export const EditScopeSelectionSection: React.FC = () => {
  const { selectedScopes, toggleScope } = useEditRoleContext();

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Access Scope</Label>
      <div className="grid grid-cols-2 gap-2">
        {availableScopes.map((scope) => (
          <div
            key={scope}
            onClick={() => toggleScope(scope)}
            className={`p-2 rounded-md border cursor-pointer transition-colors ${
              selectedScopes.includes(scope)
                ? "bg-primary/10 border-primary text-primary"
                : "bg-background border-border hover:border-primary/50"
            }`}
          >
            <span className="text-sm">{scope}</span>
          </div>
        ))}
      </div>
      {selectedScopes.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedScopes.map((scope) => (
            <Badge key={scope} variant="secondary" className="text-xs">
              {scope}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => toggleScope(scope)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
