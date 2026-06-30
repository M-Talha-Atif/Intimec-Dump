"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReactNode } from "react";

type TabItem = {
  value: string;
  label: string;
  icon?: ReactNode;
};

type StandardTabsProps = {
  tabs: TabItem[];
  value: string;
  onValueChange: (value: string) => void;
};

export default function StandardTabs({ tabs }: StandardTabsProps) {
  return (
    <TabsList className="grid w-full max-w-md h-12 grid-cols-2">
      {tabs.map((tab) => (
        <TabsTrigger
          key={tab.value}
          value={tab.value}
          className="text-sm font-semibold flex items-center"
        >
          <span className="mr-2">{tab.icon}</span>
          {tab.label}
        </TabsTrigger>
      ))}
    </TabsList>
  );
}