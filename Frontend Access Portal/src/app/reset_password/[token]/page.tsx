"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";
import { useThemeContext } from "@/contexts/themeConfigContext";
import ThemeToggleButton from "@/components/ui/ThemeToggleButton";

export default function ResetPasswordTokenPage({
  params,
}: {
  params: { token: string };
}) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [logoLoaded, setLogoLoaded] = useState(false);
  const { themeConfig, loadingTheme } = useThemeContext();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }
    try {
      const apiUrl = process.env.API_URL || "http://localhost:8090/api/v1";
      const res = await fetch(`${apiUrl}/auth/password/reset/${params.token}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });

      if (!res.ok) {
        // Handle specific HTTP errors
        if (res.status === 400) {
          setError(
            "The password reset link has expired. Please request a new one."
          );
        } else if (res.status === 404) {
          setError("Invalid password reset link. Please request a new one.");
        } else {
          setError("Failed to reset password. Please try again.");
        }
        return;
      }

      const data = await res.json();
      setMessage(data.message || "Your password has been reset successfully.");
      setTimeout(() => router.push("/"), 2000);
    } catch (err) {
      console.error("Password reset error:", err);
      setError("An unexpected error occurred. Please contact support.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-login from-slate-50 to-slate-100 flex flex-col justify-between p-4">
      <ThemeToggleButton isLogin={true} />
      <div className="w-full max-w-md space-y-8 mx-auto my-auto">
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle>
              <div className="relative flex justify-center items-center mx-auto">
                {!logoLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                <Image
                  src={
                    themeConfig?.branding.logoLightData?.url
                      ? `data:${themeConfig?.branding.logoLightData?.mime};base64,${themeConfig?.branding.logoLightData?.url}`
                      : "/Intimec_Logo_Transparent.png"
                  }
                  alt="Intimec Logo"
                  width={108}
                  height={108}
                  className={`mx-auto transition-opacity duration-300 ${
                    logoLoaded ? "opacity-100" : "opacity-0"
                  }`}
                  onLoad={() => setLogoLoaded(true)}
                />
              </div>
            </CardTitle>
            <CardDescription className="text-center text-2xl font-semibold text-black dark:text-white font-sans">
              Set New Password
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {message && (
              <Alert variant="default">
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="newPassword"
                  className="text-sm font-medium w-full text-center block"
                >
                  New Password
                </label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium w-full text-center block"
                >
                  Confirm New Password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="h-11"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-11 bg-primary hover:bg-primary/80 text-black dark:text-white font-medium"
                disabled={loading || !newPassword || !confirmPassword}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 inline-block" />
                    Resetting...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full h-11"
                onClick={() => router.push("/")}
                disabled={loading}
              >
                Back to Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <div className="text-center text-sm text-black dark:text-white mt-8">
        <p>
          Having Difficulties?{" "}
          <button className="text-blue-600 dark:text-blue-400 dark:hover:text-blue-600 hover:text-blue-800 font-medium">
            Contact your administrator
          </button>
        </p>
        <p className="mt-2">© 2025 INTIMEC. All rights reserved.</p>
      </div>
    </div>
  );
}
