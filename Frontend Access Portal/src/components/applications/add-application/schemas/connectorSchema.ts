import { Connector, DynamicFieldType } from "@/types/add-application";
import { z } from "zod";

function typeToZodType(type: DynamicFieldType, isRequired: boolean): z.ZodType {
  switch (type) {
    case "string":
    case "byte[]":
      return isRequired
        ? z.string().min(1, "This field is required")
        : z.string().optional();
    case "int":
      const outputInt = z
        .int32("This field must be an integer")
        .min(0, "This field must be a positive number");
      return isRequired ? outputInt : outputInt.optional();
    case "long":
      // Using BigInt for long type
      // Note: Java long is 64-bit signed integer, so we use BigInt in JavaScript
      const outputLong = z.preprocess(
        (val) => {
          if (typeof val === "number" || typeof val === "string") {
            try {
              return BigInt(val);
            } catch {
              return val; // let Zod throw the error
            }
          }
          return val; // already bigint or invalid
        },
        z
          .bigint("This field must be a long integer")
          .min(BigInt(0), "This field must be a positive number")
          .max(BigInt(2) ** BigInt(63) - BigInt(1), "Value too large")
      );
      return isRequired ? outputLong : outputLong.optional();
    case "char":
      const outputChar = z
        .string()
        .length(1, "This field must be a single character");
      return isRequired ? outputChar : outputChar.optional();
    case "File":
      if (isRequired) {
        return z.union([
          z.file("This field must be a file").min(1, "File cannot be empty"),
          z.string().min(1, "This field is required"),
        ]);
      }
      return z.union([
        z.file(),
        z.string(),
      ]).optional();
    case "boolean":
      return isRequired
        ? z.boolean("This field is required")
        : z.boolean().optional();
    case "string[]":
      return isRequired
        ? z.array(z.string()).min(1, "This field must have at least one item")
        : z.array(z.string()).optional();
    default:
      return z.unknown();
  }
}

function defaultValueForType(type: DynamicFieldType): unknown {
  switch (type) {
    case "string":
    case "char":
    case "byte[]":
      return "";
    case "int":
      return 0;
    case "long":
      return BigInt(0); // Using BigInt for long
    case "boolean":
      return false;
    case "string[]":
      return [];
    case "File":
      return undefined; // Assuming file input starts as undefined
    default:
      return undefined;
  }
}

export function getConnectorZodSchema(connector: Connector) {
  const schemaShape: Record<string, z.ZodType> = {};
  const defaultValues: Record<string, unknown> = {};

  connector.configurationProperties.forEach((property) => {
    schemaShape[property.name] = typeToZodType(
      property.type,
      property.required ?? false
    );
    defaultValues[property.name] = defaultValueForType(property.type);
  });

  return {
    schema: z.object(schemaShape),
    defaultValues,
  };
}

export type ConnectorFormSchemaType = z.infer<
  ReturnType<typeof getConnectorZodSchema>["schema"]
>;
