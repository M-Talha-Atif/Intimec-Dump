import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThumbsUp, ThumbsDown, Download, TrendingUp, AlertTriangle, Clock } from 'lucide-react';
import { AIUsageLog, AIAnalytics } from './types/ai-management-types';

const AIUsageMonitoring = () => {
  const [timeRange, setTimeRange] = useState('24h');
  
  const analytics: AIAnalytics = {
    totalRequests: 1247,
    successRate: 98.5,
    averageResponseTime: 1.2,
    topFeatures: [
      { name: 'Access Request Risk', count: 1034 },
      { name: 'Risk Scoring Engine', count: 891 },
      { name: 'Log Analysis & Root Cause', count: 832 },
      { name: 'SoD Violation Detection', count: 678 },
      { name: 'AI Recommendations', count: 523 },
      { name: 'AI Assistant (Global)', count: 456 },
      { name: 'AI Access Review', count: 412 },
      { name: 'Access Matrix Analysis', count: 312 },
      { name: 'Behavioral Analytics', count: 287 },
      { name: 'Log Pattern Detection', count: 245 }
    ],
    errorRate: 1.5,
    userSatisfaction: 4.2
  };

  const logs: AIUsageLog[] = [
    {
      id: '1',
      timestamp: '2024-01-25T14:30:00Z',
      feature: 'Access Request Risk Assessment',
      user: 'john.doe@company.com',
      inputType: 'access request + user context',
      responseTime: 0.8,
      success: true,
      rating: 'positive',
      tokens: 312
    },
    {
      id: '2',
      timestamp: '2024-01-25T14:28:00Z',
      feature: 'Risk Scoring Engine',
      user: 'jane.smith@company.com',
      inputType: 'identity risk factors',
      responseTime: 1.1,
      success: true,
      rating: 'positive',
      tokens: 189
    },
    {
      id: '3',
      timestamp: '2024-01-25T14:25:00Z',
      feature: 'SoD Violation Detection',
      user: 'admin@company.com',
      inputType: 'user entitlements + conflict rules',
      responseTime: 1.5,
      success: true,
      tokens: 267
    },
    {
      id: '4',
      timestamp: '2024-01-25T14:22:00Z',
      feature: 'Log Analysis & Root Cause',
      user: 'sec.ops@company.com',
      inputType: 'log entry',
      responseTime: 2.1,
      success: true,
      tokens: 189
    },
    {
      id: '5',
      timestamp: '2024-01-25T14:20:00Z',
      feature: 'Behavioral Analytics',
      user: 'admin@company.com',
      inputType: 'user activity data',
      responseTime: 3.2,
      success: false,
      error: 'API timeout',
      tokens: 0
    },
    {
      id: '6',
      timestamp: '2024-01-25T14:18:00Z',
      feature: 'Workflow Generation',
      user: 'architect@company.com',
      inputType: 'natural language description',
      responseTime: 2.8,
      success: true,
      rating: 'positive',
      tokens: 445
    },
    {
      id: '7',
      timestamp: '2024-01-25T14:15:00Z',
      feature: 'Compliance Gap Analysis',
      user: 'compliance@company.com',
      inputType: 'governance & compliance data',
      responseTime: 3.5,
      success: true,
      tokens: 523
    }
  ];

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getStatusBadge = (success: boolean) => {
    return success ? (
      <Badge variant="default" className="bg-green-100 text-green-800">Success</Badge>
    ) : (
      <Badge variant="destructive">Failed</Badge>
    );
  };

  const getRatingIcon = (rating?: string) => {
    if (rating === 'positive') return <ThumbsUp className="h-4 w-4 text-green-500" />;
    if (rating === 'negative') return <ThumbsDown className="h-4 w-4 text-red-500" />;
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Requests</p>
                <p className="text-2xl font-bold">{analytics.totalRequests.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Success Rate</p>
                <p className="text-2xl font-bold text-green-600">{analytics.successRate}%</p>
              </div>
              <Badge variant="default" className="bg-green-100 text-green-800">
                Good
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Avg Response</p>
                <p className="text-2xl font-bold">{analytics.averageResponseTime}s</p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Error Rate</p>
                <p className="text-2xl font-bold text-red-600">{analytics.errorRate}%</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Features */}
      <Card>
        <CardHeader>
          <CardTitle>Top AI Features (Last {timeRange})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.topFeatures.map((feature, index) => (
              <div key={feature.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm font-bold flex items-center justify-center">
                    {index + 1}
                  </div>
                  <span className="font-medium">{feature.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">{feature.count} calls</span>
                  <div className="w-24 h-2 bg-slate-200 rounded">
                    <div 
                      className="h-full bg-blue-500 rounded"
                      style={{ width: `${(feature.count / analytics.topFeatures[0].count) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Usage Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Recent AI Usage</span>
            <div className="flex items-center gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Last Hour</SelectItem>
                  <SelectItem value="24h">Last 24h</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Time</th>
                  <th className="text-left p-2 font-medium">Feature</th>
                  <th className="text-left p-2 font-medium">User</th>
                  <th className="text-left p-2 font-medium">Input Type</th>
                  <th className="text-left p-2 font-medium">Response Time</th>
                  <th className="text-left p-2 font-medium">Status</th>
                  <th className="text-left p-2 font-medium">Rating</th>
                  <th className="text-left p-2 font-medium">Tokens</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, index) => (
                  <tr key={log.id} className={index % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                    <td className="p-2 text-sm">{formatTime(log.timestamp)}</td>
                    <td className="p-2 text-sm font-medium">{log.feature}</td>
                    <td className="p-2 text-sm">{log.user}</td>
                    <td className="p-2 text-sm">{log.inputType}</td>
                    <td className="p-2 text-sm">{log.responseTime}s</td>
                    <td className="p-2">{getStatusBadge(log.success)}</td>
                    <td className="p-2">{getRatingIcon(log.rating)}</td>
                    <td className="p-2 text-sm">{log.tokens || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* User Satisfaction */}
      <Card>
        <CardHeader>
          <CardTitle>User Satisfaction</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center space-x-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {analytics.userSatisfaction}/5
              </div>
              <div className="text-sm text-slate-600">Average Rating</div>
            </div>
            <div className="flex space-x-2">
              <div className="flex items-center space-x-1">
                <ThumbsUp className="h-5 w-5 text-green-500" />
                <span className="text-green-600 font-medium">892</span>
              </div>
              <div className="flex items-center space-x-1">
                <ThumbsDown className="h-5 w-5 text-red-500" />
                <span className="text-red-600 font-medium">34</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIUsageMonitoring;
