import { IdentityType } from "@/types/user";
import { z } from "zod";
import { selectUsersSchema } from "./commonSchema";

export function getDetailsZodSchema(
  connectorIds: string[],
  scopeIds: string[],
  departmentIds: string[],
  schemaIds: string[]
) {
  return z.object({
    // Row1
    name: z.string().min(2, {
      message: "Application name must be at least 2 characters.",
    }),
    icon: z
      .file("Icon must be a valid file.")
      .min(1, "Icon must be a valid file.")
      .max(10 * 1024 * 1024, "Icon size must be less than 10MB.") // 10MB
      .mime(
        [
          "image/png",
          "image/jpeg",
          "image/jpg",
          "image/svg+xml",
          "image/x-icon",
        ],
        "Icon must be a PNG, JPEG, JPG, SVG or ICO file."
      )
      .optional(),

    // Row2
    owner: z.array(selectUsersSchema).min(1, "At least one owner is required"),
    businessOwner: z.array(selectUsersSchema),

    // Row3 is fetched from the API, so we don't define it here.
    connectorId: z
      .string("Application type cannot be empty")
      .refine((val) => connectorIds.includes(val), {
        message: "Application type must be a valid option",
      }),
    category: z
      .array(z.string().min(1, "Category cannot be empty"))
      .refine((tags) => new Set(tags).size === tags.length, {
        message: "Category tags must be unique.",
      })
      .optional(),

    // Row4
    isAuthoritative: z.boolean(),
    schemaId: z
      .string("Application type cannot be empty")
      .refine((val) => schemaIds.includes(val), {
        message: "Select a valid identity type",
      }),

    // Row5
    riskLevel: z.enum(["Low", "Medium", "High"], {
      message: "Risk level must be one of Low, Medium, or High.",
    }),
    complianceLabels: z
      .array(z.string().min(1, "Tag cannot be empty"))
      .refine((tags) => new Set(tags).size === tags.length, {
        message: "Compliance tags must be unique.",
      })
      .optional(),

    // Row 6
    scopes: z
      .array(
        z.object({
          name: z.string().min(1, "Schema name cannot be empty"),
          id: z.string().min(1, "Schema ID cannot be empty"),
        })
      )
      .refine(
        (scopeArr) => scopeArr.every((val) => scopeIds.includes(val.id)),
        "Select a valid scope"
      ),

    department: z
      .object({
        name: z.string().min(1, "Department name cannot be empty"),
        id: z.string().min(1, "Department ID cannot be empty"),
      })
      .nullable()
      .refine(
        (val) => val === null || departmentIds.includes(val.id),
        "Select a valid department"
      ),

    // Row7
    description: z
      .string()
      .max(200, "Description cannot exceed 200 characters.")
      .optional(),
  });
}

export type DetailsFormSchemaType = z.infer<
  ReturnType<typeof getDetailsZodSchema>
>;

export const defaultValues: DetailsFormSchemaType = {
  name: "",
  icon: undefined,
  owner: [],
  businessOwner: [],
  connectorId: "",
  category: [],
  riskLevel: "" as "Low" | "Medium" | "High",
  complianceLabels: [],
  isAuthoritative: false,
  schemaId: "" as IdentityType,
  description: "",
  scopes: [],
  department: null,
};
