"use client";

import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { useForm, FormProvider, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  passwordPoliciesSchema,
  passwordPolicies,
  defaultSecurityConfig,
} from "./passwordPoliciesSchema";

import { PasswordPolicyCard } from "./cards/PasswordPolicyCard";
import { PasswordExpiryCard } from "./cards/PasswordExpiryCard";
import { LockoutPolicyCard } from "./cards/LockoutPolicyCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { toast } from "sonner";

// Import our simple navigation guard components
import { useSimpleNavigationGuard } from "@/hooks/useNavigationGuard";
import { SimpleConfirmDialog } from "@/components/ui/ConfirmDialog";

/**
 * Interface for the methods we expose to parent components
 * This allows the parent to check if this form has unsaved changes
 */
export interface PasswordPoliciesFormRef {
  hasUnsavedChanges: () => boolean;
}


function mapApiToPasswordPolicies(dataPP: any, dataAL: any): passwordPolicies {
  return {
    passwordPolicy: {
      minLength: dataPP.minPasswordLength,
      requireNumber: dataPP.requireDigits,
      requireSymbol: dataPP.requireSpecialChars,
      requireLowercase: dataPP.requireLowercase,
      requireUppercase: dataPP.requireUppercase,
      enableDictionaryCheck: false, // API does not provide this
      customBannedWords: dataPP.bannedSubstrings ?? [],
      passwordHistoryCount: dataPP.passwordHistoryCount,
      disallowUsernameInPassword: dataPP.disallowUsernameOrEmail,
    },
    passwordExpiry: {
      maxValidityDays: dataPP.maxPasswordValidityDays,
      warnAfterDays: dataPP.passwordExpirationNotificationDays,
    },
    lockoutPolicy: {
      maxFailedAttempts: dataAL.maxFailedLoginAttempts,
      lockoutDurationMinutes: dataAL.lockoutDurationMinutes,
      enableProgressiveBackoff: false, // API does not provide this
      baseDelaySeconds: dataAL.increaseDelayAfterFailureSeconds,
    },
  };
}

/**
 * Password Policies Form Component with Navigation Guard
 * 
 * This form automatically protects against losing unsaved changes when:
 * 1. User tries to navigate to another page
 * 2. User clicks browser back/forward
 * 3. User refreshes the page or closes tab
 * 
 * It shows a simple dialog with two options:
 * - Cancel: Stay on the page
 * - Ignore Changes: Leave and lose changes
 */
