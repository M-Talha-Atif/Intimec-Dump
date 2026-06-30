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
import { AuthSchemaFromSchemaType } from "../../schemas/schemaFormSchema";
import { useController, useFormContext } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/components/ui/select";
import { useAddApplicationContext } from "@/contexts/AddApplicationContext";
import TransfromationScriptEditor from "./TransformationScriptEditor";
import { MetaSystemAttribute } from "@/types/add-application";
import DescriptionDialog from "../DescriptionDialog";
import { get } from "react-hook-form";

export default function AuthAttributeRow({
  index,
  removeAttribute,
}: {
  index: number;
  removeAttribute: () => void;
}) {
  const fullPath:
    | `account.attributes.${number}` = `account.attributes.${index}`;
  const { control, trigger } = useFormContext<
    AuthSchemaFromSchemaType,
    typeof fullPath
  >();
  const {
    field,
    formState: { errors },
  } = useController<AuthSchemaFromSchemaType, typeof fullPath>({
    control,
    name: fullPath,
  });

  const [isEditing, setIsEditing] = useState(false);
  const rowErrors = get(errors, fullPath);

  const handleSave = async () => {
    const valid = await trigger(fullPath);
    if (valid) {
      setIsEditing(false);
    }
  };

  const { systemAttributes } = useAddApplicationContext();

  const systemAttributesMap: Map<string, MetaSystemAttribute | null> = useMemo(
    () =>
      new Map([
        ...(systemAttributes?.map((attr) => [attr.systemKey, attr] as const) ??
          []),
        ["__clear__", null],
      ]),
    [systemAttributes]
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
        {isEditing ? (
          <>
            <Select
              value={field.value.targetAttribute?.systemKey ?? "__clear__"}
              onValueChange={(value) => {
                if (value === "__clear__") {
                  field.onChange({
                    ...field.value,
                    transformation: null,
                    targetAttribute: null,
                  });
                } else {
                  field.onChange({
                    ...field.value,
                    targetAttribute: systemAttributesMap.get(value),
                    transformation: { mode: "default" },
                  });
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select System attribute" />
              </SelectTrigger>
              <SelectContent portal={false}>
                <SelectItem value="__clear__">--None--</SelectItem>
                {systemAttributes?.map((attribute) => (
                  <SelectItem
                    key={attribute.systemKey}
                    value={attribute.systemKey}
                  >
                    {attribute.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {rowErrors?.targetAttribute && (
              <p className="text-destructive text-sm">
                {rowErrors.targetAttribute.message}
              </p>
            )}
          </>
        ) : field.value.targetAttribute ? (
          field.value.targetAttribute.displayName
        ) : (
          "-"
        )}
      </TableCell>
      <TableCell>
        {isEditing && field.value.targetAttribute ? (
          <>
            <div className="flex flex-row gap-2">
              <Select
                onValueChange={(value) => {
                  if (value === "script") {
                    field.onChange({
                      ...field.value,
                      transformation: {
                        ...field.value.transformation,
                        mode: value,
                        script: { data: "", lang: "typescript" },
                      },
                    });
                  } else {
                    field.onChange({
                      ...field.value,
                      transformation: {
                        ...field.value.transformation,
                        mode: value,
                      },
                    });
                  }
                }}
                value={field.value.transformation?.mode}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Transformation Type" />
                </SelectTrigger>
                <SelectContent portal={false}>
                  <SelectItem value="default">default</SelectItem>
                  <SelectItem value="uppercase">uppercase</SelectItem>
                  <SelectItem value="lowercase">lowercase</SelectItem>
                  <SelectItem value="script">script</SelectItem>
                </SelectContent>
              </Select>
              {field.value.transformation?.mode === "script" && (
                <TransfromationScriptEditor
                  onChange={(value) =>
                    field.onChange({
                      ...field.value,
                      transformation: {
                        ...field.value.transformation,
                        script: value,
                      },
                    })
                  }
                  value={field.value.transformation.script}
                  accountAttribute={field.value}
                  systemAttribute={field.value.targetAttribute}
                />
              )}
            </div>
            {(rowErrors?.transformation?.mode ||
              rowErrors?.transformation?.script?.data) && (
              <p className="text-destructive text-sm">
                {rowErrors.transformation.mode?.message ||
                  rowErrors.transformation.script?.data?.message}
              </p>
            )}
          </>
        ) : field.value.transformation ? (
          field.value.transformation?.mode
        ) : (
          "-"
        )}
      </TableCell>
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
