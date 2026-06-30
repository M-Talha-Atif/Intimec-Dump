import {
  ConnectorAttribute,
  MetaSystemAttribute,
} from "@/types/add-application";
import { RuleGroupType, RuleType } from "react-querybuilder";
import z from "zod";

export function getCorrelationSectionSchema(
  systemAttributes: MetaSystemAttribute[],
  accountAttributes: ConnectorAttribute[]
) {
  const rule: z.ZodType<RuleType> = z.object({
    field: z
      .string()
      .refine(
        (val) => systemAttributes.some((attr) => attr.systemKey === val),
        "Select a valid system attribute"
      ),
    operator: z.string().min(1, "Select a valid operator"),
    valueSource: z.literal("value"),
    value: z
      .string()
      .refine(
        (val) => accountAttributes.some((attr) => attr.name === val),
        "Select a valid account attribute"
      ),
  });

  const ruleGroup: z.ZodType<RuleGroupType> = z.lazy<z.ZodType<RuleGroupType>>(
    () =>
      z.object({
        combinator: z.enum(["and", "or"], "Select a valid combinator type"),
        not: z.boolean().optional(),
        rules: z
          .array(z.union([rule, ruleGroup]))
          .min(1, "At least one rule is required"),
      })
  );

  return z.discriminatedUnion("mode", [
    z.object({
      mode: z.literal("attribute"),
      ruleGroup: ruleGroup as z.ZodType<RuleGroupType>,
    }),
    z.object({
      mode: z.literal("role-based"),
      script: z.object({
        data: z.string().min(1, "script required"),
        lang: z.enum(
          ["typescript", "groovy", "beanshell"],
          "Select a valid script type"
        ),
      }),
    }),
    z.object({
      mode: z.literal("none"),
    }),
  ]);
}

export function getCorrelationFormSchema(
  identityAttributes: MetaSystemAttribute[],
  accountAttributes: ConnectorAttribute[]
) {
  const accountSchema = getCorrelationSectionSchema(
    identityAttributes,
    accountAttributes
  );
  const managerSchema = accountSchema;

  return z.object({
    account: accountSchema,
    manager: managerSchema,
  });
}

export type CorrelationFormSchemaType = z.infer<
  ReturnType<typeof getCorrelationFormSchema>
>;
