import { z } from "zod";

const passwordPolicySchema = z.object({
    minLength: z
        .number()
        .min(6, "Password length must be between 6 and 128 characters")
        .max(128, "Password length must be between 6 and 128 characters"),

    requireNumber: z.boolean(),
    requireSymbol: z.boolean(),
    requireLowercase: z.boolean(),
    requireUppercase: z.boolean(),
    enableDictionaryCheck: z.boolean(),
    customBannedWords: z.array(z.string()), // allow empty string
    passwordHistoryCount: z
        .number()
        .min(0, "Password history count must be between 0 and 50")
        .max(50, "Password history count must be between 0 and 50"),

    disallowUsernameInPassword: z.boolean(),
});

const passwordExpirySchema = z
    .object({
        maxValidityDays: z
            .number()
            .min(0, "Validity period must be between 0 and 730 days")
            .max(730, "Validity period must be between 0 and 730 days"),
        warnAfterDays: z.number().min(0, "Warning period must be >= 0"),
    })
    .refine(
        (data) =>
            data.maxValidityDays === 0 || data.warnAfterDays < data.maxValidityDays,
        {
            message: "Warning period must be less than validity period",
            path: ["warnAfterDays"],
        }
    );

const lockoutPolicySchema = z.object({
    maxFailedAttempts: z
        .number()
        .min(0, "Failed attempts must be between 0 and 20")
        .max(20, "Failed attempts must be between 0 and 20"),
    lockoutDurationMinutes: z
        .number()
        .min(1, "Lockout duration must be between 1 and 1440 minutes")
        .max(1440, "Lockout duration must be between 1 and 1440 minutes"),
    enableProgressiveBackoff: z.boolean(),
    baseDelaySeconds: z.number().min(0, "Base delay must be >= 0"),
});

// 🔹 Combine all into one parent schema
export const passwordPoliciesSchema = z.object({
    passwordPolicy: passwordPolicySchema,
    passwordExpiry: passwordExpirySchema,
    lockoutPolicy: lockoutPolicySchema,
});

export type passwordPolicies = z.infer<typeof passwordPoliciesSchema>;

export const defaultSecurityConfig: passwordPolicies = {
    passwordPolicy: {
        minLength: 12,
        requireNumber: true,
        requireSymbol: true,
        requireLowercase: true,
        requireUppercase: true,
        enableDictionaryCheck: false,
        customBannedWords: [''],
        passwordHistoryCount: 10,
        disallowUsernameInPassword: true
    },
    passwordExpiry: {
        maxValidityDays: 0,
        warnAfterDays: 0
    },
    lockoutPolicy: {
        maxFailedAttempts: 5,
        lockoutDurationMinutes: 15,
        enableProgressiveBackoff: false,
        baseDelaySeconds: 5
    },
};