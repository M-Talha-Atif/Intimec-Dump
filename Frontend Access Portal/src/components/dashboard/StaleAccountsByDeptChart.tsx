
"use client"

import * as React from "react"
import { Pie, PieChart, Cell } from "recharts"
import { Focus } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartConfig,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const TIME_RANGES = [
  { value: "7d", label: "Last 7 Days" },
  { value: "1m", label: "1 Month" },
  { value: "6m", label: "6 Months" },
  { value: "1y", label: "1 Year" },
]

const IDENTITY_TYPES = [
  { value: "all", label: "All" },
  { value: "human", label: "Human" },
  { value: "non-human", label: "Non-Human" },
]

const DEPARTMENTS = [
  { value: "all", label: "All" },
  { value: "engineering", label: "Engineering" },
  { value: "marketing", label: "Marketing" },
  { value: "sales", label: "Sales" },
  { value: "hr", label: "HR" },
  { value: "finance", label: "Finance" },
  { value: "it", label: "IT" },
  { value: "support", label: "Support" },
]

const RISK_LEVELS = [
  { value: "all", label: "All" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
]

// Example (demo) dataset scoped by time, type, department, risk
const MOCK_DATA = [
  { department: "engineering", accounts: 42, fill: "var(--color-engineering)", type: "human", risk: "medium" },
  { department: "marketing", accounts: 28, fill: "var(--color-marketing)", type: "human", risk: "low" },
  { department: "sales", accounts: 21, fill: "var(--color-sales)", type: "human", risk: "medium" },
  { department: "hr", accounts: 15, fill: "var(--color-hr)", type: "human", risk: "low" },
  { department: "finance", accounts: 10, fill: "var(--color-finance)", type: "human", risk: "medium" },
  { department: "it", accounts: 18, fill: "var(--color-it)", type: "non-human", risk: "high" },
  { department: "support", accounts: 9, fill: "var(--color-support)", type: "non-human", risk: "high" },
]

const chartConfig = {
  accounts: {
    label: "Stale Accounts",
  },
  engineering: {
    label: "Engineering",
    color: "hsl(var(--chart-1))",
  },
  marketing: {
    label: "Marketing",
    color: "hsl(var(--chart-2))",
  },
  sales: {
    label: "Sales",
    color: "hsl(var(--chart-3))",
  },
  hr: {
    label: "HR",
    color: "hsl(var(--chart-4))",
  },
  finance: {
    label: "Finance",
    color: "hsl(var(--chart-5))",
  },
  it: {
    label: "IT",
    color: "hsl(var(--chart-6))",
  },
  support: {
    label: "Support",
    color: "hsl(var(--chart-7))",
  },
} satisfies ChartConfig

function getFilteredData({
  time,
  identityType,
  department,
  risk,
}: { time: string, identityType: string, department: string, risk: string }) {
  // Filter logic - for this demo, just subset/mock data
  return MOCK_DATA.filter(row =>
    (identityType === "all" || row.type === identityType) &&
    (department === "all" || row.department === department) &&
    (risk === "all" || row.risk === risk)
  )
}

export default function StaleAccountsByDeptChart() {
  const [timeRange, setTimeRange] = React.useState("6m")
  const [identityType, setIdentityType] = React.useState("all")
  const [department, setDepartment] = React.useState("all")
  const [risk, setRisk] = React.useState("all")
  const [focus, setFocus] = React.useState(false)

  // Filtered chart data
  const filteredData = React.useMemo(
    () =>
      getFilteredData({
        time: timeRange,
        identityType,
        department,
        risk,
      }),
    [timeRange, identityType, department, risk]
  )

  // Focus mode: add ESC listener
  React.useEffect(() => {
    if (!focus) return
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setFocus(false)
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [focus])

  // Widget content
  const ChartWidget = (
    <>
      <CardHeader className="relative">
        <CardTitle>Stale Accounts by Department</CardTitle>
        <CardDescription>Distribution of stale accounts</CardDescription>
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
        <div className="mb-4 flex flex-wrap gap-2 items-center">
          {/* Quick Filter Toolbar */}
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              {TIME_RANGES.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={identityType} onValueChange={setIdentityType}>
            <SelectTrigger className="w-28">
              <SelectValue placeholder="Identity Type" />
            </SelectTrigger>
            <SelectContent>
              {IDENTITY_TYPES.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              {DEPARTMENTS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={risk} onValueChange={setRisk}>
            <SelectTrigger className="w-28">
              <SelectValue placeholder="Risk" />
            </SelectTrigger>
            <SelectContent>
              {RISK_LEVELS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-center">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <PieChart>
              <Pie data={filteredData} dataKey="accounts" nameKey="department" innerRadius={30} outerRadius={80}>
                {filteredData.map((entry) => (
                  <Cell key={entry.department} fill={entry.fill} />
                ))}
              </Pie>
              <ChartLegend
                content={<ChartLegendContent nameKey="department" />}
                className="-mt-4"
              />
            </PieChart>
          </ChartContainer>
        </div>
        {filteredData.length === 0 && (
          <p className="text-muted-foreground text-center mt-6">No data found for these filters.</p>
        )}
      </CardContent>
    </>
  )

  // Focus modal style
  return (
    <>
      {!focus ? (
        <Card>
          {ChartWidget}
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
            {ChartWidget}
          </Card>
        </div>
      )}
    </>
  )
}
