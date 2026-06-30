import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush } from 'recharts';
import { TrendingUp, Download, Calendar, ZoomIn, AlertCircle } from 'lucide-react';
import { mockRiskTrends } from '@/services/mockRiskData';

interface TrendAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TrendAnalysisModal: React.FC<TrendAnalysisModalProps> = ({
  isOpen,
  onClose
}) => {
  const [chartType, setChartType] = useState<'area' | 'line' | 'bar'>('area');
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  const getTrendData = () => {
    const days = selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : 90;
    return mockRiskTrends.slice(-days);
  };

  const renderChart = () => {
    const data = getTrendData();

    const commonProps = {
      data,
      margin: { top: 10, right: 30, left: 0, bottom: 0 }
    };

    switch (chartType) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorMedium" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#eab308" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorLow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="critical" stackId="1" stroke="#ef4444" fill="url(#colorCritical)" />
            <Area type="monotone" dataKey="high" stackId="1" stroke="#f97316" fill="url(#colorHigh)" />
            <Area type="monotone" dataKey="medium" stackId="1" stroke="#eab308" fill="url(#colorMedium)" />
            <Area type="monotone" dataKey="low" stackId="1" stroke="#3b82f6" fill="url(#colorLow)" />
            <Brush dataKey="date" height={30} stroke="#8884d8" />
          </AreaChart>
        );
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="critical" stroke="#ef4444" strokeWidth={2} />
            <Line type="monotone" dataKey="high" stroke="#f97316" strokeWidth={2} />
            <Line type="monotone" dataKey="medium" stroke="#eab308" strokeWidth={2} />
            <Line type="monotone" dataKey="low" stroke="#3b82f6" strokeWidth={2} />
            <Brush dataKey="date" height={30} stroke="#8884d8" />
          </LineChart>
        );
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="critical" fill="#ef4444" />
            <Bar dataKey="high" fill="#f97316" />
            <Bar dataKey="medium" fill="#eab308" />
            <Bar dataKey="low" fill="#3b82f6" />
            <Brush dataKey="date" height={30} stroke="#8884d8" />
          </BarChart>
        );
    }
  };

  const getStats = () => {
    const data = getTrendData();
    const latest = data[data.length - 1];
    const previous = data[data.length - 8] || data[0];

    return {
      current: latest.total,
      previous: previous.total,
      change: ((latest.total - previous.total) / previous.total * 100).toFixed(1),
      criticalChange: ((latest.critical - previous.critical) / previous.critical * 100).toFixed(1)
    };
  };

  const stats = getStats();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Risk Trend Analysis</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={onClose}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Stats Overview */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{stats.current}</div>
                <p className="text-xs text-muted-foreground">Total Risks</p>
                <div className={`text-xs mt-1 ${parseFloat(stats.change) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {parseFloat(stats.change) > 0 ? '+' : ''}{stats.change}% from last week
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-red-600">
                  {getTrendData()[getTrendData().length - 1].critical}
                </div>
                <p className="text-xs text-muted-foreground">Critical Risks</p>
                <div className={`text-xs mt-1 ${parseFloat(stats.criticalChange) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {parseFloat(stats.criticalChange) > 0 ? '+' : ''}{stats.criticalChange}%
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-orange-600">
                  {getTrendData()[getTrendData().length - 1].high}
                </div>
                <p className="text-xs text-muted-foreground">High Risks</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-yellow-600">
                  {getTrendData()[getTrendData().length - 1].medium}
                </div>
                <p className="text-xs text-muted-foreground">Medium Risks</p>
              </CardContent>
            </Card>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Badge
                variant={selectedPeriod === '7d' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedPeriod('7d')}
              >
                7 Days
              </Badge>
              <Badge
                variant={selectedPeriod === '30d' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedPeriod('30d')}
              >
                30 Days
              </Badge>
              <Badge
                variant={selectedPeriod === '90d' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedPeriod('90d')}
              >
                90 Days
              </Badge>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant={chartType === 'area' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('area')}
              >
                Area
              </Button>
              <Button
                variant={chartType === 'line' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('line')}
              >
                Line
              </Button>
              <Button
                variant={chartType === 'bar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('bar')}
              >
                Bar
              </Button>
            </div>
          </div>

          {/* Chart */}
          <Card>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={400}>
                {renderChart()}
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center space-x-2">
                <AlertCircle className="h-4 w-4" />
                <span>Key Insights</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-start space-x-2">
                  <div className="h-2 w-2 rounded-full bg-red-500 mt-1.5" />
                  <p>Critical risks have {parseFloat(stats.criticalChange) > 0 ? 'increased' : 'decreased'} by {Math.abs(parseFloat(stats.criticalChange))}% over the selected period.</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5" />
                  <p>Overall risk trend is {parseFloat(stats.change) > 0 ? 'upward' : 'downward'}, indicating {parseFloat(stats.change) > 0 ? 'increased attention needed' : 'effective risk management'}.</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 mt-1.5" />
                  <p>Recommend focusing remediation efforts on critical and high severity risks first.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
