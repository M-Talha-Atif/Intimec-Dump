"use client";

import { useState } from "react";
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

export default function ResetPasswordRequestPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [logoLoaded, setLogoLoaded] = useState(false);
  const { themeConfig, loadingTheme, mode } = useThemeContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const apiUrl = process.env.API_URL || "http://localhost:8090/api/v1";
      const res = await fetch(`${apiUrl}/auth/password/reset-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        // Handle specific HTTP errors
        if (res.status === 404) {
          setError("No account found with this email address.");
        } else if (res.status === 429) {
          setError("Too many requests. Please wait before trying again.");
        } else {
          setError("Failed to send reset link. Please try again.");
        }
        return;
      }

      const data = await res.json();
      setMessage(
        data.message || "A password reset link has been sent to your email."
      );
    } catch (err) {
      console.error("Password reset request error:", err);
      setError("An unexpected error occurred. Please contact support.");
    } finally {
      setLoading(false);
    }
  };
  const logoSrc =
    mode === "light"
      ? themeConfig?.branding.logoLightData?.url
        ? `data:${themeConfig?.branding.logoLightData?.mime};base64,${themeConfig?.branding.logoLightData?.url}`
        : "/image.png"
      : themeConfig?.branding.logoDarkData?.url
        ? `data:${themeConfig?.branding.logoDarkData?.mime};base64,${themeConfig?.branding.logoDarkData?.url}`
        : "/image.png";

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
                  src={logoSrc}
                  alt="Intimec Logo"
                  width={108}
                  height={108}
                  className={`mx-auto transition-opacity duration-300 ${logoLoaded ? "opacity-100" : "opacity-0"
                    }`}
                  onLoad={() => setLogoLoaded(true)}
                />
              </div>
            </CardTitle>
            <CardDescription className="text-center text-2xl font-semibold text-black dark:text-white font-sans">
              Reset Password
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Success/Error Alerts */}
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

            {!message ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium w-full text-center block"
                  >
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="h-11"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-primary hover:bg-primary/80 font-medium"
                  disabled={loading || !email}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 inline-block" />
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11"
                  onClick={() => (window.location.href = "/")}
                  disabled={loading}
                >
                  Back to Login
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11"
                  onClick={() => (window.location.href = "/")}
                >
                  Back to Login
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-black dark:text-white mt-8">
        <p>
          Having Difficulties?{" "}
          <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-600 font-medium">
            Contact your administrator
          </button>
        </p>
        <p className="mt-2">© 2025 INTIMEC. All rights reserved.</p>
      </div>
    </div>
  );
}
