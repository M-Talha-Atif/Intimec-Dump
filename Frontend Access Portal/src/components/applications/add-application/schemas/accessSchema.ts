import z from "zod";

export const accessFormSchema = z.discriminatedUnion("timeBoundAccess", [
  z.object({
    timeBoundAccess: z.literal(false),
    accessReview: z.boolean(),
    justInTimeAccess: z.boolean(),
    peerDeviationDetector: z.boolean(),
  }),
  z.object({
    timeBoundAccess: z.literal(true),
    accessReview: z.boolean(),
    justInTimeAccess: z.boolean(),
    peerDeviationDetector: z.boolean(),
    timeBoundSettings: z.object({
      defaultExpiryPeriod: z.number("Select Expiry period in days").min(0),
      autoExtensionPolicy: z.enum(["never", "manual", "automatic"],"Select a valid policy"),
    }),
  }),
]);

export type AccessFormSchemaType = z.infer<typeof accessFormSchema>;