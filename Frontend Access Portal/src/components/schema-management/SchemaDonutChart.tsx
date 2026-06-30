"use client"

import { Pie, PieChart } from "recharts"
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
  optional: {
    label: "Optional",
    color: "hsl(var(--chart-2))",
  },
  sensitive: {
    label: "Sensitive",
    color: "hsl(var(--chart-1))",
  },
  unique: {
    label: "Unique",
    color: "hsl(var(--chart-2))",
  },
  hasDefault: {
    label: "Has Default",
    color: "hsl(var(--chart-3))",
  },
  writable: {
    label: "Writable",
    color: "hsl(var(--chart-1))",
  },
  readOnly: {
    label: "Read Only",
    color: "hsl(var(--chart-2))",
  },
  STRING: {
    label: "String",
    color: "hsl(var(--chart-1))",
  },
  NUMBER: {
    label: "Number",
    color: "hsl(var(--chart-2))",
  },
  BOOLEAN: {
    label: "Boolean",
    color: "hsl(var(--chart-3))",
  },
  DATE: {
    label: "Date",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig

export function SchemaDonutChart() {
  const { state } = useSchemaManagement()

  // Get data from tenant statistics
  const tenantStats = state.tenantStatistics

  // Get entity statistics
  const entityStats = state.entityStatistics

  // Show loading state
  if (state.loadingStates.tenantStatistics || state.loadingStates.entityStatistics) {
    return (
      <div className="space-y-4">
        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Required vs Optional Chart Skeleton */}
          <div className="flex flex-col">
            <div className="items-center pb-2">
              <Skeleton className="h-5 w-32 mb-1 animate-pulse" />
              <Skeleton className="h-4 w-40 animate-pulse" />
            </div>
            <div className="flex-1 pb-2">
              <div className="mx-auto aspect-square max-h-[200px] flex items-center justify-center">
                <div className="relative">
                  <Skeleton className="h-[150px] w-[150px] rounded-full animate-pulse" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Skeleton className="h-8 w-8 rounded-full animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-col gap-2 text-sm space-y-1">
              <div className="flex items-center gap-2 leading-none font-medium flex-wrap justify-center">
                <Skeleton className="h-4 w-16 animate-pulse" />
                <Skeleton className="h-4 w-12 animate-pulse" />
              </div>
              <Skeleton className="h-4 w-24 mx-auto animate-pulse" />
            </div>
          </div>

          {/* Data Types Chart Skeleton */}
          <div className="flex flex-col">
            <div className="items-center pb-2">
              <Skeleton className="h-5 w-20 mb-1 animate-pulse" />
              <Skeleton className="h-4 w-32 animate-pulse" />
            </div>
            <div className="flex-1 pb-2">
              <div className="mx-auto aspect-square max-h-[200px] flex items-center justify-center">
                <div className="relative">
                  <Skeleton className="h-[150px] w-[150px] rounded-full animate-pulse" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Skeleton className="h-8 w-8 rounded-full animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-col gap-2 text-sm space-y-1">
              <div className="flex items-center gap-2 leading-none font-medium flex-wrap justify-center">
                <Skeleton className="h-4 w-12 animate-pulse" />
                <Skeleton className="h-4 w-14 animate-pulse" />
                <Skeleton className="h-4 w-10 animate-pulse" />
              </div>
              <Skeleton className="h-4 w-20 mx-auto animate-pulse" />
            </div>
          </div>

          {/* Attribute Properties Chart Skeleton */}
          <div className="flex flex-col">
            <div className="items-center pb-2">
              <Skeleton className="h-5 w-28 mb-1 animate-pulse" />
              <Skeleton className="h-4 w-36 animate-pulse" />
            </div>
            <div className="flex-1 pb-2">
              <div className="mx-auto aspect-square max-h-[200px] flex items-center justify-center">
                <div className="relative">
                  <Skeleton className="h-[150px] w-[150px] rounded-full animate-pulse" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Skeleton className="h-8 w-8 rounded-full animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-col gap-2 text-sm space-y-1">
              <div className="flex items-center gap-2 leading-none font-medium flex-wrap justify-center">
                <Skeleton className="h-4 w-18 animate-pulse" />
                <Skeleton className="h-4 w-16 animate-pulse" />
              </div>
              <Skeleton className="h-4 w-22 mx-auto animate-pulse" />
            </div>
          </div>

          {/* Permissions Chart Skeleton */}
          <div className="flex flex-col">
            <div className="items-center pb-2">
              <Skeleton className="h-5 w-24 mb-1 animate-pulse" />
              <Skeleton className="h-4 w-28 animate-pulse" />
            </div>
            <div className="flex-1 pb-2">
              <div className="mx-auto aspect-square max-h-[200px] flex items-center justify-center">
                <div className="relative">
                  <Skeleton className="h-[150px] w-[150px] rounded-full animate-pulse" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Skeleton className="h-8 w-8 rounded-full animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-col gap-2 text-sm space-y-1">
              <div className="flex items-center gap-2 leading-none font-medium flex-wrap justify-center">
                <Skeleton className="h-4 w-14 animate-pulse" />
                <Skeleton className="h-4 w-16 animate-pulse" />
              </div>
              <Skeleton className="h-4 w-20 mx-auto animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!tenantStats && !entityStats) {
    return (
      <div className="space-y-4">
        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Required vs Optional Chart */}
          <div className="flex flex-col">
            <div className="items-center pb-2">
              <h3 className="text-lg font-semibold text-foreground">Required vs Optional</h3>
              <p className="text-sm text-muted-foreground">No data available</p>
            </div>
            <div className="flex-1 pb-2">
              <div className="mx-auto aspect-square max-h-[200px] flex items-center justify-center">
                <div className="relative">
                  <div className="h-[150px] w-[150px] rounded-full border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
                    <div className="text-muted-foreground/40 text-sm">No data</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-col gap-2 text-sm">
              <div className="text-muted-foreground leading-none text-center">
                No attributes to display
              </div>
            </div>
          </div>

          {/* Data Types Chart */}
          <div className="flex flex-col">
            <div className="items-center pb-2">
              <h3 className="text-lg font-semibold text-foreground">Data Types</h3>
              <p className="text-sm text-muted-foreground">No data available</p>
            </div>
            <div className="flex-1 pb-2">
              <div className="mx-auto aspect-square max-h-[200px] flex items-center justify-center">
                <div className="relative">
                  <div className="h-[150px] w-[150px] rounded-full border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
                    <div className="text-muted-foreground/40 text-sm">No data</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-col gap-2 text-sm">
              <div className="text-muted-foreground leading-none text-center">
                No data types to display
              </div>
            </div>
          </div>

          {/* Attribute Properties Chart */}
          <div className="flex flex-col">
            <div className="items-center pb-2">
              <h3 className="text-lg font-semibold text-foreground">Attribute Properties</h3>
              <p className="text-sm text-muted-foreground">No data available</p>
            </div>
            <div className="flex-1 pb-2">
              <div className="mx-auto aspect-square max-h-[200px] flex items-center justify-center">
                <div className="relative">
                  <div className="h-[150px] w-[150px] rounded-full border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
                    <div className="text-muted-foreground/40 text-sm">No data</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-col gap-2 text-sm">
              <div className="text-muted-foreground leading-none text-center">
                No properties to display
              </div>
            </div>
          </div>

          {/* Permissions Chart */}
          <div className="flex flex-col">
            <div className="items-center pb-2">
              <h3 className="text-lg font-semibold text-foreground">Permissions</h3>
              <p className="text-sm text-muted-foreground">No data available</p>
            </div>
            <div className="flex-1 pb-2">
              <div className="mx-auto aspect-square max-h-[200px] flex items-center justify-center">
                <div className="relative">
                  <div className="h-[150px] w-[150px] rounded-full border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
                    <div className="text-muted-foreground/40 text-sm">No data</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-col gap-2 text-sm">
              <div className="text-muted-foreground leading-none text-center">
                No permissions to display
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Attribute Types Chart Data (Required vs Optional)
  const attributeTypesData = entityStats ? [
    {
      type: "required",
      count: entityStats.requiredAttributes,
      fill: "hsl(var(--chart-1))"
    },
    {
      type: "optional",
      count: entityStats.optionalAttributes,
      fill: "hsl(var(--chart-2))"
    },
  ].filter(item => item.count > 0) : []

  // Data Type Distribution Chart Data
  const dataTypeData = entityStats ? [
    {
      type: "STRING",
      count: entityStats.dataTypeDistribution.STRING,
      fill: "hsl(var(--chart-1))"
    },
    {
      type: "NUMBER",
      count: entityStats.dataTypeDistribution.NUMBER,
      fill: "hsl(var(--chart-2))"
    },
    {
      type: "BOOLEAN",
      count: entityStats.dataTypeDistribution.BOOLEAN,
      fill: "hsl(var(--chart-3))"
    },
    {
      type: "OBJECT",
      count: entityStats.dataTypeDistribution.OBJECT,
      fill: "hsl(var(--chart-4))"
    },
    {
      type: "DATE",
      count: entityStats.dataTypeDistribution.DATE,
      fill: "hsl(var(--chart-5))"
    },
  ].filter(item => item.count > 0) : []

  // Attribute Properties Chart Data
  const attributePropertiesData = entityStats ? [
    {
      type: "sensitive",
      count: entityStats.sensitiveAttributes,
      fill: "hsl(var(--chart-1))"
    },
    {
      type: "unique",
      count: entityStats.uniqueAttributes,
      fill: "hsl(var(--chart-2))"
    },
    {
      type: "hasDefault",
      count: entityStats.attributesWithDefaultValues,
      fill: "hsl(var(--chart-3))"
    },
  ].filter(item => item.count > 0) : []

  // Read/Write Permissions Chart Data
  const permissionsData = entityStats ? [
    {
      type: "writable",
      count: entityStats.writableAttributes,
      fill: "hsl(var(--chart-1))"
    },
    {
      type: "readOnly",
      count: entityStats.readOnlyAttributes,
      fill: "hsl(var(--chart-2))"
    },
  ].filter(item => item.count > 0) : []

  return (
    <div className="space-y-4">
      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Required vs Optional Chart */}
        <div className="flex flex-col">
          <div className="items-center pb-0">
            <h3 className="text-lg font-semibold text-foreground">Required vs Optional</h3>
            <p className="text-sm text-muted-foreground">
              Distribution of {entityStats?.totalAttributes || 0} attributes
            </p>
          </div>
          <div className="flex-1 pb-0">
            <ChartContainer
              config={attributeTypeConfig}
              className="mx-auto aspect-square max-h-[200px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={attributeTypesData}
                  dataKey="count"
                  nameKey="type"
                  innerRadius={50}
                />
              </PieChart>
            </ChartContainer>
          </div>
          <div className="flex-col gap-2 text-sm">
            <div className="flex items-center gap-2 leading-none font-medium flex-wrap justify-center">
              {attributeTypesData.map((item, index) => (
                <span
                  key={item.type}
                  className="text-muted-foreground mb-2"
                  style={{ color: item.fill }}
                >
                  {item.count} {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                  {index < attributeTypesData.length - 1 && ', '}
                </span>
              ))}
            </div>
            <div className="text-muted-foreground leading-none">
              Required vs Optional breakdown
            </div>
          </div>
        </div>

        {/* Data Type Distribution Chart */}
        <div className="flex flex-col">
          <div className="items-center pb-0">
            <h3 className="text-lg font-semibold text-foreground">Data Types</h3>
            <p className="text-sm text-muted-foreground">
              Distribution by data type
            </p>
          </div>
          <div className="flex-1 pb-0">
            <ChartContainer
              config={attributeTypeConfig}
              className="mx-auto aspect-square max-h-[200px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={dataTypeData}
                  dataKey="count"
                  nameKey="type"
                  innerRadius={50}
                />
              </PieChart>
            </ChartContainer>
          </div>
          <div className="flex-col gap-2 text-sm">
            <div className="flex items-center gap-2 leading-none font-medium flex-wrap justify-center">
              {dataTypeData.map((item, index) => (
                <span
                  key={item.type}
                  className="text-muted-foreground mb-2"
                  style={{ color: item.fill }}
                >
                  {item.count} {item.type}
                  {index < dataTypeData.length - 1 && ', '}
                </span>
              ))}
            </div>
            <div className="text-muted-foreground leading-none">
              Data type breakdown
            </div>
          </div>
        </div>

        {/* Attribute Properties Chart */}
        <div className="flex flex-col">
          <div className="items-center pb-0">
            <h3 className="text-lg font-semibold text-foreground">Attribute Properties</h3>
            <p className="text-sm text-muted-foreground">
              Special attribute properties
            </p>
          </div>
          <div className="flex-1 pb-0">
            <ChartContainer
              config={attributeTypeConfig}
              className="mx-auto aspect-square max-h-[200px]"
            >
              <RadialBarChart data={attributePropertiesData} innerRadius={30} outerRadius={100}>
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
              {attributePropertiesData.map((item, index) => (
                <span
                  key={item.type}
                  className="text-muted-foreground mb-2"
                  style={{ color: item.fill }}
                >
                  {item.count} {item.type === 'hasDefault' ? 'Has Default' : item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                  {index < attributePropertiesData.length - 1 && ', '}
                </span>
              ))}
            </div>
            <div className="text-muted-foreground leading-none">
              Property breakdown
            </div>
          </div>
        </div>

        {/* Read/Write Permissions Chart */}
        <div className="flex flex-col">
          <div className="items-center pb-0">
            <h3 className="text-lg font-semibold text-foreground">Permissions</h3>
            <p className="text-sm text-muted-foreground">
              Read/write permissions
            </p>
          </div>
          <div className="flex-1 pb-0">
            <ChartContainer
              config={attributeTypeConfig}
              className="mx-auto aspect-square max-h-[200px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={permissionsData}
                  dataKey="count"
                  nameKey="type"
                  innerRadius={50}
                />
              </PieChart>
            </ChartContainer>
          </div>
          <div className="flex-col gap-2 text-sm">
            <div className="flex items-center gap-2 leading-none font-medium flex-wrap justify-center">
              {permissionsData.map((item, index) => (
                <span
                  key={item.type}
                  className="text-muted-foreground mb-2"
                  style={{ color: item.fill }}
                >
                  {item.count} {item.type === 'writable' ? 'Writable' : 'Read Only'}
                  {index < permissionsData.length - 1 && ', '}
                </span>
              ))}
            </div>
            <div className="text-muted-foreground leading-none">
              Permission breakdown
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
