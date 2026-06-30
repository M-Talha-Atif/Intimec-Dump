import { ScheduleType } from "@/types/task";
import ms, { StringValue } from "ms";
import z from "zod";
import { fromZonedTime } from "date-fns-tz";
import cronValidate from "cron-validate";

export function isValidQuartzCron(cron: string) {
  const result = cronValidate(cron, {
    override: {
      // Quartz includes seconds and optionally years
      useSeconds: true,
      useYears: true,

      // Quartz supports "?" in day-of-month or day-of-week fields
      useBlankDay: true,
      allowOnlyOneBlankDayField: true,

      // Quartz allows stepping, e.g., "*/5"
      allowStepping: true,

      // Quartz supports L (last day), W (nearest weekday), and # (nth weekday)
      useLastDayOfMonth: true,
      useLastDayOfWeek: true,
      useNearestWeekday: true,
      useNthWeekdayOfMonth: true,
    },
  });
  return result.isValid();
}

// Now define variants based on scheduleType
export const manualSchema = z.object({
  scheduleType: z.literal(ScheduleType.MANUAL),
});

export const onceSchema = z.object({
  scheduleType: z.literal(ScheduleType.ONCE),
  time: z.string("Select time"),
  date: z.string("Select date"),
  timezone: z.string("Timezone is required"),
});

export const cronSchema = z.object({
  scheduleType: z.literal(ScheduleType.CRON),
  cronExpression: z
    .string()
    .refine((val) => isValidQuartzCron(val), "Invalid cron pattern"),
  time: z.string("Select time"),
  date: z.string("Select date"),
  timezone: z.string("Timezone is required"),
});

export const intervalSchema = z.object({
  scheduleType: z.literal(ScheduleType.INTERVAL),
  intervalSeconds: z
    .string()
    .min(1, "Interval is required")
    .refine(
      (val) => !!ms(val as StringValue),
      "Enter a valid interval (e.g. 5min, 2h, 1d)"
    ),
  time: z.string("Select time"),
  date: z.string("Select date"),
  timezone: z.string("Timezone is required"),
});

export const scheduleSchema = z.discriminatedUnion("scheduleType", [
  manualSchema,
  onceSchema,
  cronSchema,
  intervalSchema,
]);

export type ScheduleSchemaType = z.infer<typeof scheduleSchema>;

export function transformTaskData(
  data: ScheduleSchemaType & {
    executionDateTime?: number;
    intervalSeconds?: number;
  }
) {
  const transformed = { ...data };

  switch (data.scheduleType) {
    case ScheduleType.ONCE:
    case ScheduleType.CRON:
    case ScheduleType.INTERVAL: {
      const { date, time, timezone } = data;
      const [hours, minutes] = time.split(":").map(Number);
      const [year, month, day] = date.split("-").map(Number);

      const local = new Date(year, month - 1, day, hours, minutes);
      const utcDate = fromZonedTime(local, timezone);
      transformed.executionDateTime = utcDate.getTime();

      if (data.scheduleType === ScheduleType.INTERVAL) {
        transformed.intervalSeconds = Math.floor(
          ms(data.intervalSeconds as StringValue) / 1000
        );
      }
      // @ts-expect-error Remove unused fields
      delete transformed.date;
      // @ts-expect-error Remove unused fields
      delete transformed.time;
      // @ts-expect-error Remove unused fields
      delete transformed.timezone;

      break;
    }

    case ScheduleType.MANUAL:
      break;
  }

  return transformed;
}
