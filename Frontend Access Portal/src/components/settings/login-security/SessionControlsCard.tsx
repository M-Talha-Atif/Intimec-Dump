"use client";

import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { useForm, FormProvider, Controller, useFormContext } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Monitor, RefreshCw, Shield, Clock, Users, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSimpleNavigationGuard } from "@/hooks/useNavigationGuard";
import { SimpleConfirmDialog } from "@/components/ui/ConfirmDialog";


// -----------------------------
// Types & Validation Schema
// -----------------------------
export interface SessionControlsConfig {
  idleTimeoutMinutes: number;
  absoluteSessionLifetimeHours: number;
  forceLogoutOnPasswordChange: boolean;
}

/**
 * Interface for the methods we expose to parent components
 * This allows the parent to check if this form has unsaved changes
 */
export interface SessionControlsCardRef {
  hasUnsavedChanges: () => boolean;
}

const sessionControlsSchema = z.object({
  idleTimeoutMinutes: z
    .number()
    .min(5, "Idle timeout must be between 5 and 1440 minutes")
    .max(1440, "Idle timeout must be between 5 and 1440 minutes"),
  absoluteSessionLifetimeHours: z
    .number()
    .min(1, "Session lifetime must be between 1 and 168 hours")
    .max(168, "Session lifetime must be between 1 and 168 hours"),
  forceLogoutOnPasswordChange: z.boolean(),
});

const defaultValues: SessionControlsConfig = {
  idleTimeoutMinutes: 30,
  absoluteSessionLifetimeHours: 24,
  forceLogoutOnPasswordChange: true,
};
interface ApiResponse {
  forceLogoutOnPasswordChange: boolean;
  id: string;
  jwtExpirationMinutes: number;
  jwtExpirationMs: number;
  refreshTokenExpirationHours: number;
  refreshTokenExpirationMs: number;
  tenantId: string;
}

const mapApiToSessionControls = (data: ApiResponse): SessionControlsConfig => ({
  idleTimeoutMinutes: data.jwtExpirationMinutes,
  absoluteSessionLifetimeHours: data.refreshTokenExpirationHours,
  forceLogoutOnPasswordChange: data.forceLogoutOnPasswordChange,
});


// -----------------------------
// Fields Component
// -----------------------------
const SessionControlsFields: React.FC = () => {
  const {
    control,
    watch,
    formState: { errors },
  } = useFormContext<SessionControlsConfig>();


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Monitor className="h-5 w-5 text-primary" />
          Session Controls
        </CardTitle>
        <CardDescription>
          Manage user session behavior, timeouts, and security policies
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Session Timeouts */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-sm font-medium">Session Timeouts</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="idleTimeout">Idle timeout (minutes)</Label>
              <Controller
                name="idleTimeoutMinutes"
                control={control}
                render={({ field }) => (
                  <Input
                    id="idleTimeout"
                    type="number"
                    min={5}
                    max={1440}
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                )}
              />
              <p className="text-xs text-muted-foreground">
                Auto-logout after {watch("idleTimeoutMinutes")} minutes of inactivity
              </p>
              {errors.idleTimeoutMinutes && (
                <p className="text-sm text-destructive">
                  {errors.idleTimeoutMinutes.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="absoluteTimeout">Absolute session lifetime (hours)</Label>
              <Controller
                name="absoluteSessionLifetimeHours"
                control={control}
                render={({ field }) => (
                  <Input
                    id="absoluteTimeout"
                    type="number"
                    min={1}
                    max={168}
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                )}
              />
              <p className="text-xs text-muted-foreground">
                Force re-authentication after {watch("absoluteSessionLifetimeHours")} hours
              </p>
              {errors.absoluteSessionLifetimeHours && (
                <p className="text-sm text-destructive">
                  {errors.absoluteSessionLifetimeHours.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Security Policies */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-sm font-medium">Security Policies</h4>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="forceLogout">Force logout on password change</Label>
                <p className="text-xs text-muted-foreground">
                  End all sessions when user changes password
                </p>
              </div>
              <Controller
                name="forceLogoutOnPasswordChange"
                control={control}
                render={({ field }) => (
                  <Switch
                    id="forceLogout"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// -----------------------------
// Parent Wrapper
// -----------------------------
export const SessionControlsCard = forwardRef<SessionControlsCardRef>((props, ref) => {
  const methods = useForm<SessionControlsConfig>({
    resolver: zodResolver(sessionControlsSchema),
    defaultValues,
    mode: "onChange",
  });

  const {
    handleSubmit,
    formState: { isDirty, isSubmitting },
    reset,
  } = methods;
  const [firstTime, setFirstTime] = useState(true);
  const loadedData = useRef(false);

  /**
   * Expose methods to parent component via ref
   * This allows the parent (LoginSecurityForm) to check if we have unsaved changes
   */
  useImperativeHandle(ref, () => ({
    hasUnsavedChanges: () => isDirty,
  }));

  const loadDataFromAPI = async () => {
    try {
      const res = await fetch("/api/session-management");
      if (!res.ok) throw new Error("Failed to fetch config");

      const { data } = await res.json();
      // console.log("Session Management Data : ", data);
      const mappedData = mapApiToSessionControls(data)
      // console.log("Session Management Data2 : ", mappedData);

      reset(mappedData, { keepDirty: false });
      setFirstTime(false)

    } catch (error) {
      console.log(error)
    }
  };

  const sendDataToAPI = async (data: SessionControlsConfig) => {
    // console.log("Sending to API:", data);
    if (!firstTime) {
      try {
        const res = await fetch(`/api/session-management`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
        if (!res.ok) throw new Error("Failed to delete");
        reset(data, { keepDirty: false });
        toast("Updated successfully ✅", {
          description: "Session Managment Updated successfully.",
        });
      } catch (error) {
        toast("Failed to update ❌", {
          description: "Failed to Update Session Managment",
        });
      }
    } else {
      try {
        const res = await fetch(`/api/session-management`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
        if (!res.ok) throw new Error("Failed to delete");
        reset(data, { keepDirty: false });
        toast("Added successfully ✅", {
          description: "Session Managment added successfully.",
        });
      } catch (error) {
        toast("Failed to add ❌", {
          description: "Failed to add Session Managment",
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

  const navigationGuard = useSimpleNavigationGuard({
    hasUnsavedChanges: isDirty,
    message: "You have unsaved changes. Are you sure you want to leave?",
  });

  return (
    <>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(sendDataToAPI)} className="space-y-6">
          <SessionControlsFields />

          <div className="flex justify-end items-center gap-3">
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
      </FormProvider>
      <SimpleConfirmDialog
        open={navigationGuard.showDialog}
        message={navigationGuard.message}
        onIgnoreChanges={navigationGuard.onIgnoreChanges}
        onCancel={navigationGuard.onCancel}
      />

    </>
  );
});
