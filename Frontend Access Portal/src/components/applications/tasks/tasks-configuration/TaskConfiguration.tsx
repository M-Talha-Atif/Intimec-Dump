"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoaderCircle, Shield, User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ConfigurationSection from "./ConfigurationSection";
import { Resolver, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import {
  taskConfigFormSchema,
  TaskConfigFormSchemaType,
} from "./TaskFormSchema";
import { useTaskConfig } from "@/hooks/applications/task/useTaskConfig";
import { merge } from "lodash";
import CustomBadge from "../../common/CustomBadge";
import { useTranslations } from "next-intl";
import { useSimpleNavigationGuard } from "@/hooks/useNavigationGuard";
import { SimpleConfirmDialog } from "@/components/ui/ConfirmDialog";

const baseDefaults = taskConfigFormSchema.parse({
  account: {},
  entitlement: {},
});
export default function TaskConfiguration({
  appid,
  taskid,
}: {
  appid: string;
  taskid: string;
}) {
  const { saveConfig, isMutating,  data, isLoading } = useTaskConfig(
    appid,
    taskid
  );
  const form = useForm<TaskConfigFormSchemaType>({
    resolver: zodResolver(
      taskConfigFormSchema
    ) as Resolver<TaskConfigFormSchemaType>,
    defaultValues: baseDefaults,
    values: merge({}, baseDefaults, data || {}),
  });
  const commonT = useTranslations("common");
  const { showDialog, message, onIgnoreChanges, onCancel } =
    useSimpleNavigationGuard({
      hasUnsavedChanges: form.formState.isDirty,
      message: commonT("unsaved-changes-warning"),
    });
  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(async (data) => {
            await saveConfig({ taskConfig: data });
          })}
          className="h-full flex-3/4"
        >
          <Card>
            <CardHeader className="gap-0">
              <CardTitle className="text-xl">Configuration</CardTitle>
            </CardHeader>
            <CardContent className="gap-2 flex flex-col">
              <Tabs defaultValue="account">
                <TabsList className="w-full">
                  <TabsTrigger value="account">
                    <User />
                    Account
                  </TabsTrigger>
                  <TabsTrigger value="entitlement">
                    <Shield />
                    Entitlement
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="account">
                  {isLoading && (
                    <div className="flex items-center justify-center w-full h-80">
                      <LoaderCircle className="size-12 text-muted-foreground animate-spin" />
                    </div>
                  )}
                  {!isLoading && <ConfigurationSection name="account" />}
                </TabsContent>
                <TabsContent value="entitlement">
                  {isLoading && (
                    <div className="flex items-center justify-center w-full h-80">
                      <LoaderCircle className="size-12 text-muted-foreground animate-spin" />
                    </div>
                  )}
                  {!isLoading && <ConfigurationSection name="entitlement" />}
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter>
              <CardAction className="flex items-center justify-between gap-2">
                <Button
                  type="submit"
                  disabled={
                    isMutating ||
                    form.formState.isSubmitting ||
                    !form.formState.isDirty
                  }
                >
                  {isMutating && (
                    <LoaderCircle className="size-4 animate-spin" />
                  )}
                  Save configuration
                </Button>
                {form.formState.isDirty && (
                  <CustomBadge color="yellow">
                    {commonT("unsaved-changes")}
                  </CustomBadge>
                )}
              </CardAction>
            </CardFooter>
          </Card>
        </form>
      </Form>
      <SimpleConfirmDialog
        open={showDialog}
        message={message}
        onIgnoreChanges={() => {
          form.reset();
          onIgnoreChanges();
        }}
        onCancel={onCancel}
      />
    </>
  );
}
