import { TaskCategory } from "@/types/task";
import z from "zod";
import { scheduleSchema } from "./ScheduleSchema";

export const addTaskSchema = z
  .object({
    name: z.string().min(2, "Name should be at least 2 characters."),
    description: z.string().optional(),
    category: z.enum(Object.values(TaskCategory)),
    priority: z.number().min(1).max(9),
    ownerId: z.string(),
  })
  .and(scheduleSchema);
export type AddTaskSchemaType = z.infer<typeof addTaskSchema>;
