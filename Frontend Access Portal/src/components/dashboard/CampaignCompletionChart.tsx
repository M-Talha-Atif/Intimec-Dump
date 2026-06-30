"use client"

import * as React from "react"
import { Donut, Focus } from "lucide-react"
import { Pie, PieChart, Tooltip, Cell } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const chartData = [
  { status: "completed", reviews: 350, fill: "var(--color-completed)" },
  { status: "pending", reviews: 80, fill: "var(--color-pending)" },
]

const chartConfig = {
  reviews: {
    label: "Reviews",
  },
  completed: {
    label: "Completed",
    color: "hsl(var(--chart-1))",
  },
  pending: {
    label: "Pending",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export default function CampaignCompletionChart() {
  const [focus, setFocus] = React.useState(false)
  const totalReviews = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.reviews, 0)
  }, [])

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
      <CardHeader className="items-center pb-2 relative">
        <CardTitle>Campaign Completion</CardTitle>
        <CardDescription>Q2 2025 Access Certification</CardDescription>
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
      <CardContent className="flex-1 flex items-center justify-center pb-0">
        <div className="relative">
            <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square max-h-[250px]"
            >
                <PieChart>
                    <Tooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie
                        data={chartData}
                        dataKey="reviews"
                        nameKey="status"
                        innerRadius={60}
                        strokeWidth={5}
                    >
                        {chartData.map((entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={entry.fill}
                            className="stroke-background hover:opacity-80"
                        />
                        ))}
                    </Pie>
                </PieChart>
            </ChartContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center text-center pointer-events-none">
                <Donut className="h-8 w-8 text-muted-foreground" />
                <p className="text-2xl font-bold mt-2">
                    {Math.round(chartData[0].reviews / totalReviews * 100)}%
                </p>
                <p className="text-sm text-muted-foreground">Completed</p>
            </div>
        </div>
      </CardContent>
    </>
  )

  return (
    <>
      {!focus ? (
        <Card className="flex flex-col h-full">
          {WidgetContent}
        </Card>
      ) : (
        <div
          className={cn(
            "fixed inset-0 z-50 bg-black/60 flex items-center justify-center transition-all",
            focus && "animate-in fade-in-0"
          )}
        >
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto relative shadow-2xl ring-2 ring-primary ring-offset-4 flex flex-col">
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
  )
}
