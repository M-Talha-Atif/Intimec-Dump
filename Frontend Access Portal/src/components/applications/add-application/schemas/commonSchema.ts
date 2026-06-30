import z from "zod";

export const selectUsersSchema = z.object({
  name: z.string().min(1, "User name cannot be empty"),
  id: z.string().min(1, "User ID cannot be empty"),
  kind: z.enum(["identity", "group"], "Select a valid user type"),
});
