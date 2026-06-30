import React from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LucideIcon } from "lucide-react";

type TabItem = {
  value: string;
  label: string;
  icon?: LucideIcon;
};  

type IconTabsProps = {
  tabs: TabItem[];
  columns?: number;
};

export default function IconTabs({ tabs, columns = 7 }: IconTabsProps) {
  return (
    <TabsList
      className="grid w-full"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))` }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;

        return (
          <TabsTrigger key={tab.value} value={tab.value}>
            {Icon && <Icon className="h-4 w-4 mr-1" />}
            {tab.label}
          </TabsTrigger>
        );
      })}
    </TabsList>
  );
}