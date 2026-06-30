import { MetaSystemAttribute } from "@/types/add-application";
import z from "zod";

export const MiniAttributeSchema = z.object({
  name: z.string().min(1, "Select a valid attribute name"),
  type: z.string().min(1, "Select a valid attribute type"),
  flags: z.array(z.string()).optional(),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
});

export const AttributeSchemaBase = MiniAttributeSchema.extend({
  category: z.enum(
    ["identity", "entitlement", "risk", "metadata"],
    "Select a valid category"
  ),
});

const transformationSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("script"),
    script: z.object({
      data: z.string().min(1, "Script is required"),
      lang: z.enum(
        ["typescript", "groovy", "beanshell"],
        "Select a valid language"
      ),
    }),
  }),
  z.object({
    mode: z.enum(
      ["default", "uppercase", "lowercase"],
      "Select a valid transformation option"
    ),
  }),
]);
export function getAuthoritativeAttributeSchema(
  systemAttributes: MetaSystemAttribute[]
) {
  const AttributeSchema = AttributeSchemaBase.extend({
    targetAttribute: z
      .object({
        systemKey: z.string().min(1, "System key is required"),
        dataType: z.string().min(1, "Data type is required"),
        displayName: z.string().min(1, "Display name is required"),
      })
      .refine(
        (val) =>
          systemAttributes.some((attr) => attr.systemKey === val.systemKey),
        "Select a valid target attribute"
      )
      .nullable(),
    transformation: transformationSchema.nullable(),
  }).superRefine((data, ctx) => {
    if (data.targetAttribute === null) {
      if (data.transformation !== null) {
        ctx.addIssue({
          path: ["transformation", "mode"],
          code: "custom",
          message: `Choose a target attribute first`,
        });
      }
    } else {
      if (data.transformation === null) {
        ctx.addIssue({
          path: ["transformation", "mode"],
          code: "custom",
          message: `Select a valid transformation option`,
        });
      }
    }
  });
  return AttributeSchema;
}

export function getAuthoritativeSingleAccountObjectSchema(
  connectorObjects: string[],
  systemAttributes: MetaSystemAttribute[]
) {
  return z
    .object({
      name: z
        .string()
        .refine((n) => connectorObjects.includes(n), "Selected a valid object"),
      displayName: z.string().optional(),
      description: z
        .string()
        .max(200, "Description must be 200 characters or less")
        .optional(),
      attributes: z
        .array(getAuthoritativeAttributeSchema(systemAttributes))
        .refine(
          (va) => new Set(va.map((attr) => attr.name)).size === va.length,
          "attributes must be unique"
        )
        .refine(
          (data) => data.some((attr) => attr.targetAttribute !== null),
          "At least one target attribute must be selected"
        )
        .optional(),
      capabilities: z.array(z.string()).optional(),
      accountDisplayNameAttribute: z
        .string()
        .min(1, "Account display name is required"),
    })
    .superRefine((data, ctx) => {
      const attributeNames = data.attributes?.map((a) => a.name) ?? [];
      if (!attributeNames.includes(data.accountDisplayNameAttribute)) {
        ctx.addIssue({
          path: ["accountDisplayNameAttribute"],
          code: "custom",
          message: "Must reference one of the defined attributes",
        });
      }
    });
}

export function getNonAuthoritativeSingleAccountObjectSchema(
  connectorObjects: string[]
) {
  return z
    .object({
      name: z
        .string()
        .refine((n) => connectorObjects.includes(n), "Selected a valid object"),
      displayName: z.string().optional(),
      description: z
        .string()
        .max(200, "Description must be 200 characters or less")
        .optional(),
      attributes: z
        .array(AttributeSchemaBase)
        .refine(
          (va) => new Set(va.map((attr) => attr.name)).size === va.length,
          "attributes must be unique"
        )
        .optional(),
      capabilities: z.array(z.string()).optional(),
      accountDisplayNameAttribute: z
        .string()
        .min(1, "Account display name is required"),
    })
    .superRefine((data, ctx) => {
      const attributeNames = data.attributes?.map((a) => a.name) ?? [];
      if (!attributeNames.includes(data.accountDisplayNameAttribute)) {
        ctx.addIssue({
          path: ["accountDisplayNameAttribute"],
          code: "custom",
          message: "Must reference one of the defined attributes",
        });
      }
    });
}