const PasswordPoliciesForm = forwardRef<PasswordPoliciesFormRef>((props, ref) => {
  const methods = useForm<passwordPolicies>({
    resolver: zodResolver(passwordPoliciesSchema),
    defaultValues: defaultSecurityConfig,
    mode: "onChange",
  });

  const {
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting },
  } = methods;

  const [firstTime, setFirstTime] = useState(true);
  const loadedData = useRef(false);

  /**
   * Setup navigation guard to protect against losing unsaved changes
   * 
   * - hasUnsavedChanges: Uses React Hook Form's isDirty to detect changes
   * - message: Custom message explaining the situation to the user
   */
  const navigationGuard = useSimpleNavigationGuard({
    hasUnsavedChanges: isDirty,
    message: "You have unsaved password policy changes. If you leave now, your changes will be lost.",
  });

  /**
   * Expose methods to parent component via ref
   * This allows the parent (LoginSecurityForm) to check if we have unsaved changes
   */
  useImperativeHandle(ref, () => ({
    hasUnsavedChanges: () => isDirty,
  }));
  // 🔹 Load from API
  const loadDataFromAPI = async () => {
    try {
      const res = await fetch("/api/password-policies");
      if (!res.ok) throw new Error("Failed to fetch config");

      const data = await res.json();
      const { dataPP, dataAL } = data.data

      const mappedData = mapApiToPasswordPolicies(dataPP, dataAL);

      // console.log("Password Policy Data:", mappedData);

      reset(mappedData, { keepDirty: false }); // ✅ load API into form
      setFirstTime(false);
    } catch (error) {
      console.log(error)
      // fallback to defaults
      reset(defaultSecurityConfig, { keepDirty: false });
    }
  };


  // 🔹 Save to API
  const sendDataToAPI = async (data: passwordPolicies) => {
    // console.log("Sending to API:", data);
    if (!firstTime) {
      try {
        const res = await fetch(`/api/password-policies`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
        if (!res.ok) throw new Error("Failed to delete");
        reset(data, { keepDirty: false });
        toast("Updated successfully ✅", {
          description: "Password Policies Updated successfully.",
        });
      } catch (error) {
        toast("Failed to update ❌", {
          description: "Failed to Update Password Policies",
        });
      }
    } else {
      try {
        const res = await fetch(`/api/password-policies`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
        if (!res.ok) throw new Error("Failed to delete");
        reset(data, { keepDirty: false });
        toast("Added successfully ✅", {
          description: "Password Policies added successfully.",
        });
      } catch (error) {
        toast("Failed to add ❌", {
          description: "Failed to add Password Policies",
        });
      }
    }
  };

  useEffect(() => {
    if (!loadedData.current) {
      loadDataFromAPI();
      loadedData.current = true;
    }
  }, []);

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(sendDataToAPI)}
        className="flex flex-col gap-6 rounded-xl"
      >
        <PasswordPolicySection />
        <PasswordExpirySection />
        <LockoutPolicySection />

        <div className="flex justify-end items-center gap-3">
          {/* Show "Unsaved Changes" badge when form is dirty */}
          {isDirty && (
            <Badge
              variant="secondary"
              className="bg-yellow-100 text-yellow-800"
            >
              Unsaved Changes
            </Badge>
          )}
          <Button disabled={!isDirty || isSubmitting} type="submit">
            <Save className="h-4 w-4 mr-2" />
            Apply Changes
          </Button>
        </div>
      </form>

      {/* 
        Simple confirmation dialog for navigation with unsaved changes
        
        This dialog will automatically appear when:
        1. User has unsaved changes (isDirty is true)
        2. User tries to navigate away (click links, browser back, etc.)
        
        The dialog offers two choices:
        - Cancel: Stay on the page, keep working
        - Ignore Changes: Leave the page, lose all unsaved changes
      */}
      <SimpleConfirmDialog
        open={navigationGuard.showDialog}
        message={navigationGuard.message}
        onIgnoreChanges={navigationGuard.onIgnoreChanges}
        onCancel={navigationGuard.onCancel}
      />
    </FormProvider>
  );
});

// Set display name for debugging
PasswordPoliciesForm.displayName = "PasswordPoliciesForm";

export default PasswordPoliciesForm;

/**
 * Helper component for the Password Policy section
 * Contains the card and handles its state management
 */
function PasswordPolicySection() {
  const { watch, setValue, formState } = useFormContext<passwordPolicies>();
  return (
    <PasswordPolicyCard
      config={watch("passwordPolicy")}
      onChange={(updates) =>
        setValue(
          "passwordPolicy",
          { ...watch("passwordPolicy"), ...updates },
          { shouldDirty: true }
        )
      }
      errors={formState.errors.passwordPolicy as Record<string, string>}
    />
  );
}

/**
 * Helper component for the Password Expiry section
 * Contains the card and handles its state management
 */
function PasswordExpirySection() {
  const { watch, setValue, formState } = useFormContext<passwordPolicies>();
  return (
    <PasswordExpiryCard
      config={watch("passwordExpiry")}
      onChange={(updates) =>
        setValue(
          "passwordExpiry",
          { ...watch("passwordExpiry"), ...updates },
          { shouldDirty: true }
        )
      }
      errors={formState.errors.passwordExpiry as Record<string, string>}
    />
  );
}

/**
 * Helper component for the Lockout Policy section
 * Contains the card and handles its state management
 */
function LockoutPolicySection() {
  const { watch, setValue, formState } = useFormContext<passwordPolicies>();
  return (
    <LockoutPolicyCard
      config={watch("lockoutPolicy")}
      onChange={(updates) =>
        setValue(
          "lockoutPolicy",
          { ...watch("lockoutPolicy"), ...updates },
          { shouldDirty: true }
        )
      }
      errors={formState.errors.lockoutPolicy as Record<string, string>}
    />
  );
}
