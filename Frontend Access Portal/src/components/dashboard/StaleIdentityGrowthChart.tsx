"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartConfig } from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { Focus } from "lucide-react";
import { cn } from "@/lib/utils";

const chartData = [
  { month: 'Jan', staleIdentities: 65, staleEntitlements: 150 },
  { month: 'Feb', staleIdentities: 68, staleEntitlements: 160 },
  { month: 'Mar', staleIdentities: 72, staleEntitlements: 175 },
  { month: 'Apr', staleIdentities: 70, staleEntitlements: 180 },
  { month: 'May', staleIdentities: 75, staleEntitlements: 190 },
  { month: 'Jun', staleIdentities: 80, staleEntitlements: 205 },
];

const chartConfig = {
  staleIdentities: {
    label: "Stale Identities",
    color: "hsl(var(--chart-2))",
  },
  staleEntitlements: {
    label: "Stale Entitlements",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig;

const StaleIdentityGrowthChart = () => {
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
        <CardTitle>Stale Identity & Entitlement Growth</CardTitle>
        <CardDescription>Growth over the last 6 months</CardDescription>
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
            <AreaChart accessibilityLayer data={chartData} margin={{ left: 12, right: 12 }}>
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
                <defs>
                  <linearGradient id="fillStaleIdentities" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-staleIdentities)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--color-staleIdentities)" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="fillStaleEntitlements" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-staleEntitlements)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--color-staleEntitlements)" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="staleIdentities" fill="url(#fillStaleIdentities)" stroke="var(--color-staleIdentities)" />
                <Area type="monotone" dataKey="staleEntitlements" fill="url(#fillStaleEntitlements)" stroke="var(--color-staleEntitlements)" />
            </AreaChart>
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

export default StaleIdentityGrowthChart;
