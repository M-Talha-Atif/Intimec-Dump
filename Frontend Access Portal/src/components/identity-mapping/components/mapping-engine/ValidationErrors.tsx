import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { AttributeMapping } from "../../types/index";

interface ValidationErrorsProps {
  mapping: AttributeMapping;
}

export const ValidationErrors: React.FC<ValidationErrorsProps> = ({
  mapping,
}) => {
  if (!mapping.validationErrors || mapping.validationErrors.length === 0) {
    return null;
  }

  return (
    <Alert className="mb-3">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <ul className="list-disc list-inside text-sm">
          {mapping.validationErrors.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
};
