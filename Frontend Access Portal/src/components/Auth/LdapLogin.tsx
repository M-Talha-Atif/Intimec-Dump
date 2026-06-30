// src/components/auth/LdapLogin.tsx

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Eye, EyeOff, ArrowLeft } from "lucide-react";

// Define the validation schema for the LDAP form
const LdapLoginSchema = z.object({
  identifier: z.string().min(1, { message: "Username is required." }),
  password: z.string().min(1, { message: "Password is required." }),
});

type LdapFormInputs = z.infer<typeof LdapLoginSchema>;

// Define the component props
interface LdapLoginProps {
  onBack: () => void; // A function to return to the main login view
}

export function LdapLogin({ onBack }: LdapLoginProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LdapFormInputs>({
    resolver: zodResolver(LdapLoginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  // Handle form submission to the LDAP endpoint
  const onSubmit = async (data: LdapFormInputs) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`api/auth/login/ldap`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: data.identifier,
          password: data.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Invalid LDAP credentials.");
      }

      toast.success("Login successful!", {
        position: "top-right",
      });

      // On success, redirect to the home page. This allows the app's
      // main layout to detect the new session/token and update the UI.
      // We also refresh to ensure server components re-render.
      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(
        err.message || "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-0 duration-300">
      {/* Header with a back button */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="h-9 w-9"
          aria-label="Back to main login"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h3 className="text-lg font-semibold tracking-tight">
          Continue with LDAP Login
        </h3>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* LDAP Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="identifier">Username</Label>
          <Input
            id="identifier"
            type="text"
            placeholder=""
            {...register("identifier")}
            disabled={isLoading}
            className={errors.identifier ? "border-red-500" : ""}
          />
          {errors.identifier && (
            <p className="text-sm text-red-600">{errors.identifier.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder=""
              {...register("password")}
              disabled={isLoading}
              className={`pr-10 ${errors.password ? "border-red-500" : ""}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              disabled={isLoading}
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full h-11 bg-[#438D98] hover:bg-[#438d98ce] text-white font-semibold"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Verifying...
            </>
          ) : (
            "Log in"
          )}
        </Button>
      </form>
    </div>
  );
}
