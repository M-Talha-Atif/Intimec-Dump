"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  ChartContainer,
  ChartTooltipContent,
  ChartConfig,
  ChartTooltip,
} from "@/components/ui/chart";

const chartConfig = {
  percentage: {
    label: "% Privileged",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export default function OverviewChart({
  accountAgeData,
}: {
  accountAgeData: { name: string; value: number }[];
}) {
  return (
    <ChartContainer config={chartConfig} className="w-full h-full">
      <BarChart data={accountAgeData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="value" fill={`hsl(var(--chart-1))`} />
      </BarChart>
    </ChartContainer>
  );
}
