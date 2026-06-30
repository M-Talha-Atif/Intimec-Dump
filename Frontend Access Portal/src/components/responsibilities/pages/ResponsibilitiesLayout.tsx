"use client";

// import { useLocation, useNavigate } from "react-router-dom"; // Keeping these if they are used, or replacing with next/navigation if moving to Next.js fully?
// The user imports 'useRouter' from next/navigation in their snippets.
// I should probably switch ResponsibilitiesLayout to use next/navigation too if it's a Next.js app.
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronRight,
  Home,
  Save,
  RefreshCw,
  HelpCircle,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { useState, ReactNode } from "react";
import { ResponsibilitiesContext } from "./context";

const breadcrumbMap: Record<string, string> = {
  "/responsibilities": "Responsibilities",
  "/responsibilities/tasks": "Tasks",
  "/responsibilities/roles": "Owned Roles",
  "/responsibilities/internal-roles": "Internal Roles",
  "/responsibilities/team": "My Team",
  "/responsibilities/sod-policies": "SoD Policies",
  "/responsibilities/applications": "Applications",
};

export const ResponsibilitiesLayout = ({
  children,
}: {
  children: ReactNode;
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const [globalSearch, setGlobalSearch] = useState("");

  const getBreadcrumbs = () => {
    const paths = pathname?.split("/").filter(Boolean) || [];
    return paths.map((_, index) => {
      const path = "/" + paths.slice(0, index + 1).join("/");
      return {
        path,
        label: breadcrumbMap[path] || paths[index],
      };
    });
  };

  const breadcrumbs = getBreadcrumbs();
  // Simple check for detail page - logic might need adjustment based on exact paths
  // If path is exactly /responsibilities, it's not detail.
  const isDetailPage = pathname !== "/responsibilities";

  return (
    <ResponsibilitiesContext.Provider value={{ globalSearch }}>
      <div className="min-h-screen bg-background">
        {/* Top Navigation Bar */}

        {/* Page Content */}
        <div>{children}</div>
      </div>
    </ResponsibilitiesContext.Provider>
  );
};
