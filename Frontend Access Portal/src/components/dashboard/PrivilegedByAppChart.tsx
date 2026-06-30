"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";

const chartData = [
  { app: "AWS", percentage: 35 },
  { app: "Salesforce", percentage: 20 },
  { app: "Okta", percentage: 15 },
  { app: "Azure AD", percentage: 22 },
  { app: "Prod DB", percentage: 40 },
];

const chartConfig = {
  percentage: {
    label: "% Privileged",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

const PrivilegedByAppChart = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Privileged Access by Application</CardTitle>
        <CardDescription>
          Percentage of privileged accounts per app
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{ left: 10 }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="app"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              width={80}
            />
            <XAxis dataKey="percentage" type="number" hide />
            <Tooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar dataKey="percentage" radius={5}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={`hsl(var(--chart-${(index % 5) + 1}))`}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default PrivilegedByAppChart;
