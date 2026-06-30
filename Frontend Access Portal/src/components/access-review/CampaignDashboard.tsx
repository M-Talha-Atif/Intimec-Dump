import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Activity, Eye, AlertTriangle, TrendingUp, BarChart3, Brain, 
  ArrowUpRight, ArrowDownRight
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import InfoTooltip from "@/components/dashboard/InfoTooltip";

const campaignProgressData = [
  { name: "Q4 User Access", completed: 85, remaining: 15 },
  { name: "SOX Critical App", completed: 92, remaining: 8 },
  { name: "Privileged Access", completed: 67, remaining: 33 },
  { name: "SoD Resolution", completed: 45, remaining: 55 },
  { name: "GDPR Data Access", completed: 100, remaining: 0 },
];

const riskDistributionData = [
  { name: "Low", value: 45, color: "hsl(var(--chart-2))" },
  { name: "Medium", value: 35, color: "hsl(var(--chart-4))" },
  { name: "High", value: 15, color: "hsl(var(--chart-5))" },
  { name: "Critical", value: 5, color: "hsl(var(--destructive))" },
];

const aiInsightsData = [
  { category: "Unused Access", count: 234, trend: "+12%", direction: "up" as const, description: "Entitlements not accessed in 90+ days" },
  { category: "SoD Violations", count: 18, trend: "-8%", direction: "down" as const, description: "Conflicting entitlements across roles" },
  { category: "Orphaned Accounts", count: 56, trend: "+25%", direction: "up" as const, description: "Accounts without active identity owners" },
  { category: "Over-privileged", count: 89, trend: "-15%", direction: "down" as const, description: "Users with excess access beyond role needs" },
];

interface CampaignDashboardProps {
  onCampaignCreate?: (campaign: any) => void;
}

export const CampaignDashboard = ({ onCampaignCreate }: CampaignDashboardProps) => {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1.5">
              Active Campaigns
              <InfoTooltip text="Number of certification campaigns currently in progress requiring reviewer action." />
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3 text-green-600" />
              +2 from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1.5">
              Total Reviews
              <InfoTooltip text="Total number of individual access entitlements under review across all active campaigns." />
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,475</div>
            <p className="text-xs text-muted-foreground">85% completion rate</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1.5">
              Overdue Items
              <InfoTooltip text="Review items that have exceeded their SLA deadline and require immediate escalation or action." />
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">23</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <ArrowDownRight className="h-3 w-3 text-green-600" />
              -5 from last week
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1.5">
              AI Accuracy
              <InfoTooltip text="Percentage of AI-generated review suggestions that were accepted by reviewers without modification." />
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">89%</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3 text-green-600" />
              +3% improvement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-1.5">
              Campaign Progress Overview
              <InfoTooltip text="Stacked view of completion vs remaining items for each active campaign. Helps identify bottlenecks." />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={campaignProgressData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: number) => `${value}%`} />
                  <Bar dataKey="completed" stackId="a" fill="hsl(var(--primary))" name="Completed" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="remaining" stackId="a" fill="hsl(var(--muted))" name="Remaining" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-1.5">
              Risk Distribution
              <InfoTooltip text="Breakdown of all review items by risk level. High and critical items should be prioritized for immediate review." />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {riskDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-1.5">
            <Brain className="h-4 w-4" />
            AI-Powered Insights
            <InfoTooltip text="Machine learning-driven detection of access anomalies, policy violations, and optimization opportunities across all identities." />
          </CardTitle>
          <CardDescription>Automated risk detection and recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {aiInsightsData.map((insight, index) => (
              <div key={index} className="p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-muted-foreground">{insight.category}</p>
                  <Badge variant={insight.direction === 'up' ? "destructive" : "default"} className="text-xs">
                    {insight.direction === 'up' ? (
                      <ArrowUpRight className="h-3 w-3 mr-0.5" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 mr-0.5" />
                    )}
                    {insight.trend}
                  </Badge>
                </div>
                <p className="text-2xl font-bold">{insight.count}</p>
                <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t">
            <Button variant="outline" className="w-full">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Detailed Analytics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
