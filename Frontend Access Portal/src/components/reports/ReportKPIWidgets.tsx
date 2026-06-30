
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Download, Calendar, Tag, TrendingUp, AlertCircle } from 'lucide-react';

const scheduledReportsData = [
  { user: 'Admin Team', reports: 12 },
  { user: 'Compliance', reports: 8 },
  { user: 'Security', reports: 6 },
  { user: 'Operations', reports: 4 },
  { user: 'Audit', reports: 3 }
];

const deliveryRateData = [
  { name: 'Success', value: 89, color: '#10b981' },
  { name: 'Failed', value: 8, color: '#ef4444' },
  { name: 'Pending', value: 3, color: '#f59e0b' }
];

const topDownloadsData = [
  { report: 'High Risk Identities', downloads: 156 },
  { report: 'Access Review Status', downloads: 134 },
  { report: 'SoD Violations', downloads: 98 },
  { report: 'Compliance Summary', downloads: 87 },
  { report: 'Identity Lifecycle', downloads: 76 }
];

const tagHeatmapData = [
  { tag: '#SoD', usage: 45, color: '#ef4444' },
  { tag: '#GDPR', usage: 38, color: '#3b82f6' },
  { tag: '#Quarterly', usage: 32, color: '#10b981' },
  { tag: '#Risk', usage: 28, color: '#f59e0b' },
  { tag: '#Compliance', usage: 25, color: '#8b5cf6' },
  { tag: '#Audit', usage: 22, color: '#06b6d4' },
  { tag: '#Identity', usage: 19, color: '#84cc16' },
  { tag: '#Access', usage: 16, color: '#f97316' }
];

export const ReportKPIWidgets = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Scheduled Reports by Team */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-600" />
            <span>Scheduled Reports by Team</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={scheduledReportsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="user" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="reports" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Delivery Success Rate */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span>Delivery Rate</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={deliveryRateData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                dataKey="value"
              >
                {deliveryRateData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center space-x-4 mt-2">
            {deliveryRateData.map((item) => (
              <div key={item.name} className="flex items-center space-x-1">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs">{item.name}: {item.value}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Downloaded Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="h-5 w-5 text-purple-600" />
            <span>Top Downloads</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topDownloadsData.slice(0, 5).map((report, index) => (
              <div key={report.report} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center">
                    {index + 1}
                  </Badge>
                  <span className="text-sm font-medium truncate">{report.report}</span>
                </div>
                <span className="text-sm text-gray-500">{report.downloads}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tag Heatmap */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Tag className="h-5 w-5 text-orange-600" />
            <span>Tag Usage Heatmap</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2">
            {tagHeatmapData.map((tag) => (
              <div 
                key={tag.tag}
                className="relative p-3 rounded-lg text-white text-center font-medium text-sm"
                style={{ 
                  backgroundColor: tag.color,
                  opacity: 0.7 + (tag.usage / 100) * 0.3
                }}
              >
                <div>{tag.tag}</div>
                <div className="text-xs opacity-90">{tag.usage}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-teal-600" />
            <span>Quick Statistics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">47</div>
              <div className="text-sm text-gray-600">Total Reports</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">89%</div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">1,247</div>
              <div className="text-sm text-gray-600">Total Downloads</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">12</div>
              <div className="text-sm text-gray-600">Active Schedules</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
