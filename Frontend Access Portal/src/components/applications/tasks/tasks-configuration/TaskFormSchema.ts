import z from "zod";

const aggregationModeSchema = z
  .enum(
    ["full-aggregation", "delta-aggregation"],
    "Select a valid aggregation mode"
  )
  .default("full-aggregation");

export const scenairoSchema = z.object({
  scenario: z.enum(["deleted", "updated", "linked", "unlinked", "unmatched"]),
  action: z.enum([
    "sync",
    "link",
    "unlink",
    "add-focus",
    "delete-focus",
    "inactivate-focus",
    "delete",
    "inactivate",
    "create",
  ]),
});

export const taskConfigFormSchema = z.object({
  account: z.object({
    enabled: z.boolean().default(true),
    aggregationMode: aggregationModeSchema,
    scenarios: z.array(scenairoSchema).default([]),
    "refresh-roles": z.boolean().default(false),
    "check-active-policies": z.boolean().default(false),
    "maximum-deleted-accounts": z.number().default(0),
    "objects-per-partition": z.number().default(0),
    "loss-limit": z.number().default(0),
  }),
  entitlement: z.object({
    enabled: z.boolean().default(true),
    aggregationMode: aggregationModeSchema,
    scenarios: z.array(scenairoSchema).default([]),
    "refresh-entitlement-assignments": z.boolean().default(false),
    "check-request-policies": z.boolean().default(false),
    "refresh-the-entitlement-risk-scorecards": z.boolean().default(false),
    "maintain-entitlement-histories": z.boolean().default(false),
    "detect-orphaned-entitlements": z.boolean().default(false),
    "map-to-business-roles": z.boolean().default(false),
    "max-deleted-entitlements": z.number().default(0),
    "entitlements-per-partition": z.number().default(0),
  }),
}).superRefine((data, ctx) => {
  if (!data.account.enabled && !data.entitlement.enabled) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "At least one of Account or Entitlement import must be enabled",
      path: ["account", "enabled"],
    });
  }
});

export type TaskConfigFormSchemaType = z.infer<typeof taskConfigFormSchema>;

