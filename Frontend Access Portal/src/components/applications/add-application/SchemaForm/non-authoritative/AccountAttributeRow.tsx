import React, { useMemo, useState } from "react";

import { TableRow, TableCell } from "@/components/ui/table";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import AttributeCategoryBadge from "../AttributeCategoryBadge";
import { Button } from "@/components/ui/button";
import { Edit, Save, Trash } from "lucide-react";
import { NonAuthSchemaFromSchemaType } from "../../schemas/schemaFormSchema";
import { useController, useFormContext } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/components/ui/select";
import get from "lodash/get";
import { ConnectorAttributeType } from "@/types/add-application";
import DescriptionDialog from "../DescriptionDialog";

export default function NonAuthAttributeRow({
  index,
  removeAttribute,
  originalType,
}: {
  index: number;
  removeAttribute: () => void;
  originalType: ConnectorAttributeType;
}) {
  const fullPath: `account.attributes.${number}` = `account.attributes.${index}`;
  const { control, trigger, watch } = useFormContext<
    NonAuthSchemaFromSchemaType,
    typeof fullPath
  >();
  const { field, formState } = useController<
    NonAuthSchemaFromSchemaType,
    typeof fullPath
  >({
    control,
    name: fullPath,
  });

  const [isEditing, setIsEditing] = useState(false);
  const rowErrors = get(formState.errors, fullPath);

  const handleSave = async () => {
    const valid = await trigger(fullPath);
    if (valid) {
      setIsEditing(false);
    }
  };

  const entitlementFields = watch("entitlements");
  const entitlementMap = useMemo(
    () =>
      new Map(
        (entitlementFields ?? []).map((entitlement) => [
          entitlement.name,
          entitlement.displayName?.trim() || entitlement.name,
        ])
      ),
    [entitlementFields]
  );

  return (
    <TableRow key={index}>
      <TableCell>
        {isEditing ? (
          <Select
            onValueChange={(value) =>
              field.onChange({ ...field.value, category: value })
            }
            value={field.value.category}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent portal={false}>
              <SelectItem value="identity">
                <AttributeCategoryBadge category="identity" />
              </SelectItem>
              <SelectItem value="entitlement">
                <AttributeCategoryBadge category="entitlement" />
              </SelectItem>
              <SelectItem value="risk">
                <AttributeCategoryBadge category="risk" />
              </SelectItem>
              <SelectItem value="metadata">
                <AttributeCategoryBadge category="metadata" />
              </SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <AttributeCategoryBadge category={field.value.category} />
        )}
        {rowErrors?.category && (
          <p className="text-destructive text-sm">
            {rowErrors.category.message}
          </p>
        )}
      </TableCell>
      <TableCell>{field.value.name}</TableCell>
      <TableCell>
        {isEditing && fullPath.startsWith("account") ? (
          <Select
            onValueChange={(value) =>
              field.onChange({ ...field.value, type: value })
            }
            value={field.value.type}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={originalType}>
                <Badge variant="secondary">{originalType}</Badge>
              </SelectItem>
              {Array.from(entitlementMap.entries()).map(([id, label]) => (
                <SelectItem key={id} value={id}>
                  <Badge variant="secondary">{label}</Badge>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Badge variant="secondary">
            {field.value.type == originalType
              ? field.value.type
              : entitlementMap.get(field.value.type)}
          </Badge>
        )}
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
