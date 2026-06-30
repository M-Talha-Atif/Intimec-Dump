"use client";
import { useAddApplicationContext } from "@/contexts/AddApplicationContext";
import { useEffect, useMemo } from "react";

import { Form } from "@/components/ui/form";

import { useFieldArray, useForm } from "react-hook-form";
import { AddObjectDialog } from "../AddObjectDialog";
import { zodResolver } from "@hookform/resolvers/zod";
import AccountObjectCard from "@/components/applications/add-application/SchemaForm/AccountObjectCard";
import {
  getNonAuthoritativeSchemaFormSchema,
  type NonAuthSchemaFromSchemaType,
} from "@/components/applications/add-application/schemas/schemaFormSchema";
import { Tabs, TabsTrigger, TabsList, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import NavigationButtons from "@/components/applications/add-application/NavigationButtons";
import { ListIcon } from "lucide-react";
import EntitlementObjectCard from "./EntitlementObjectCard";
import { toast } from "sonner";

export default function SchemaFormRender({
  connectorObjects,
}: {
  connectorObjects: string[];
}) {
  const { finalFormData, handleFormUpdate, incrementStep } =
    useAddApplicationContext();

  const formSchema = useMemo(
    () => getNonAuthoritativeSchemaFormSchema(connectorObjects),
    [connectorObjects]
  );

  const form = useForm<NonAuthSchemaFromSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: (finalFormData["schema"] as NonAuthSchemaFromSchemaType) || {
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
            console.error("Schema form validation errors:", errors);
            const messages = Object.entries(errors)
              .map(([key, err]) => `${key}: ${(err as { message?: string })?.message || "invalid"}`)
              .join(", ");
            toast.error(`Validation failed: ${messages}`);
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
              <AccountObjectCard isAuthoritative={false} />
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
