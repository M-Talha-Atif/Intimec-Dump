"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartConfig } from "@/components/ui/chart";

const chartData = [
  { month: 'Jan', joiners: 32, movers: 18, leavers: 12 },
  { month: 'Feb', joiners: 28, movers: 25, leavers: 15 },
  { month: 'Mar', joiners: 45, movers: 22, leavers: 18 },
  { month: 'Apr', joiners: 38, movers: 30, leavers: 20 },
  { month: 'May', joiners: 42, movers: 28, leavers: 22 },
  { month: 'Jun', joiners: 55, movers: 35, leavers: 25 },
];

const chartConfig = {
  joiners: {
    label: "Joiners",
    color: "hsl(var(--chart-1))",
  },
  movers: {
    label: "Movers",
    color: "hsl(var(--chart-2))",
  },
  leavers: {
    label: "Leavers",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

const LifecycleTrendChart = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lifecycle Tracking</CardTitle>
        <CardDescription>Joiners / Movers / Leavers</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
            <BarChart accessibilityLayer data={chartData} margin={{ top: 20 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                />
                <YAxis />
                <Tooltip cursor={false} content={<ChartTooltipContent />} />
                <Legend content={<ChartLegendContent />} />
                <Bar dataKey="joiners" stackId="a" fill="var(--color-joiners)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="movers" stackId="a" fill="var(--color-movers)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="leavers" stackId="a" fill="var(--color-leavers)" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default LifecycleTrendChart;