export function getSingleEntitlementObjectSchema(connectorObjects: string[]) {
  return z
    .object({
      name: z
        .string()
        .refine((n) => connectorObjects.includes(n), "Selected a valid object"),
      displayName: z.string().optional(),
      description: z
        .string()
        .max(200, "Description must be 200 characters or less")
        .optional(),
      attributes: z
        .array(MiniAttributeSchema)
        .refine(
          (va) => new Set(va.map((attr) => attr.name)).size === va.length,
          "attributes must be unique"
        )
        .optional(),
      capabilities: z.array(z.string()).optional(),
      entitlementDisplayNameAttribute: z
        .string()
        .min(1, "Entitlement display name is required"),
      entitlementDescriptionAttribute: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      const attributeNames = data.attributes?.map((a) => a.name) ?? [];
      if (!attributeNames.includes(data.entitlementDisplayNameAttribute)) {
        ctx.addIssue({
          path: ["entitlementDisplayNameAttribute"],
          code: "custom",
          message: "Must reference one of the defined attributes",
        });
      }
      if (
        data.entitlementDescriptionAttribute &&
        !attributeNames.includes(data.entitlementDescriptionAttribute)
      ) {
        ctx.addIssue({
          path: ["entitlementDescriptionAttribute"],
          code: "custom",
          message: "Must reference one of the defined attributes",
        });
      }
    });
}

export function getNonAuthoritativeSchemaFormSchema(
  connectorObjects: string[]
) {
  const singleAccountObjectBaseSchema =
    getNonAuthoritativeSingleAccountObjectSchema(connectorObjects);
  const singleEntitlementObjectBaseSchema =
    getSingleEntitlementObjectSchema(connectorObjects);
  const singleAccountObjectSchema = z.object({
    ...singleAccountObjectBaseSchema.shape,
    attributes: singleAccountObjectBaseSchema.shape.attributes
      .unwrap()
      .min(1, "At least one attribute must be added"),
  });
  const singleEntitlementObjectSchema = z.object({
    ...singleEntitlementObjectBaseSchema.shape,
    attributes: singleEntitlementObjectBaseSchema.shape.attributes
      .unwrap()
      .min(1, "At least one attribute must be added"),
  });
  return z.object({
    account: singleAccountObjectSchema,
    entitlements: z.array(singleEntitlementObjectSchema).optional(),
  });
}

export function getAuthoritativeSchemaFormSchema(
  connectorObjects: string[],
  systemAttributes: MetaSystemAttribute[]
) {
  const singleObjectBaseSchema = getAuthoritativeSingleAccountObjectSchema(
    connectorObjects,
    systemAttributes
  );
  const singleObjectSchema = z.object({
    ...singleObjectBaseSchema.shape,
    attributes: singleObjectBaseSchema.shape.attributes
      .unwrap()
      .min(1, "At least one attribute must be added"),
  });
  const singleEntitlementObjectBaseSchema =
    getSingleEntitlementObjectSchema(connectorObjects);
  const singleEntitlementObjectSchema = z.object({
    ...singleEntitlementObjectBaseSchema.shape,
    attributes: singleEntitlementObjectBaseSchema.shape.attributes
      .unwrap()
      .min(1, "At least one attribute must be added"),
  });
  return z.object({
    account: singleObjectSchema,
    entitlements: z.array(singleEntitlementObjectSchema).optional(),
  });
}

export type NonAuthSchemaFromSchemaType = z.infer<
  ReturnType<typeof getNonAuthoritativeSchemaFormSchema>
>;

export type AuthSchemaFromSchemaType = z.infer<
  ReturnType<typeof getAuthoritativeSchemaFormSchema>
>;

export type AuthoritativeSingleAccountConnectorObjectSchemaType = z.infer<
  ReturnType<typeof getAuthoritativeSingleAccountObjectSchema>
>;

export type NonAuthoritativeSingleAccountConnectorObjectSchemaType = z.infer<
  ReturnType<typeof getNonAuthoritativeSingleAccountObjectSchema>
>;

export type SingleEntitlementConnectorObjectSchemaType = z.infer<
  ReturnType<typeof getSingleEntitlementObjectSchema>
>;

// Shared type for any form that contains entitlements (used by EntitlementObjectCard/Row)
export type EntitlementFormFields = {
  entitlements?: SingleEntitlementConnectorObjectSchemaType[];
};
