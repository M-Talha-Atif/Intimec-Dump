import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { AttributeMapping } from "../../types/index";
import { useMappingContext } from "../../context/MappingContext";

interface ValidationBadgeProps {
  mapping: AttributeMapping;
}

export const ValidationBadge: React.FC<ValidationBadgeProps> = ({
  mapping,
}) => {
  const { sourceAttributes, entityFields, sources } = useMappingContext();

  if (!mapping.sourceAttribute || !mapping.targetAttribute) {
    return (
      <Badge variant="destructive">
        <XCircle className="h-3 w-3 mr-1" />
        Invalid
      </Badge>
    );
  }

  // Find the source by name to get its ID
  const source = sources.find((s) => s.name === mapping.source);
  const sourceId = source?.id;

  const sourceAttr = sourceId
    ? sourceAttributes[sourceId]?.find(
        (attr) => attr.nativeAttributeName === mapping.sourceAttribute
      )
    : undefined;

  const targetAttr = entityFields.find(
    (field) => field.displayName === mapping.targetAttribute
  );

  if (
    sourceAttr &&
    targetAttr &&
    sourceAttr.dataType.toLowerCase() === targetAttr.dataType.toLowerCase()
  ) {
    return (
      <Badge variant="default" className="bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3 mr-1" />
        Valid
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="border-yellow-500 text-yellow-600">
      <AlertTriangle className="h-3 w-3 mr-1" />
      Warning
    </Badge>
  );
};
