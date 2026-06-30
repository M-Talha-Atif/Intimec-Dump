"use client";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Form,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  scheduleSchema,
  ScheduleSchemaType,
  transformTaskData,
} from "../ScheduleSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ScheduleType } from "@/types/task";
import { useTranslations } from "next-intl";
import ms, { StringValue } from "ms";
import { useSimpleNavigationGuard } from "@/hooks/useNavigationGuard";
import { SimpleConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useTaskConfig } from "@/hooks/applications/task/useTaskConfig";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, LoaderCircle } from "lucide-react";
import CustomBadge from "../../common/CustomBadge";
import { merge } from "lodash";
import FormComboBox from "@/components/applications/add-application/common/FormComboBox";
import { useEffect, useMemo } from "react";
import { getTimezones } from "../timezones";
import { formatTimestamp } from "@/utils/dateFormat";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const defaults: ScheduleSchemaType = {
  scheduleType: ScheduleType.MANUAL,
  cronExpression: "",
  intervalSeconds: "",
  time: new Date(Date.now() + 5 * 60 * 1000) // defaults to 5 minutes from now
    .toTimeString()
    .slice(0, 5),
  date: new Date().toISOString().split("T")[0],
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
} as ScheduleSchemaType;

function getIntervalDescription(value: string | undefined) {
  try {
    if (!value) return null;
    const milliseconds = ms(value as StringValue);
    if (isNaN(milliseconds)) return null;
    const text = ms(milliseconds!, { long: true });
    return text;
  } catch {
    return null;
  }
}

export default function TaskScheduleConfig({
  appid,
  taskid,
}: {
  appid: string;
  taskid: string;
}) {
  const {
    saveConfig,
    isMutating,
    scheduleConfig,
    isLoading,
    executionMetadata,
  } = useTaskConfig(appid, taskid);
  const form = useForm<ScheduleSchemaType>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: defaults,
  });

  const t = useTranslations("ApplicationsPage.Import.tasks-list");
  const scheduleType = form.watch("scheduleType");
  const commonT = useTranslations("common");
  const { showDialog, message, onIgnoreChanges, onCancel } =
    useSimpleNavigationGuard({
      hasUnsavedChanges: form.formState.isDirty,
      message: commonT("unsaved-changes-warning"),
    });

  const humanReadableInterval = getIntervalDescription(
    form.watch("intervalSeconds")
  );
  const intervalDescription = humanReadableInterval
    ? `Every ${humanReadableInterval}`
    : t("schedule.interval.description");

  const timezonesOptions = useMemo(() => getTimezones(), []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      form.reset(merge({}, defaults, scheduleConfig));
    }, 0);
    return () => clearTimeout(timeout);
  }, [scheduleConfig, form]);

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(async (data) => {
            // @ts-expect-error fix typescript error
            const transformedData = transformTaskData(data);
            console.log("saving changes:", transformedData);
            await saveConfig(transformedData);
          })}
        >
          <Collapsible>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="group flex flex-row justify-between items-center cursor-pointer">
                  <div>
                    <CardTitle className="text-xl">
                      Schedule Configuration
                    </CardTitle>
                    <div className="text-sm text-muted-foreground flex flex-row gap-6 mt-2">
                        <div className="flex flex-row gap-2">
                          <span className="text-sm text-muted-foreground">
                            Last Execution
                          </span>
                          <span className="font-medium">
                            {formatTimestamp(executionMetadata?.lastExecution ?? null)}
                          </span>
                        </div>
                        <div className="flex flex-row gap-2">
                          <span className="text-sm text-muted-foreground">
                            Next Execution
                          </span>
                          <span className="font-medium">
                            {formatTimestamp(executionMetadata?.nextExecution ?? null)}
                          </span>
                        </div>
                    </div>
                  </div>
                  <div className="hover:bg-foreground/10 rounded-md p-2">
                    <ChevronRight className=" group-data-[state=open]:rotate-90 transition-transform" />
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4">
                {isLoading && (
                  <div className="flex items-center justify-center w-full h-80">
                    <LoaderCircle className="size-12 text-muted-foreground animate-spin" />
                  </div>
                )}
                {!isLoading && scheduleConfig && (
                  <CardContent className="gap-4 flex flex-col data-[loading=true]:hidden">
                    <FormField
                      control={form.control}
                      name="scheduleType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t("schedule.schedule-type.label")}
                          </FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={t(
                                    "schedule.schedule-type.placeholder"
                                  )}
                                />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.values(ScheduleType).map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {t(
                                      `schedule.schedule-type.options.${type}`
                                    )}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {scheduleType === "CRON" && (
                      <FormField
                        control={form.control}
                        name="cronExpression"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t("schedule.cron-expression.label")}
                            </FormLabel>
                            <FormDescription>
                              {t("schedule.cron-expression.description")}
                            </FormDescription>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder={t(
                                  "schedule.cron-expression.placeholder"
                                )}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    {scheduleType === "INTERVAL" && (
                      <FormField
                        control={form.control}
                        name="intervalSeconds"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t("schedule.interval.label")}
                            </FormLabel>
                            <FormDescription>
                              {intervalDescription}
                            </FormDescription>
                            <FormControl>
                              <Input
                                placeholder={t("schedule.interval.placeholder")}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    {scheduleType !== "MANUAL" && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="time"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Time</FormLabel>
                                <FormControl>
                                  <Input
                                    type="time"
                                    value={field.value as string}
                                    onChange={(e) =>
                                      field.onChange(e.target.value)
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Date</FormLabel>
                                <FormControl>
                                  <Input
                                    type="date"
                                    value={field.value as string}
                                    onChange={(e) =>
                                      field.onChange(e.target.value)
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="timezone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Timezone</FormLabel>
                              <FormControl>
                                <FormComboBox
                                  options={timezonesOptions}
                                  selectedValue={field.value as string}
                                  onSelect={(val) => field.onChange(val)}
                                  placeholder="Select timezone"
                                  className="w-full"
                                  autoSort={false}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </CardContent>
                )}

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
              </CollapsibleContent>
            </Card>
          </Collapsible>
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
