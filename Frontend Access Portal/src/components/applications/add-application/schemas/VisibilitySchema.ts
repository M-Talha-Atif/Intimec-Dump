import z from "zod";
import { selectUsersSchema } from "./commonSchema";

export const visibilityFormSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("public"),
  }),
  z
    .object({
      mode: z.literal("role-based"),
      applicationRolesIds: z.array(z.string()),
      businessRolesIds: z.array(z.string()),
    })
    .superRefine((data, ctx) => {
      if (
        data.applicationRolesIds.length === 0 &&
        data.businessRolesIds.length === 0
      ) {
        ctx.addIssue({
          path: ["applicationRolesIds"],
          code: "custom",
          message: "At least one role must be selected",
        });
        ctx.addIssue({
          path: ["businessRolesIds"],
          code: "custom",
          message: "At least one role must be selected",
        });
      }
    }),
  z.object({
    mode: z.literal("select-users"),
    users: z
      .array(selectUsersSchema)
      .min(1, "At least one user must be selected"),
  }),
]);

export type VisibilityFormSchemaType = z.infer<typeof visibilityFormSchema>;
