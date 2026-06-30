"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

interface PageAccessCheckProps {
  children: React.ReactNode;
}

export default function PageAccessCheck({ children }: PageAccessCheckProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  // Fail-safe: if permission check takes too long, show the page anyway
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isChecking) {
        setHasAccess(true);
        setIsChecking(false);
      }
    }, 3000);
    return () => clearTimeout(timeout);
  }, [isChecking]);

  useEffect(() => {
    const checkAccess = async () => {
      // Skip check for access-denied page itself
      if (pathname === "/access-denied") {
        setHasAccess(true);
        setIsChecking(false);
        return;
      }

      try {
        const response = await fetch(`/api/permissions/pages/check?path=${encodeURIComponent(pathname)}`, {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          
          if (!data.canAccess) {
            // User doesn't have access - redirect to access denied page
            router.push("/access-denied");
            return;
          }
          
          setHasAccess(true);
        } else {
          // On error, allow access (fail open for better UX)
          console.error("Failed to check page access:", response.statusText);
          setHasAccess(true);
        }
      } catch (error) {
        console.error("Error checking page access:", error);
        // On error, allow access (fail open for better UX)
        setHasAccess(true);
      } finally {
        setIsChecking(false);
      }
    };

    checkAccess();
  }, [pathname, router]);

  // Show nothing while checking (prevents flash of unauthorized content)
  if (isChecking) {
    return null;
  }

  // Show children if user has access
  if (hasAccess) {
    return <>{children}</>;
  }

  // Show nothing if redirecting
  return null;
}
