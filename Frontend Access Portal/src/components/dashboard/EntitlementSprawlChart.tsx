
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Sankey } from "recharts";

const sankeyData = {
  nodes: [
    { name: "Users" },
    { name: "Admin Roles" },
    { name: "Standard Roles" },
    { name: "Critical Apps" },
    { name: "General Apps" },
    { name: "HR Systems" },
  ],
  links: [
    { source: 0, target: 1, value: 20 },
    { source: 0, target: 2, value: 80 },
    { source: 1, target: 3, value: 15 },
    { source: 1, target: 4, value: 5 },
    { source: 2, target: 4, value: 70 },
    { source: 2, target: 5, value: 10 },
  ],
};

const chartConfig = {
  value: {
    label: "Entitlements",
  },
  "Users": { label: "Users", color: "hsl(var(--chart-1))" },
  "Admin Roles": { label: "Admin Roles", color: "hsl(var(--chart-2))" },
  "Standard Roles": { label: "Standard Roles", color: "hsl(var(--chart-3))" },
  "Critical Apps": { label: "Critical Apps", color: "hsl(var(--chart-5))" },
  "General Apps": { label: "General Apps", color: "hsl(var(--chart-6))" },
  "HR Systems": { label: "HR Systems", color: "hsl(var(--chart-4))" },
} satisfies ChartConfig;


export default function EntitlementSprawlChart() {
    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Entitlement Sprawl</CardTitle>
                <CardDescription>Flow of entitlements from users to applications</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center min-h-[240px]">
                <ChartContainer config={chartConfig} className="w-full aspect-auto h-64">
                    <Sankey
                        data={sankeyData}
                        nameKey="name"
                        dataKey="value"
                        node={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
                        nodePadding={50}
                        margin={{
                            top: 5,
                            right: 5,
                            bottom: 5,
                            left: 5,
                        }}
                    >
                        <ChartTooltip
                            cursor={{ fill: "hsl(var(--muted))", opacity: 0.2 }}
                            content={<ChartTooltipContent nameKey="name" />}
                        />
                    </Sankey>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
