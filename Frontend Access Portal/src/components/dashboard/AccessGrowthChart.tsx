"use client";

import * as React from "react";
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { Focus } from "lucide-react";
import { cn } from "@/lib/utils";

const chartData = [
  { month: "Jan", access: 2150 },
  { month: "Feb", access: 2300 },
  { month: "Mar", access: 2450 },
  { month: "Apr", access: 2200 },
  { month: "May", access: 2500 },
  { month: "Jun", access: 2800 },
];

const chartConfig = {
  access: {
    label: "Access Grants",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export default function AccessGrowthChart() {
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
            <CardTitle>Access Growth</CardTitle>
            <CardDescription>Last 6 months</CardDescription>
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
            <ChartContainer config={chartConfig} className="min-h-[240px] w-full">
                <LineChart accessibilityLayer data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                        dataKey="month"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                    />
                    <YAxis tickLine={false} axisLine={false} />
                    <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                    <Line
                        dataKey="access"
                        type="monotone"
                        stroke="var(--color-access)"
                        strokeWidth={2}
                        dot={true}
                    />
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
}
