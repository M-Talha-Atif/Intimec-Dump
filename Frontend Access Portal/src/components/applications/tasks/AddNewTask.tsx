import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { Control, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { postFetcher } from "@/hooks/applications/fetcher";
import useSWRMutation from "swr/mutation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ScheduleType, TaskCategory } from "@/types/task";

const taskTypeDescriptions: Record<TaskCategory, string> = {
  IMPORT: "Fetch all accounts, create/update shadows, correlate and execute sync reactions.",
  RECONCILIATION: "Full import plus deletion detection — marks absent accounts as deleted.",
  DISCOVERY: "Preview mode — fetch accounts and show what would happen, without executing reactions.",
};
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "next-intl";
import { mutate } from "swr";
import ms, { StringValue } from "ms";

import { AddTaskSchemaType, addTaskSchema } from "./AddTaskSchema";
import FormComboBox from "../add-application/common/FormComboBox";
import { getTimezones } from "./timezones";
import { transformTaskData } from "./ScheduleSchema";

export default function AddNewImportConfig({ appid }: { appid: string }) {
  const form = useForm<AddTaskSchemaType>({
    resolver: zodResolver(addTaskSchema),
    defaultValues: {
      name: "",
      description: "",
      scheduleType: ScheduleType.MANUAL,
      category: TaskCategory.IMPORT,
      priority: 9,
      ownerId: "4bb2c7df-5677-4cd2-a0d1-aad3fa8afe8f",
      cronExpression: "",
      intervalSeconds: "",
      time: new Date().toTimeString().slice(0, 5),
      date: new Date().toISOString().split("T")[0],
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    } as AddTaskSchemaType,
  });
  const [open, setOpen] = useState(false);

  const { trigger } = useSWRMutation(
    `/api/applications/${appid}/tasks`,
    postFetcher(" Failed to create task"),
    {
      throwOnError: false,
      onSuccess: async (data) => {
        console.log("Successfully created task:", data);
        toast.success("Task created successfully");
        await mutate(`/api/applications/${appid}/tasks`);
        form.reset();
        setOpen(false);
      },
      onError: (error) => {
        toast.error("Failed to create task", {
          description: error.message,
        });
      },
    }
  );

  const t = useTranslations(
    "ApplicationsPage.Import.tasks-list"
  );

  const scheduleType = form.watch("scheduleType");

  function getIntervalDescription(value: string) {
    try {
      const milliseconds = ms(value as StringValue);
      if (isNaN(milliseconds)) return null;
      const text = ms(milliseconds!, { long: true });
      return text;
    } catch {
      return null;
    }
  }

  const humanReadableInterval = getIntervalDescription(
    form.watch("intervalSeconds")
  );

  const intervalDescription = humanReadableInterval
    ? t("schedule.interval.description-with-time", { time: humanReadableInterval })
    : t("schedule.interval.description");

  const timezonesOptions = useMemo(() => getTimezones(), []);

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) form.reset();
        setOpen(open);
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus />
          {t("title")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(async (data) => {
              // @ts-expect-error TODO fix this
              const transformedData = transformTaskData(data);
              console.log(transformedData);
              await trigger({ ...transformedData, taskConfig: {} });
            })}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("add-task-modal.form.name.label")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t("add-task-modal.form.name.placeholder")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("add-task-modal.form.description.label")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t("add-task-modal.form.description.placeholder")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="scheduleType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("schedule.schedule-type.label")}</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t("schedule.schedule-type.placeholder")}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(ScheduleType).map((type) => (
                          <SelectItem key={type} value={type}>
                            {t(`schedule.schedule-type.options.${type}`)}
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
                control={
                  form.control as Control<
                    Extract<AddTaskSchemaType, { scheduleType: "CRON" }>
                  >
                }
                name="cronExpression"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("schedule.cron-expression.label")}</FormLabel>
                    <FormDescription>
                      {t("schedule.cron-expression.description")}
                    </FormDescription>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t("schedule.cron-expression.placeholder")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {scheduleType === "INTERVAL" && (
              <FormField
                control={
                  form.control as Control<
                    Extract<AddTaskSchemaType, { scheduleType: "INTERVAL" }>
                  >
                }
                name="intervalSeconds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("schedule.interval.label")}</FormLabel>
                    <FormDescription>{intervalDescription}</FormDescription>
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
                            onChange={(e) => field.onChange(e.target.value)}
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
                            onChange={(e) => field.onChange(e.target.value)}
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
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("add-task-modal.form.category.label")}</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t("add-task-modal.form.category.placeholder")}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(TaskCategory).map((category) => (
                          <SelectItem key={category} value={category}>
                            {t(`add-task-modal.form.category.options.${category}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>
                    {taskTypeDescriptions[field.value as TaskCategory]}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("add-task-modal.buttons.creating")}
                </>
              ) : (
                t("add-task-modal.buttons.create")
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
