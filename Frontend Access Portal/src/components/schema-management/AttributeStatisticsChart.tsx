"use client"

import { PolarGrid, RadialBar, RadialBarChart } from "recharts"
import { useSchemaManagement } from "@/contexts/schema-management-context"
import { Skeleton } from "@/components/ui/skeleton"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const attributeTypeConfig = {
  count: {
    label: "Count",
  },
  required: {
    label: "Required",
    color: "hsl(var(--chart-1))",
  },
  sensitive: {
    label: "Sensitive",
    color: "hsl(var(--chart-2))",
  },
  editable: {
    label: "Editable",
    color: "hsl(var(--chart-3))",
  },
  unique: {
    label: "Unique",
    color: "hsl(var(--chart-4))",
  },
  other: {
    label: "Other",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig

export function AttributeStatisticsChart() {
  const { state, getCurrentEntityData } = useSchemaManagement()

  const currentEntityData = getCurrentEntityData()
  const attributes = currentEntityData?.attributes || []

  // Show loading state
  if (state.loadingEntityFields[state.activeEntity]) {
    return (
      <div className="flex justify-center">
        <div className="flex flex-col max-w-md">
          <div className="items-center pb-0">
            <h3 className="text-lg font-semibold">Attribute Types</h3>
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
          <div className="flex-1 pb-0">
            <div className="mx-auto aspect-square max-h-[200px] flex items-center justify-center">
              <Skeleton className="h-[150px] w-[150px] rounded-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!attributes.length) {
    return (
      <div className="flex justify-center">
        <div className="flex flex-col max-w-md">
          <div className="items-center pb-0">
            <h3 className="text-lg font-semibold">Attribute Types</h3>
            <p className="text-sm text-muted-foreground">No attributes available</p>
          </div>
        </div>
      </div>
    )
  }

  // Attribute Types Chart Data
  const totalAttributes = attributes.length
  const requiredCount = attributes.filter(a => a.isRequired).length
  const sensitiveCount = attributes.filter(a => a.isSensitive).length
  const editableCount = attributes.filter(a => a.isEditable).length
  const uniqueCount = attributes.filter(a => a.isUnique).length
  const otherCount = totalAttributes - requiredCount - sensitiveCount - editableCount - uniqueCount

  const attributeTypesData = [
    {
      type: "required",
      count: requiredCount,
      fill: "hsl(var(--chart-1))"
    },
    {
      type: "sensitive",
      count: sensitiveCount,
      fill: "hsl(var(--chart-2))"
    },
    {
      type: "editable",
      count: editableCount,
      fill: "hsl(var(--chart-3))"
    },
    {
      type: "unique",
      count: uniqueCount,
      fill: "hsl(var(--chart-4))"
    },
    {
      type: "other",
      count: otherCount,
      fill: "hsl(var(--chart-5))"
    },
  ].filter(item => item.count > 0)

  return (
    <div className="flex justify-center">
      <div className="flex flex-col max-w-md">
        <div className="items-center pb-0">
          <h3 className="text-lg font-semibold">Attribute Types</h3>
          <p className="text-sm text-muted-foreground">
            Distribution of {totalAttributes} attributes
          </p>
        </div>
        <div className="flex-1 pb-0">
          <ChartContainer
            config={attributeTypeConfig}
            className="mx-auto aspect-square max-h-[200px]"
          >
            <RadialBarChart data={attributeTypesData} innerRadius={30} outerRadius={100}>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel nameKey="type" />}
              />
              <PolarGrid gridType="circle" />
              <RadialBar dataKey="count" />
            </RadialBarChart>
          </ChartContainer>
        </div>
        <div className="flex-col gap-2 text-sm">
          <div className="flex items-center gap-2 leading-none font-medium flex-wrap justify-center">
            {attributeTypesData.map((item, index) => (
              <span key={item.type} className={`text-${item.type === 'required' ? 'red' : item.type === 'sensitive' ? 'yellow' : item.type === 'editable' ? 'green' : item.type === 'unique' ? 'purple' : 'blue'}-600`}>
                {item.count} {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                {index < attributeTypesData.length - 1 && ', '}
              </span>
            ))}
          </div>
          <div className="text-muted-foreground leading-none">
            Attribute type breakdown
          </div>
        </div>
      </div>
    </div>
  )
}
