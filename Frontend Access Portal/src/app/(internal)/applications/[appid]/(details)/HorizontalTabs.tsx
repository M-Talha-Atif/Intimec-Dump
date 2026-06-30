"use client";

import { useSelectedLayoutSegment, useRouter } from "next/navigation";
import { Tabs } from "@/components/ui/tabs";
import IconTabs from "@/components/shared/IconTabs";
import {
  Grid3x3,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

const tabs = [
  { value: "overview", label: "Overview", icon: LayoutDashboard },
  { value: "accounts", label: "Accounts", icon: Users },
  { value: "entitlements", label: "Entitlements", icon: ShieldCheck },
  { value: "access-matrix", label: "Access Matrix", icon: Grid3x3 },
  { value: "ai-analysis", label: "AI Analysis", icon: Sparkles },
];

export default function HorizontalTabs({ appid }: { appid: string }) {
  const segment = useSelectedLayoutSegment();
  const router = useRouter();

  return (
    <Tabs
      value={segment ?? "overview"}
      onValueChange={(v) => router.push(`/applications/${appid}/${v}`)}
    >
      <IconTabs tabs={tabs} columns={5} />
    </Tabs>
  );
}
