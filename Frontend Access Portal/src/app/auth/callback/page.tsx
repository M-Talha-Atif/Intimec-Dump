"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const refresh = searchParams.get("refresh");
    if (token && refresh) {
      // Store tokens in cookies (expires in 7 days)
      document.cookie = `auth_token=${token}; path=/; max-age=604800; SameSite=Lax`;
      document.cookie = `refresh_token=${refresh}; path=/; max-age=604800; SameSite=Lax`;
      // Redirect to dashboard
      router.replace("/dashboard");
    } else {
      // If missing tokens, redirect to login with error
      router.replace("/?error=OAuth2+login+failed");
    }
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg font-semibold">Completing login...</div>
    </div>
  );
}
