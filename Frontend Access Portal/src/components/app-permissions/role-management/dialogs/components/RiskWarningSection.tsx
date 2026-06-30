import React from "react";
import { AlertTriangle } from "lucide-react";
import { useEditRoleContext } from "../contexts/EditRoleContext";

export const RiskWarningSection: React.FC = () => {
  const { hasViolations, role } = useEditRoleContext();

  if (!hasViolations) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex items-start gap-2">
        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-medium text-yellow-800">
            Risk Violations Detected
          </h4>
          <ul className="text-sm text-yellow-700 mt-1 space-y-1">
            {role.violations.slice(0, 2).map((violation, index) => (
              <li key={index}>• {violation.description}</li>
            ))}
            {role.violations.length > 2 && (
              <li className="text-xs">
                ... and {role.violations.length - 2} more
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};
