import { useEffect, useMemo, useRef, useState } from "react";
import {
  useController,
  useFieldArray,
  useFormContext,
  get as hookFormGet,
  FieldArrayWithId,
} from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown,
  ChevronRight,
  Download,
  Eye,
  LoaderCircle,
  Plus,
  Trash,
  Upload,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import useConnectorObjectSchema, {
  FetchedConnectorObject,
} from "@/hooks/applications/add-application/useConnectorObjectSchema";
import { useAddApplicationContext } from "@/contexts/AddApplicationContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AttributeSchemaBase,
  EntitlementFormFields,
} from "@/components/applications/add-application/schemas/schemaFormSchema";
import AddAttributeCombobox from "../AddAttributeComboBox";
import ImportJsonButton from "@/components/applications/add-application/common/ImportJsonButton";
import ExportJsonButton from "@/components/applications/add-application/common/ExportJsonButton";
import LoadErrorCard from "@/components/applications/add-application/common/LoadErrorCard";
import PreviewObjectDataDialog from "../PreviewObjectDataDialog";
import { array as zArray } from "zod";
import { toast } from "sonner";
import EntitlementAttributeRow from "./EntitlementAttributeRow";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RenderNextFrame } from "@/components/applications/add-application/common/Delay";
import { ConfirmDeleteDialog } from "../ConfirmDeleteDialog";

type FetchedAttribute = FetchedConnectorObject["attributes"][number];

