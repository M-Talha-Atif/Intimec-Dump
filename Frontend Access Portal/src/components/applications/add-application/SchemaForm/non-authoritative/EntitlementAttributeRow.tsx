import React, { useState } from "react";

import { TableRow, TableCell } from "@/components/ui/table";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Edit, Save, Trash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import DescriptionDialog from "../DescriptionDialog";
import { EntitlementFormFields } from "@/components/applications/add-application/schemas/schemaFormSchema";
import {
  useController,
  useFormContext,
  get as hookFormGet,
} from "react-hook-form";

export default function EntitlementAttributeRow({
  attrIndex,
  entitlementIndex,
  removeAttribute,
}: {
  attrIndex: number;
  entitlementIndex: number;
  removeAttribute: () => void;
}) {
  const fullPath: `entitlements.${number}.attributes.${number}` = `entitlements.${entitlementIndex}.attributes.${attrIndex}`;
  const { control, trigger } = useFormContext<
    EntitlementFormFields,
    typeof fullPath
  >();
  const { field, formState } = useController<
    EntitlementFormFields,
    typeof fullPath
  >({
    control,
    name: fullPath,
  });

  const [isEditing, setIsEditing] = useState(false);
  const rowErrors = hookFormGet(formState.errors, fullPath);

  const handleSave = async () => {
    const valid = await trigger(fullPath);
    if (valid) {
      setIsEditing(false);
    }
  };

  return (
    <TableRow>
      <TableCell>{field.value.name}</TableCell>
      <TableCell>
        <Badge variant="secondary">{field.value.type}</Badge>
      </TableCell>
      <TableCell>
        <Tooltip>
          <TooltipTrigger onClick={(e) => e.preventDefault()}>
            <p className="w-32 truncate text-left">
              {field.value.flags ? field.value.flags.join(", ") : "-"}
            </p>
          </TooltipTrigger>
          <TooltipContent className="whitespace-pre-wrap">
            {field.value.flags ? field.value.flags.join("\n") : "No flags"}
          </TooltipContent>
        </Tooltip>
      </TableCell>
      <TableCell>
        {isEditing ? (
          <DescriptionDialog
            value={field.value.description}
            onSave={(value) =>
              field.onChange({ ...field.value, description: value })
            }
            variant="outline"
          >
            Edit
          </DescriptionDialog>
        ) : (
          <Tooltip>
            <TooltipTrigger>
              <p className="truncate max-w-72">
                {field.value.description || "-"}
              </p>
            </TooltipTrigger>
            <TooltipContent className="whitespace-pre-wrap max-w-72">
              {field.value.description || "No description"}
            </TooltipContent>
          </Tooltip>
        )}
        {rowErrors?.description && (
          <p className="text-destructive text-sm">
            {rowErrors.description.message}
          </p>
        )}
      </TableCell>
      <TableCell className="flex flex-row gap-2">
        <Button
          size="icon"
          variant="ghost"
          type="button"
          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
        >
          {isEditing ? <Save /> : <Edit />}
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="text-destructive"
          type="button"
          onClick={() => {
            removeAttribute();
          }}
        >
          <Trash />
        </Button>
      </TableCell>
    </TableRow>
  );
}
