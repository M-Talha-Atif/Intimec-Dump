import { z } from "zod";
export const scriptEditorSchema = z.object({
  lang: z.enum(
    ["typescript", "python", "shell", "groovy", "beanshell"],
    "Select a valid language"
  ),
  data: z
    .string()
    .min(2, "Enter at least 2 characters")
    .max(10000, "Enter at most 10000 characters"),
});

export type ScriptEditorContent = z.infer<typeof scriptEditorSchema>;
