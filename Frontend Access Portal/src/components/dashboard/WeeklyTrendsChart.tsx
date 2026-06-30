"use client"

import * as React from "react"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartConfig } from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { Focus } from "lucide-react";
import { cn } from "@/lib/utils";

const chartData = [
  { day: 'Mon', grants: 25, revokes: 15, dormant: 5 },
  { day: 'Tue', grants: 30, revokes: 12, dormant: 3 },
  { day: 'Wed', grants: 28, revokes: 18, dormant: 6 },
  { day: 'Thu', grants: 35, revokes: 20, dormant: 4 },
  { day: 'Fri', grants: 45, revokes: 25, dormant: 8 },
  { day: 'Sat', grants: 15, revokes: 8, dormant: 2 },
  { day: 'Sun', grants: 10, revokes: 5, dormant: 1 },
];

const chartConfig = {
  grants: {
    label: "Access Grants",
    color: "hsl(var(--chart-1))",
  },
  revokes: {
    label: "Access Revokes",
    color: "hsl(var(--chart-2))",
  },
  dormant: {
    label: "Dormant Detections",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;


const WeeklyTrendsChart = () => {
    const [focus, setFocus] = React.useState(false)

    React.useEffect(() => {
        if (!focus) return
        function handleEsc(e: KeyboardEvent) {
          if (e.key === "Escape") setFocus(false)
        }
        window.addEventListener("keydown", handleEsc)
        return () => window.removeEventListener("keydown", handleEsc)
    }, [focus])

    const WidgetContent = (
      <>
        <CardHeader className="relative">
            <CardTitle>Weekly Trends</CardTitle>
            <CardDescription>Access grants, revokes, dormant detection</CardDescription>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Focus on chart"
              className="absolute top-4 right-4 p-1"
              onClick={() => setFocus(true)}
            >
              <Focus className="w-5 h-5" />
            </Button>
        </CardHeader>
        <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                <LineChart accessibilityLayer data={chartData} margin={{ top: 20, left: 12, right: 12 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                        dataKey="day"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                    />
                    <YAxis />
                    <Tooltip cursor={false} content={<ChartTooltipContent />} />
                    <Legend content={<ChartLegendContent />} />
                    <Line type="monotone" dataKey="grants" stroke="var(--color-grants)" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="revokes" stroke="var(--color-revokes)" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="dormant" stroke="var(--color-dormant)" strokeWidth={2} dot={false} />
                </LineChart>
            </ChartContainer>
        </CardContent>
      </>
    )

    return (
      <>
        {!focus ? (
          <Card>
            {WidgetContent}
          </Card>
        ) : (
          <div
            className={cn(
              "fixed inset-0 z-50 bg-black/60 flex items-center justify-center transition-all",
              focus && "animate-in fade-in-0"
            )}
          >
            <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto relative shadow-2xl ring-2 ring-primary ring-offset-4">
              <button
                aria-label="Exit focus"
                className="absolute top-3 right-3 z-10 bg-white rounded-full shadow p-1 hover:bg-gray-200 transition"
                onClick={() => setFocus(false)}
              >
                <span className="text-xl font-bold">&times;</span>
              </button>
              {WidgetContent}
            </Card>
          </div>
        )}
      </>
    );
};

export default WeeklyTrendsChart;
