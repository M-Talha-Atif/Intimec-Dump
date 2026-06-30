import React, { useState } from "react";
import { Eye } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { InternalRole } from "@/types/roleManagement";
import { getTypeIcon, getRiskColor } from "../utils/roleUtils";
import { useRoleManagementContext } from "../contexts/RoleManagementContext";
import { TruncatedText } from "./TruncatedText";

interface RoleCardHeaderProps {
  role: InternalRole;
}

export const RoleCardHeader: React.FC<RoleCardHeaderProps> = ({ role }) => {
  const { selectedRoles, setSelectedRoles } = useRoleManagementContext();

  const TypeIcon = getTypeIcon(role.type);
  const isSystemRole = role.type === "SYSTEM";

  const handleSelectionChange = (checked: boolean) => {
    if (checked) {
      setSelectedRoles([...selectedRoles, role.id]);
    } else {
      setSelectedRoles(selectedRoles.filter((id) => id !== role.id));
    }
  };

  // Only show 'View full' for long descriptions
  const [showModal, setShowModal] = useState(false);
  // Clamp to 2 lines visually, and only show 'View full' if overflow is likely
  const maxLength = 120;
  const isLong = role.description && role.description.length > maxLength;

  return (
    <div>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={selectedRoles.includes(role.id)}
            onCheckedChange={handleSelectionChange}
            disabled={isSystemRole}
            title={isSystemRole ? "SYSTEM roles cannot be selected for deletion" : undefined}
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <TypeIcon className="h-5 w-5 text-muted-foreground" />
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="center">
                {role.type}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <h3 className="font-semibold text-base">
            <TruncatedText text={role.name} maxLength={50} />
          </h3>
        </div>
        <div className="flex gap-2">
          <Badge variant={getRiskColor(role.riskLevel)}>{role.riskLevel}</Badge>
          <Badge 
            variant="default" 
            className={role.isActive 
              ? "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20" 
              : "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20"
            }
          >
            {role.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      </div>
      <div className="text-sm text-muted-foreground">
        <p className={isLong ? "line-clamp-2" : ""}>
          {role.description}
          {isLong && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="inline-flex items-center ml-1 text-primary hover:text-primary/80 font-medium transition-colors focus:outline-none"
                    onClick={() => setShowModal(true)}
                    type="button"
                  >
                    ...more
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View full description</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </p>
      </div>
      {/* Modal for full description */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-brightness-75">
          <div className="bg-background rounded-lg shadow-lg p-6 max-w-lg w-full relative">
            <button
              className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowModal(false)}
              aria-label="Close"
              type="button"
            >
              ×
            </button>
            <h4 className="font-semibold mb-2">Description</h4>
            <div className="text-sm text-muted-foreground whitespace-pre-line break-words">
              {role.description}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
