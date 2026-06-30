import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import FormComboBox from "@/components/applications/add-application/common/FormComboBox";
import RequiredFormLabel from "@/components/applications/add-application/common/RequiredFormLabel";
import BadgeEditor from "@/components/applications/add-application/ComplianceBadgeEditor";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAddApplicationContext } from "@/contexts/AddApplicationContext";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  DetailsFormSchemaType,
  getDetailsZodSchema,
} from "@/components/applications/add-application/schemas/detailsSchema";
import { defaultValues } from "@/components/applications/add-application/schemas/detailsSchema";
import { DropDownOption } from "@/types/add-application";
import NavigationButtons from "@/components/applications/add-application/NavigationButtons";
import { UploadCloud, X } from "lucide-react";
import ConfirmDialog from "./ConfirmDialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import OwnerSelector from "./OwnerSelector";

export default function DetailsFormRender({
  connectorOptions,
  schema,
  departments,
  scopes,
  identityTypes,
}: {
  connectorOptions: DropDownOption[];
  schema: ReturnType<typeof getDetailsZodSchema>;
  departments: DropDownOption[];
  scopes: DropDownOption[];
  identityTypes: DropDownOption[];
}) {
  const {
    finalFormData,
    handleFormUpdate,
    incrementStep,
    currentFormStep,
    getStepIndex,
  } = useAddApplicationContext();
  const form = useForm<DetailsFormSchemaType>({
    resolver: zodResolver(schema),
    defaultValues: finalFormData["details"] || defaultValues,
  });

  // Auto-save form data when navigating away (unmount)
  useEffect(() => {
    return () => {
      handleFormUpdate("details", form.getValues());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [pendingChanges, setPendingChanges] = useState<{
    field: "connectorId" | "isAuthoritative";
    data: DetailsFormSchemaType;
  } | null>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const icon = form.watch("icon");

  useEffect(() => {
    if (!icon) return;

    const objectUrl = URL.createObjectURL(icon);
    setPreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [icon]);

  const handleSubmit = form.handleSubmit((data) => {
    if (
      finalFormData["details"]?.connectorId &&
      finalFormData["details"]?.connectorId !== data.connectorId
    ) {
      setPendingChanges({ field: "connectorId", data });
      return;
    }

    if (
      finalFormData["details"]?.isAuthoritative !== undefined &&
      finalFormData["details"]?.isAuthoritative !== data.isAuthoritative
    ) {
      setPendingChanges({ field: "isAuthoritative", data });
      return;
    }

    // normal flow
    handleFormUpdate("details", data);
    incrementStep();
  });

  const confirmChange = () => {
    if (pendingChanges) {
      handleFormUpdate("details", pendingChanges.data);
      incrementStep();
    }
    setPendingChanges(null);
  };

  const cancelChange = () => {
    if (pendingChanges?.field === "connectorId") {
      form.setValue("connectorId", finalFormData["details"]?.connectorId ?? "");
    }
    if (pendingChanges?.field === "isAuthoritative") {
      form.setValue(
        "isAuthoritative",
        finalFormData["details"]?.isAuthoritative ?? false
      );
    }
    setPendingChanges(null);
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={handleSubmit}
          id="details-form"
          className="flex flex-col h-full"
        >
          <h1 className="mb-4 text-lg font-semibold">Details Form</h1>
          <ScrollArea className="h-full">
            <div className="grid grid-cols-1 p-2 gap-x-4 gap-y-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <RequiredFormLabel>Application Name</RequiredFormLabel>
                    <FormDescription>
                      A unique name for this application within the platform.
                    </FormDescription>
                    <FormControl>
                      <Input placeholder="e.g., Salesforce" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="icon"
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Application Icon</FormLabel>
                    <FormDescription>
                      Upload an icon to represent this application.
                    </FormDescription>
                    <FormControl>
                      <div className="flex items-center gap-4">
                        <Label htmlFor="icon">
                          <div className="flex items-center justify-center w-10 h-10 rounded-md bg-muted">
                            {preview ? (
                              <Image
                                width={40}
                                height={40}
                                src={preview}
                                alt="Application Icon"
                                className="object-cover w-6 h-6 rounded"
                              />
                            ) : (
                              <UploadCloud className="w-6 h-6 text-muted-foreground" />
                            )}
                          </div>
                        </Label>
                        <Input
                          id="icon"
                          type="file"
                          accept="image/*"
                          className="flex-1"
                          {...fieldProps}
                          onChange={(e) => {
                            onChange(e.target.files?.[0]);
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="owner"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <RequiredFormLabel>Technical Owner</RequiredFormLabel>
                    <FormDescription>
                      The technical owner responsible for this application.
                    </FormDescription>
                    <FormControl>
                      <OwnerSelector
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="businessOwner"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Business Owner</FormLabel>
                    <FormDescription>
                      The business stakeholder for this application.
                    </FormDescription>
                    <FormControl>
                      <OwnerSelector
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="connectorId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <RequiredFormLabel>Application type</RequiredFormLabel>
                    <FormDescription>
                      This determines which connector settings are available in
                      the next steps.
                    </FormDescription>
                    <FormComboBox
                      placeholder="Select application type"
                      searchPlaceholder="Search application type..."
                      notFoundText="Application type not found."
                      options={connectorOptions}
                      selectedValue={field.value}
                      onSelect={field.onChange}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Application Category</FormLabel>
                    <FormDescription>
                      Categorize this application for better organization.
                    </FormDescription>
                    <FormControl>
                      <BadgeEditor
                        complianceTags={field.value}
                        setComplianceTags={field.onChange}
                        placeholder="Add a category"
                        maxLength={60}
                        className="w-full max-w-100"
                      />
                    </FormControl>
                    <div className="flex flex-wrap gap-2">
                      {field.value &&
                        field.value.map((tag: string, index: number) => (
                          <Badge
                            key={index}
                            className="flex items-center gap-2 pr-1"
                            variant="secondary"
                          >
                            {tag}
                            <Button
                              size="icon"
                              variant="ghost"
                              className="w-4 h-4 rounded-full hover:bg-black/5"
                              onClick={(e) => {
                                e.preventDefault();
                                field.onChange(
                                  field.value?.filter((t: string) => t !== tag)
                                );
                              }}
                            >
                              <X />
                            </Button>
                          </Badge>
                        ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="riskLevel"
                render={({ field }) => (
                  <FormItem>
                    <RequiredFormLabel>Risk Level</RequiredFormLabel>
                    <FormDescription>
                      Risk assessment for this application&apos;s access
                      requirements.
                    </FormDescription>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select risk level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="complianceLabels"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Compliance Tags</FormLabel>
                    <FormDescription>
                      Tags for compliance requirements.
                    </FormDescription>
                    <FormControl>
                      <BadgeEditor
                        complianceTags={field.value}
                        setComplianceTags={field.onChange}
                        maxLength={20}
                        className="w-full max-w-65"
                      />
                    </FormControl>
                    <div className="flex flex-wrap gap-2">
                      {field.value &&
                        field.value.map((tag: string, index: number) => (
                          <Badge
                            key={index}
                            className="flex items-center gap-2 pr-1"
                            variant="secondary"
                          >
                            {tag}
                            <Button
                              size="icon"
                              variant="ghost"
                              className="w-4 h-4 rounded-full hover:bg-black/5"
                              onClick={(e) => {
                                e.preventDefault();
                                field.onChange(
                                  field.value?.filter((t: string) => t !== tag)
                                );
                              }}
                            >
                              <X />
                            </Button>
                          </Badge>
                        ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="schemaId"
                render={({ field }) => (
                  <FormItem>
                    <RequiredFormLabel>Identity Type</RequiredFormLabel>
                    <FormDescription>
                      This controls the identity context for data imports and
                      operations.
                    </FormDescription>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value ?? ""}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Identity Type" />
                        </SelectTrigger>
                        <SelectContent>
                          {identityTypes.map((identityType) => (
                            <SelectItem
                              value={identityType.id}
                              key={identityType.id}
                            >
                              {identityType.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isAuthoritative"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-row gap-2">
                        <FormLabel>Authoritative Source</FormLabel>
                      </div>
                      <FormDescription>
                        This application will be treated as the master source
                        for identity data.
                      </FormDescription>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="scopes"
                render={({ field }) => (
                  <FormItem className="relative">
                    <FormLabel>Scopes</FormLabel>
                    <FormDescription>
                      Select the scopes associated with this application.
                    </FormDescription>
                    <FormControl>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="w-full">
                            <span className="truncate flex-1">
                              {field.value
                                .map((scope) => scope.name)
                                .join(", ") || "Select Scopes"}
                            </span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
                          {scopes.map((scope) => (
                            <DropdownMenuCheckboxItem
                              key={scope.id}
                              checked={field.value.some(
                                (scopeField) => scopeField.id === scope.id
                              )}
                              onCheckedChange={(checked) => {
                                console.log(checked, scope);
                                if (checked) {
                                  field.onChange([
                                    ...field.value,
                                    {
                                      id: scope.id,
                                      name: scope.label,
                                    },
                                  ]);
                                } else {
                                  field.onChange(
                                    field.value.filter(
                                      (scopeField) => scopeField.id !== scope.id
                                    )
                                  );
                                }
                              }}
                            >
                              {scope.label}
                            </DropdownMenuCheckboxItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem className="relative">
                    <FormLabel>Department</FormLabel>
                    <FormDescription>
                      Select the department associated with this application.
                    </FormDescription>
                    <FormControl>
                      <Select
                        onValueChange={(value) => {
                          const selectedDept = departments.find(d => d.id === value);
                          if (selectedDept) {
                            field.onChange({ name: selectedDept.label, id: selectedDept.id });
                          }
                        }}
                        value={field.value?.id ?? ""}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((department) => (
                            <SelectItem
                              value={department.id}
                              key={department.id}
                            >
                              {department.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="relative col-span-1 md:col-span-2">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        maxLength={200}
                        placeholder="Provide a brief description of the application's purpose."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <div className="absolute text-sm bottom-2 right-2 text-muted-foreground">
                      {field.value ? field.value.length : 0}/200
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </ScrollArea>
          <NavigationButtons
            disablePrevious={getStepIndex(currentFormStep) === 0}
            disableNext={
              form.formState.isSubmitting ||
              Object.keys(form.formState.errors).length > 0
            }
          >
            <div className="flex justify-between">
              <NavigationButtons.PreviousButton />
              <NavigationButtons.NextButton />
            </div>
          </NavigationButtons>
        </form>
      </Form>
      <ConfirmDialog
        showDialog={!!pendingChanges}
        setShowDialog={(open) => {
          if (!open) setPendingChanges(null);
        }}
        confirmChange={confirmChange}
        cancelChange={cancelChange}
        title={
          pendingChanges?.field === "connectorId"
            ? "Change type?"
            : "Change Authoritative source?"
        }
        description={
          pendingChanges?.field === "connectorId"
            ? "Changing the type will reset configuration, schema and correlation tabs."
            : "Changing the Authoritative source will reset the schema tab."
        }
      />
    </>
  );
}
