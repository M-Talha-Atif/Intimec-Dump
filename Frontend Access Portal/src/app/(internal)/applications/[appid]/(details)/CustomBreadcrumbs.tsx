"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";

import { Home } from "lucide-react";
import { useSelectedLayoutSegment } from "next/navigation";

const tabMap: Record<string, string> = {
  overview: "Overview",
  accounts: "Accounts",
  entitlements: "Entitlements",
  "access-matrix": "Access Matrix",
  "ai-analysis": "AI Analysis",
  import: "Import Data",
  "import-history": "History",
  tasks: "Tasks",
};
export default function CustomBreadcrumbs({
  name,
  appid,
}: {
  name: string;
  appid: string;
}) {
  const selectedTab = useSelectedLayoutSegment() ?? "";
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">
            <Home className="w-4 h-4" />
            <span className="sr-only">Home</span>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/applications">Applications</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        {selectedTab === "overview" ? (
          <BreadcrumbItem>
            <BreadcrumbPage>{name}</BreadcrumbPage>
          </BreadcrumbItem>
        ) : (
          <BreadcrumbItem>
            <BreadcrumbLink href={`/applications/${appid}`}>
              {name}
            </BreadcrumbLink>
          </BreadcrumbItem>
        )}
        {selectedTab && selectedTab !== "overview" && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{tabMap[selectedTab]}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export function CustomBreadcrumbsSkeleton({ appid }: { appid?: string }) {
  const selectedTab = useSelectedLayoutSegment() ?? "";
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">
            <Home className="w-4 h-4" />
            <span className="sr-only">Home</span>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/applications">Applications</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        {selectedTab === "overview" ? (
          <BreadcrumbItem>
            <BreadcrumbPage>
              <Skeleton className="w-16 h-4 rounded-full cursor-not-allowed animate-pulse" />
            </BreadcrumbPage>
          </BreadcrumbItem>
        ) : (
          <BreadcrumbItem>
            <BreadcrumbLink href={`/applications/${appid}`}>
              <Skeleton className="w-16 h-4 rounded-full cursor-not-allowed animate-pulse" />
            </BreadcrumbLink>
          </BreadcrumbItem>
        )}
        {selectedTab && selectedTab !== "overview" && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{tabMap[selectedTab]}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
