"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  applications: "Applications",
  identities: "Identity Governance Hub",
  human: "Employee Identities",
  "non-human": "Non-Human Identities",
  "non-employee": "Non-Employee Identities",
  groups: "Identity Groups",
  "access-catalog": "Access Catalog",
  roles: "Role Catalog",
  entitlements: "Entitlement Catalog",
  organization: "Organizations",
  lifecycle: "Lifecycle Management",
  responsibilities: "Responsibilities",
  tasks: "Tasks",
  "owned-roles": "Owned Roles",
  "internal-roles": "Internal Roles",
  team: "My Team",
  "sod-policies": "SoD Policies",
  "access-portal": "Access Portal",
  "access-review": "Access Review",
  campaign: "Campaign",
  workflows: "Workflows",
  "task-center": "Task Center",
  monitoring: "Monitoring",
  "access-analysis": "Access Analysis",
  "risk-analytics": "Risk Analytics",
  reports: "Reports",
  debugging: "Debugging",
  "auditlogs": "Audit Logs",
  settings: "Settings",
};

const getSegmentLabel = (segment: string): string => {
  if (routeLabels[segment]) return routeLabels[segment];

  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function AppBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {/* Home */}
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/" className="flex items-center gap-1">
              <Home className="h-3.5 w-3.5" />
              <span>Home</span>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {segments.map((segment, index) => {
          const path = "/" + segments.slice(0, index + 1).join("/");
          const isLast = index === segments.length - 1;
          const label = getSegmentLabel(segment);

          return (
            <React.Fragment key={path}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={path}>{label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}