"use client";

import { useForm } from "react-hook-form";
import { useEffect } from "react";
import NavigationButtons from "../NavigationButtons";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useAddApplicationContext } from "@/contexts/AddApplicationContext";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import RoleSelector from "@/components/applications/add-application/VisibilityForm/RolesSelector";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  visibilityFormSchema,
  VisibilityFormSchemaType,
} from "@/components/applications/add-application/schemas/VisibilitySchema";
import OwnerSelector from "@/components/applications/add-application/common/OwnerSelector";
import { get as hookFormGet } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function VisibilityForm() {
  const {
    incrementStep,
    currentFormStep,
    finalFormData,
    handleFormUpdate,
    handleFinalSubmit,
    mode,
    applicationId,
  } = useAddApplicationContext();

  const router = useRouter();
  const form = useForm<VisibilityFormSchemaType>({
    resolver: zodResolver(visibilityFormSchema),
    defaultValues: finalFormData["visibility"] || {
      mode: "public" as "public" | "role-based" | "select-users",
      users: [],
      applicationRolesIds: [],
      businessRolesIds: [],
    },
  });

  // Auto-save form data when navigating away (unmount)
  useEffect(() => {
    return () => {
      handleFormUpdate("visibility", form.getValues());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const errorRolebased =
    hookFormGet(form.formState.errors, "applicationRolesIds") &&
    hookFormGet(form.formState.errors, "businessRolesIds")
      ? "Select at least one role for Role-Based visibility."
      : null;

  if (currentFormStep !== "visibility") return null;
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => {
          console.log("Visibility form data", data);
          handleFormUpdate("visibility", data);
          incrementStep();
        })}
        id="details-form"
        className="flex flex-col h-full"
      >
        <h1 className="mb-4 text-lg font-semibold">Visibility Form</h1>
        <div className="flex flex-col items-center justify-center h-full">
          <FormField
            control={form.control}
            name="mode"
            render={({ field }) => (
              <FormItem className="flex flex-col flex-1 w-full">
                <FormControl>
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <div className="gap-3 border-1 flex items-start rounded-md p-4">
                      <RadioGroupItem value="public" id="visibility-r1" />
                      <div className="flex flex-col gap-2  h-full w-full">
                        <Label htmlFor="visibility-r1">Public</Label>
                        <p className="text-muted-foreground text-xs">
                          Visible to all users
                        </p>
                      </div>
                    </div>
                    <div className="gap-3 border-1 flex items-start rounded-md p-4">
                      <RadioGroupItem value="role-based" id="visibility-r2" />
                      <div className="flex flex-col gap-2 h-full w-full">
                        <Label htmlFor="visibility-r2">Role-Based</Label>
                        <p className="text-muted-foreground text-xs">
                          Visible to specific roles
                        </p>
                        {field.value === "role-based" && (
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="applicationRolesIds"
                              render={({ field }) => (
                                <FormItem className="h-full w-full">
                                  <RoleSelector
                                    value={field.value}
                                    onChange={field.onChange}
                                    title="System Roles"
                                    description="Choose system roles that can access this application."
                                    buttonText="Select System Roles"
                                    searchPlaceholder="Search system roles..."
                                    roleType="application"
                                  />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="businessRolesIds"
                              render={({ field }) => (
                                <FormItem className="h-full w-full">
                                  <RoleSelector
                                    value={field.value}
                                    onChange={field.onChange}
                                    title="Business Roles"
                                    description="Choose business roles that can access this application."
                                    buttonText="Select Business Roles"
                                    searchPlaceholder="Search business roles..."
                                    roleType="business"
                                  />
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                        <p className="text-destructive text-sm [&:empty]:hidden">
                          {errorRolebased}
                        </p>
                      </div>
                    </div>
                    <div className="gap-3 border-1 flex items-start rounded-md p-4">
                      <RadioGroupItem value="select-users" id="visibility-r3" />
                      <div className="flex flex-col gap-2 flex-1 overflow-hidden">
                        <Label htmlFor="visibility-r3">Select-Users</Label>
                        <p className="text-muted-foreground text-xs">
                          Visible to specific users (hidden from catalog)
                        </p>
                        {field.value === "select-users" && (
                          <FormField
                            control={form.control}
                            name="users"
                            render={({ field }) => (
                              <FormItem className="h-full">
                                <OwnerSelector
                                  value={field.value}
                                  onChange={field.onChange}
                                  title="Select Users"
                                  description="Choose users who can access this application."
                                  buttonText="Select Users"
                                />
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <NavigationButtons submitting={form.formState.isSubmitting}>
          <div className="flex justify-between w-full gap-2">
            <NavigationButtons.PreviousButton />
            <div className="space-x-2">
              <NavigationButtons.FinishButton
                onClick={async (e) => {
                  e.preventDefault();
                  form.handleSubmit(
                    async (data) => {
                      if (
                        await handleFinalSubmit({
                          visibility: data,
                        })
                      ) {
                        if (mode === "edit" && applicationId) {
                          router.push(`/applications/${applicationId}/overview`);
                        } else {
                          router.push("/applications");
                        }
                      }
                    },
                    (errors) => {
                      console.error("Visibility save validation errors:", errors);
                      toast.error("Please fix validation errors before saving");
                    }
                  )();
                }}
              />
              <NavigationButtons.NextButton />
            </div>
          </div>
        </NavigationButtons>
      </form>
    </Form>
  );
}
