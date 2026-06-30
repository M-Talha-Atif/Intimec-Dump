
"use client"

import * as React from "react"
import { useTranslation } from "react-i18next";
import { Pie, PieChart, Cell } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";

const chartData = [
  { type: "human", count: 75, fill: "var(--color-human)" },
  { type: "nonHuman", count: 25, fill: "var(--color-nonHuman)" },
]

const chartConfig = {
  count: {
    label: "Count",
  },
  human: {
    label: "Human",
    color: "hsl(var(--chart-1))",
  },
  nonHuman: {
    label: "Non-Human",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

const PrivilegedIdentitiesBreakdown = () => {
  const { t } = useTranslation();
  
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>{t('dashboard.privilegedIdentities')}</CardTitle>
        <CardDescription>{t('dashboard.humanVsNonHuman')}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="type"
              innerRadius={60}
              strokeWidth={5}
            >
              {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey="type" />}
              className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export default PrivilegedIdentitiesBreakdown;
