import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import InfoTooltip from "./InfoTooltip";
import { useCssVariable } from "@/hooks/useCssVariable";

const riskPostureData = [
  { month: "Mar", score: 78 },
  { month: "Apr", score: 75 },
  { month: "May", score: 73 },
  { month: "Jun", score: 76 },
  { month: "Jul", score: 74 },
  { month: "Aug", score: 71 },
  { month: "Sep", score: 69 },
  { month: "Oct", score: 72 },
  { month: "Nov", score: 74 },
  { month: "Dec", score: 70 },
  { month: "Jan", score: 68 },
  { month: "Feb", score: 72 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-card p-3 shadow-md">
        <p className="text-sm font-medium text-card-foreground">{label}</p>
        <p className="text-sm text-muted-foreground">
          Risk Score: <span className="font-semibold text-card-foreground">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

const RiskPostureChart = () => {

  const primaryColor = useCssVariable("--primary");
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-1.5">
          <CardTitle className="text-base font-semibold">Risk Posture Trend</CardTitle>
          <InfoTooltip text="12-month composite identity risk score trend. A declining trend indicates improving governance posture." side="right" />
        </div>
        <p className="text-xs text-muted-foreground">Composite identity risk score — last 12 months</p>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={riskPostureData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11 }}
                className="fill-muted-foreground"
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[50, 100]}
                tick={{ fontSize: 11 }}
                className="fill-muted-foreground"
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="score"
                stroke={primaryColor}
                strokeWidth={2}
                fill={primaryColor}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default RiskPostureChart;
