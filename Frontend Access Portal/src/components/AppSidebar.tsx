"use client";

import {
  AlertTriangle,
  Eye,
  FileText,
  ScrollText,
  Settings,
  LayoutDashboard,
  AppWindow,
  ShieldCheck,
  Building,
  Activity,
  Users,
  Workflow,
  UserCheck,
  Shield,
  RefreshCw,
  CheckSquare,
  Monitor,
  Bug,
  MessageSquare,
  KeyRound,
  LockKeyhole,
  UserPlus
} from "lucide-react";
import { useMemo, useState } from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AppSidebarFooter from "./AppSidebarFooter";
import { useTranslations } from "next-intl";
import { Skeleton } from "./ui/skeleton";
import useSWR from "swr";

const sidebarData = {
  // Core Management
  "core-management": [
    {
      name: "Dashboard", // for handling permissions
      key: "dashboard", // for translations
      icon: LayoutDashboard,
      path: "/dashboard",
    },
    {
      name: "Responsibilities",
      key: "responsibilities",
      icon: Building,
      path: "/responsibilities",
    },
    {
      name: "Applications",
      key: "applications",
      icon: AppWindow,
      path: "/applications",
    },
    { name: "Identities", key: "identities", icon: Users, path: "/identities" },
    {
      name: "Access Catalog",
      key: "access-catalog",
      icon: ShieldCheck,
      path: "/access-catalog",
    },
    {
      name: "Organizations",
      key: "organizations",
      icon: Building,
      path: "/organization",
    },
    {
      name: "Lifecycle",
      key: "lifecycle",
      icon: RefreshCw,
      path: "/lifecycle"
    },
  ],
  // Security & Access
  "security-access": [
    {
      name: "Access Portal",
      key: "access-portal",
      icon: KeyRound,
      path: "/access-portal",
    },
    {
      name: "Access Review",
      key: "access-review",
      icon: UserCheck,
      path: "/access-review",
    },
    {
      name: "Workflows",
      key: "workflows",
      icon: Workflow,
      path: "/workflows",
    },
    {
      name: "SoD Policies",
      key: "sod-policies",
      icon: Shield,
      path: "/sod-policies",
    },
  ],

  // Monitoring & Analytics
  "monitoring-analytics": [
    {
      name: "Task Center",
      key: "task-center",
      icon: CheckSquare,
      path: "/task-center",
    },
    {
      name: "Monitoring",
      key: "monitoring",
      icon: Monitor,
      path: "/monitoring",
    },
    {
      name: "Access Analysis",
      key: "access-analysis",
      icon: Eye,
      path: "/access-analysis",
    },
    { name: "Risk Analytics",
      key: "risk-analytics",
      icon: Activity,
      path: "/risk-analytics"
    },
    {
      name: "Security Alerts",
      key: "security-alerts",
      icon: AlertTriangle,
      path: "/security-alerts",
    },
    {
      name: "Reports",
      key: "reports",
      icon: FileText,
      path: "/reports",
    },
    { name: "Debugging", key: "debugging", icon: Bug, path: "/debugging" },
    {
      name: "Audit Logs",
      key: "audit-logs",
      icon: ScrollText,
      path: "/auditlogs",
    },
    {
      name: "AI Chat",
      key: "ai-chat",
      icon: MessageSquare,
      path: "/ai-chat",
    },
  ],
  system: [
    { name: "Settings", key: "settings", icon: Settings, path: "/settings" },
  ],
} as const;

type SidebarData = typeof sidebarData;
type SectionKey = keyof SidebarData;
type SidebarItem = (typeof sidebarData)[SectionKey][number];

interface PageAccess {
  id: string;
  name: string;
  path: string;
  canAccess: boolean;
  requiresPermission: boolean;
}

interface PageAccessResponse {
  pages: PageAccess[];
  accessiblePages: number;
  totalPages: number;
  tenantId: string;
  userId: string;
}

export default function AppSidebar() {
  const pathname = usePathname();
  const [accessiblePaths, setAccessiblePaths] = useState<Set<string>>(
    new Set(),
  );
  const t = useTranslations("ui.sidebar");

  const { isLoading } = useSWR<PageAccessResponse>(
    "/api/permissions/pages",
    async (url: string) => {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch page access: ${response.statusText}`);
      }
      return response.json();
    },
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
      onSuccess: (data) => {
        const accessible = new Set(
          data.pages.filter((page) => page.canAccess).map((page) => page.path),
        );
        // Paths that are always accessible (new features not yet in backend permissions)
        accessible.add("/responsibilities");
        accessible.add("/lifecycle");
        accessible.add("/risk-analytics");
        setAccessiblePaths(accessible);
      },
      onError: () => {
        // On permission fetch failure, show all sidebar items (fail open)
        const allPaths = new Set(
          (Object.values(sidebarData) as SidebarItem[][]).flat().map((item) => item.path),
        );
        setAccessiblePaths(allPaths);
      },
    },
  );

  // Filter sidebar items based on accessible paths
  const filteredSidebarData = useMemo(() => {
    const filtered = {} as Partial<Record<SectionKey, SidebarItem[]>>;

    (Object.keys(sidebarData) as SectionKey[]).forEach((section) => {
      const items = sidebarData[section];
      const accessibleItems = items.filter((item) =>
        accessiblePaths.has(item.path),
      );

      if (accessibleItems.length > 0) {
        filtered[section] = accessibleItems;
      }
    });

    return filtered;
  }, [accessiblePaths]);

  if (isLoading) return <AppSidebarSkeleton />;

  return (
    <Sidebar
      collapsible="icon"
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
    >
      <SidebarContent>
        {(
          Object.entries(filteredSidebarData) as Array<
            [SectionKey, SidebarItem[]]
          >
        ).map(([section, items]) => (
          <SidebarGroup key={section}>
            <SidebarGroupLabel>{t(section)}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname.startsWith(item.path)}
                    >
                      <Link href={item.path}>
                        <item.icon />
                        <span>{t(item.key)}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
        <SidebarGroup />
      </SidebarContent>
      <AppSidebarFooter />
    </Sidebar>
  );
}

function AppSidebarSkeleton() {
  return (
    <Sidebar
      collapsible="icon"
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
    >
      <SidebarContent>
        {/* Skeleton for sidebar groups */}
        {Array.from({ length: 3 }).map((_, groupIndex) => (
          <SidebarGroup key={groupIndex}>
            {/* Skeleton for group label */}
            <SidebarGroupLabel>
              <Skeleton className="h-4 w-36 bg-muted animate-pulse rounded" />
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {/* Skeleton for menu items */}
                {Array.from({ length: 5 }).map((_, itemIndex) => (
                  <SidebarMenuItem key={itemIndex}>
                    <SidebarMenuButton>
                      <Skeleton className="size-5 shrink-0 bg-muted animate-pulse rounded" />
                      <Skeleton className="h-4 w-full bg-muted animate-pulse rounded" />
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <AppSidebarFooter />
    </Sidebar>
  );
}
