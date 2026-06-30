"use client";
import { useParams, useSelectedLayoutSegment } from "next/navigation";
import Link from "next/link";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export default function Sidebar({
  tabs,
}: {
  tabs: {
    label: React.ReactNode;
    path: string; // instead of value, use a path pattern
  }[];
}) {
  const params = useParams();
  const selectedLayout = useSelectedLayoutSegment();

  const buildPath = (template: string) =>
    template.replace(/:([a-zA-Z]+)/g, (_, key) => {
      const value = params[key];
      return Array.isArray(value) ? value.join("/") : value ?? "";
    });

  return (
    <SidebarMenu className="w-full flex flex-col gap-1 p-2 bg-sidebar rounded-md">
      {tabs.map((tab) => (
        <SidebarMenuItem key={tab.path}>
          <SidebarMenuButton
            asChild
            isActive={buildPath(tab.path).endsWith(selectedLayout ?? "")}
          >
            <Link href={buildPath(tab.path)}>{tab.label}</Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
