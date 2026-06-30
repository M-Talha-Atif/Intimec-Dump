
"use client"

import { useTranslation } from "react-i18next";
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartConfig } from "@/components/ui/chart";

const chartData = [
  { month: 'Jan', creation: 8, usage: 25 },
  { month: 'Feb', creation: 10, usage: 28 },
  { month: 'Mar', creation: 7, usage: 24 },
  { month: 'Apr', creation: 12, usage: 35 },
  { month: 'May', creation: 15, usage: 40 },
  { month: 'Jun', creation: 11, usage: 38 },
];

const chartConfig = {
  creation: {
    label: "Creations",
    color: "hsl(var(--chart-1))",
  },
  usage: {
    label: "Usage",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

const PrivilegedTrendsChart = () => {
  const { t } = useTranslation();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('dashboard.privilegedTrends')}</CardTitle>
        <CardDescription>Creation vs. Usage over the last 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
            <LineChart accessibilityLayer data={chartData} margin={{ left: 12, right: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                />
                <YAxis />
                <Tooltip cursor={false} content={<ChartTooltipContent />} />
                <Legend content={<ChartLegendContent />} />
                <Line type="monotone" dataKey="creation" stroke="var(--color-creation)" strokeWidth={2} />
                <Line type="monotone" dataKey="usage" stroke="var(--color-usage)" strokeWidth={2} />
            </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default PrivilegedTrendsChart;
