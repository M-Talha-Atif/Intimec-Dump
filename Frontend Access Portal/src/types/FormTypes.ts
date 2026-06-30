import { z } from "zod"
import { LoginFormSchema } from "@/schemas"

export type LoginFormFieldsProps = {
  fieldName: keyof z.infer<typeof LoginFormSchema>;
  fieldType: 'text' | 'username' | 'password';
  placeholder: string;
}
