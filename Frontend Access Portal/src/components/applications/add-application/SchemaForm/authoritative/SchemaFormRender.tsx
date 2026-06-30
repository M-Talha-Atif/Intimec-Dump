"use client";
import { useAddApplicationContext } from "@/contexts/AddApplicationContext";
import React, { useEffect, useMemo } from "react";

import { Form } from "@/components/ui/form";

import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  getAuthoritativeSchemaFormSchema,
  type AuthSchemaFromSchemaType,
} from "@/components/applications/add-application/schemas/schemaFormSchema";
import { Tabs, TabsTrigger, TabsList, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MetaSystemAttribute } from "@/types/add-application";
import NavigationButtons from "@/components/applications/add-application/NavigationButtons";
import AccountObjectCard from "../AccountObjectCard";
import { AddObjectDialog } from "../AddObjectDialog";
import EntitlementObjectCard from "../non-authoritative/EntitlementObjectCard";
import { ListIcon } from "lucide-react";
import { toast } from "sonner";

export default function SchemaFormRender({
  connectorObjects,
  systemAttributes,
}: {
  connectorObjects: string[];
  systemAttributes: MetaSystemAttribute[];
}) {
  const { finalFormData, handleFormUpdate, incrementStep } =
    useAddApplicationContext();

  const formSchema = useMemo(
    () => getAuthoritativeSchemaFormSchema(connectorObjects, systemAttributes),
    [connectorObjects, systemAttributes]
  );

  const form = useForm<AuthSchemaFromSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: (finalFormData["schema"] as AuthSchemaFromSchemaType) || {
      account: {
        name: "__ACCOUNT__",
        attributes: [],
        capabilities: [],
        accountDisplayNameAttribute: "",
        description: "",
        displayName: "Account",
      },
      entitlements: [],
    },
  });

  // Sync form with context when target attributes are resolved (edit mode)
  useEffect(() => {
    const schema = finalFormData["schema"] as AuthSchemaFromSchemaType | undefined;
    const attrs = schema?.account?.attributes;
    if (!attrs?.length) return;

    const hasPending = attrs.some(
      (a) => a.targetAttribute && (a.targetAttribute as { dataType?: string }).dataType === "__pending__"
    );
    if (hasPending) return;

    form.reset(schema, { keepDirtyValues: true });
  }, [finalFormData.schema]);

  // Auto-save form data when navigating away (unmount)
  useEffect(() => {
    return () => {
      handleFormUpdate("schema", form.getValues());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    fields: entitlementFields,
    append: appendEntitlement,
    remove: removeEntitlement,
  } = useFieldArray({
    control: form.control,
    name: "entitlements",
  });

  const accountsError = form.formState.errors.account?.message;
  const accountsHasError = !!form.formState.errors.account;
  const entitlementsHasError = !!form.formState.errors.entitlements;

  return (
    <Form {...form}>
      <form
        id="details-form"
        className="flex flex-col h-full"
        onSubmit={form.handleSubmit(
          (data) => {
            handleFormUpdate("schema", data);
            incrementStep();
          },
          (errors) => {
            // Deep-extract all validation errors (RHF nests them in arrays/objects)
            const extractErrors = (obj: Record<string, unknown>, prefix = ""): string[] => {
              const msgs: string[] = [];
              for (const [key, val] of Object.entries(obj)) {
                const path = prefix ? `${prefix}.${key}` : key;
                if (val && typeof val === "object" && "message" in val) {
                  msgs.push(`${path}: ${(val as { message: string }).message}`);
                } else if (val && typeof val === "object") {
                  msgs.push(...extractErrors(val as Record<string, unknown>, path));
                }
              }
              return msgs;
            };
            const allErrors = extractErrors(errors);
            console.error("Schema form validation errors:", allErrors);
            toast.error(allErrors.length > 0 
              ? `Validation failed: ${allErrors.slice(0, 3).join("; ")}`
              : "Schema validation failed — check form fields");
          }
        )}
      >
        <header className="flex flex-row items-center justify-between mb-4">
          <h1 className="mb-4 text-lg font-semibold">Schema Form</h1>
          <div className="flex flex-row justify-end">
            <AddObjectDialog
              connectorObjects={connectorObjects.filter(
                (obj) => !entitlementFields.some((field) => field.name === obj)
              )}
              onObjectSelected={(data) => {
                if (data) {
                  appendEntitlement({
                    ...data,
                    attributes: data.attributes ?? [],
                    entitlementDisplayNameAttribute: "",
                  });
                }
              }}
            />
          </div>
        </header>
        <Tabs
          className="flex flex-col flex-1 gap-2 overflow-hidden"
          defaultValue="account"
        >
          <TabsList className="flex w-full px-1">
            <TabsTrigger value="account">
              <p className={accountsHasError ? "text-destructive" : ""}>
                Account
              </p>
            </TabsTrigger>
            <TabsTrigger value="entitlement">
              <p className={entitlementsHasError ? "text-destructive" : ""}>
                Entitlement
              </p>
            </TabsTrigger>
          </TabsList>
          <ScrollArea className="flex-1">
            <TabsContent
              value="account"
              className="flex flex-col gap-2 p-1 data-[state=inactive]:hidden"
              forceMount
            >
              {accountsError && (
                <div className="flex-1 text-center text-destructive">
                  {accountsError}
                </div>
              )}
              <AccountObjectCard isAuthoritative={true} />
            </TabsContent>
            <TabsContent
              value="entitlement"
              className="flex flex-col gap-2 p-1 data-[state=inactive]:hidden h-full"
              forceMount
            >
              {entitlementFields.map((field, index) => (
                <EntitlementObjectCard
                  key={field.id}
                  index={index}
                  onRemove={() => removeEntitlement(index)}
                />
              ))}
              {entitlementFields.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <div className="p-4 mb-4 rounded-full bg-muted">
                    <ListIcon className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold">
                    No Entitlements Added
                  </h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Please Click on &quot;New Object Type&quot; to add a new
                    entitlement.
                  </p>
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
        <NavigationButtons>
          <div className="flex flex-row justify-between pt-2">
            <NavigationButtons.PreviousButton />
            <NavigationButtons.NextButton />
          </div>
        </NavigationButtons>
      </form>
    </Form>
  );
}