export default function EntitlementObjectCard({
  index,
  onRemove,
}: {
  index: number;
  onRemove: () => void;
}) {
  const { finalFormData } = useAddApplicationContext();
  const [expanded, setExpanded] = useState(true);
  const { control, formState } = useFormContext<
    EntitlementFormFields,
    "entitlements"
  >();
  const { field } = useController<
    EntitlementFormFields,
    `entitlements.${number}`
  >({
    name: `entitlements.${index}`,
    control,
  });
  const {
    fields: attributes,
    append: appendAttribute,
    replace: replaceAttributes,
    remove: removeAttribute,
  } = useFieldArray<
    EntitlementFormFields,
    `entitlements.${number}.attributes`
  >({
    control,
    name: `entitlements.${index}.attributes`,
  });
  const {
    object,
    error: errorObject,
    isLoading: loadingObject,
  } = useConnectorObjectSchema(
    finalFormData?.details?.connectorId,
    finalFormData?.connector,
    field.value.name
  );

  const initializeAttributesRef = useRef(false);

  useEffect(() => {
    if (
      attributes.length <= 0 &&
      !initializeAttributesRef.current &&
      object?.attributes
    ) {
      replaceAttributes(object.attributes);
      initializeAttributesRef.current = true;
    }
  }, [attributes.length, object?.attributes, replaceAttributes]);

  const showDisplayName = field.value?.displayName?.trim() !== "";
  const displayName =
    (showDisplayName ? field.value?.displayName : field.value?.name) ?? "";

  const attributesError = hookFormGet(
    formState.errors,
    `entitlements.${index}.attributes`
  );
  const attributesErrorMessage =
    attributesError?.message || attributesError?.root?.message;

  function handleAddAttribute(attr: FetchedAttribute) {
    appendAttribute(attr);
  }

  const addableAttributes = useMemo(
    () =>
      object?.attributes?.filter(
        (attr) => !attributes.some((attr2) => attr2.name === attr.name)
      ) ?? [],
    [attributes, object?.attributes]
  );

  const selectedAttributeNames = useMemo(
    () => attributes.map((attr) => attr.name),
    [attributes]
  );

  const displayNameError =
    formState.errors?.entitlements?.[index]?.entitlementDisplayNameAttribute
      ?.message;

  const descriptionAttrError =
    formState.errors?.entitlements?.[index]?.entitlementDescriptionAttribute
      ?.message;

  return (
    <Collapsible open={expanded} onOpenChange={setExpanded}>
      <Card className="gap-0 p-0 overflow-clip">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="text-left hover:bg-muted/50 cursor-pointer py-6 [&:not(:has([data-slot=card-description]))_[data-slot=card-title]]:row-span-2">
            <CardTitle className="flex items-center h-full gap-2">
              <span className={attributesErrorMessage ? "text-destructive" : undefined}>
                {displayName}
              </span>
            </CardTitle>
            {field.value?.description && (
              <CardDescription>{field.value.description}</CardDescription>
            )}
            <CardAction className="flex items-center justify-end h-full gap-2">
              <div className="flex flex-wrap items-center justify-end gap-2">
                {loadingObject && (
                  <LoaderCircle className="w-4 h-4 animate-spin text-muted-foreground" />
                )}
                {object?.capabilities?.map((capability) => (
                  <Badge variant="outline" key={capability}>
                    {capability}
                  </Badge>
                ))}
              </div>
              <Badge variant="secondary" className=" min-w-fit">
                {attributes.length} attributes
              </Badge>
              {expanded ? (
                <ChevronDown className="w-4 h-4 min-w-fit" />
              ) : (
                <ChevronRight className="w-4 h-4 min-w-fit" />
              )}
            </CardAction>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent>
            <header className="w-full flex gap-2 mb-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <ImportJsonButton
                      onImport={(rawData) => {
                        const parseResults =
                          zArray(AttributeSchemaBase).safeParse(rawData);
                        if (!parseResults.success) {
                          toast.error(
                            "Failed to import attributes: Invalid format"
                          );
                          return;
                        }
                        const output = parseResults.data.filter((item) =>
                          object?.attributes.some(
                            (attr) => attr.name === item.name
                          )
                        );
                        replaceAttributes(output);
                        toast.success(`Imported ${output.length} attributes`);
                        const invalidCount =
                          parseResults.data.length - output.length;
                        if (invalidCount > 0) {
                          toast.warning(
                            `Skipped ${invalidCount} attributes: Not found in object schema`
                          );
                        }
                      }}
                      variant="outline"
                      className="size-9 2xl:w-auto"
                    >
                      <Download />
                    </ImportJsonButton>
                  </span>
                </TooltipTrigger>
                <TooltipContent>Import attributes from JSON</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <ExportJsonButton
                      data={attributes}
                      fileName={`${field.value?.name
                        .split(" ")
                        .join("_")}.json`}
                      variant="outline"
                    >
                      <Upload />
                    </ExportJsonButton>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  Export {field.value?.name.split(" ").join("_")}.json
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <PreviewObjectDataDialog
                      variant="outline"
                      type="button"
                      attributes={selectedAttributeNames}
                      name={field.value.name}
                      displayName={displayName}
                    >
                      <Eye />
                    </PreviewObjectDataDialog>
                  </span>
                </TooltipTrigger>
                <TooltipContent>Preview object data</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <ConfirmDeleteDialog
                      callback={() => {
                        replaceAttributes([]);
                      }}
                    />
                  </span>
                </TooltipTrigger>
                <TooltipContent>Remove all attributes</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="ml-auto">
                    <Select
                      value={field.value.entitlementDisplayNameAttribute || ""}
                      onValueChange={(value) => {
                        field.onChange({
                          ...field.value,
                          entitlementDisplayNameAttribute: value,
                        });
                      }}
                    >
                      <SelectTrigger
                        className={
                          displayNameError &&
                          "data-[placeholder]:text-destructive"
                        }
                      >
                        <SelectValue placeholder="Select Entitlement Display Name" />
                      </SelectTrigger>
                      <SelectContent>
                        {attributes.map((attr) => (
                          <SelectItem key={attr.id} value={attr.name}>
                            {attr.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  Select entitlement display name attribute
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="ml-0">
                    <Select
                      value={field.value.entitlementDescriptionAttribute || ""}
                      onValueChange={(value) => {
                        field.onChange({
                          ...field.value,
                          entitlementDescriptionAttribute: value,
                        });
                      }}
                    >
                      <SelectTrigger
                        className={
                          descriptionAttrError &&
                          "data-[placeholder]:text-destructive"
                        }
                      >
                        <SelectValue placeholder="Select Description Attribute" />
                      </SelectTrigger>
                      <SelectContent>
                        {attributes.map((attr) => (
                          <SelectItem key={attr.id} value={attr.name}>
                            {attr.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  Select entitlement description attribute (optional)
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <AddAttributeCombobox
                      attributes={addableAttributes}
                      onSelect={(attr) => {
                        if (attr) handleAddAttribute(attr);
                      }}
                      className="w-48 justify-start"
                    >
                      <Plus /> Add Attribute
                    </AddAttributeCombobox>
                  </span>
                </TooltipTrigger>
                <TooltipContent>Add new attribute</TooltipContent>
              </Tooltip>
            </header>
            <div className="rounded-md border-1 overflow-hidden">
              {loadingObject && (
                <div className="h-24 flex justify-center items-center">
                  <LoaderCircle className="animate-spin text-muted-foreground w-12 h-12" />
                </div>
              )}

              {!loadingObject && errorObject && (
                <LoadErrorCard
                  errorTitle="Failed Loading Object"
                  errorMessage={errorObject.message}
                />
              )}

              {!loadingObject && !errorObject && object && (
                <RenderNextFrame
                  fallback={
                    <div className="h-24 flex justify-center items-center">
                      <LoaderCircle className="animate-spin text-muted-foreground w-12 h-12" />
                    </div>
                  }
                >
                  <EntitlementObjectTable
                    index={index}
                    attributesErrorMessage={attributesErrorMessage}
                    attributes={attributes}
                    removeAttribute={removeAttribute}
                  />
                </RenderNextFrame>
              )}
            </div>
          </CardContent>
          <CardFooter className="pb-4 [&:empty]:pb-2 pt-4 w-full justify-end">
            <Button
              type="button"
              variant="destructive"
              onClick={() => onRemove()}
            >
              <Trash /> Remove Object
            </Button>
          </CardFooter>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
const EntitlementObjectTable = ({
  attributesErrorMessage,
  attributes,
  removeAttribute,
  index,
}: {
  attributesErrorMessage: string;
  attributes: FieldArrayWithId<
    EntitlementFormFields,
    `entitlements.${number}.attributes`,
    "id"
  >[];
  index: number;
  removeAttribute: (index: number) => void;
}) => {
  return (
    <Table className="w-full overflow-hidden table-auto">
      <TableHeader className="sticky top-0 z-10 bg-muted">
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Flags</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="w-30">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {attributes.map((attr, idx) => (
          <EntitlementAttributeRow
            key={attr.id}
            attrIndex={idx}
            entitlementIndex={index}
            removeAttribute={() => removeAttribute(idx)}
          />
        ))}
        {attributesErrorMessage && (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-destructive">
              {attributesErrorMessage}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
