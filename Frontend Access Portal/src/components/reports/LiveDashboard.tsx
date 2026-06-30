
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Users, Shield, Clock, TrendingUp, TrendingDown, Settings } from 'lucide-react';

export const LiveDashboard = () => {
  const widgets = [
    {
      id: 'high-risk-users',
      title: 'High Risk Users',
      value: '23',
      change: '+3',
      trend: 'up',
      icon: AlertTriangle,
      color: 'red',
      description: 'Users with elevated risk scores'
    },
    {
      id: 'pending-certifications',
      title: 'Pending Certifications',
      value: '156',
      change: '-12',
      trend: 'down',
      icon: Shield,
      color: 'orange',
      description: 'Access reviews awaiting completion'
    },
    {
      id: 'active-identities',
      title: 'Active Identities',
      value: '1,247',
      change: '+8',
      trend: 'up',
      icon: Users,
      color: 'blue',
      description: 'Total active user accounts'
    },
    {
      id: 'overdue-tasks',
      title: 'Overdue Tasks',
      value: '42',
      change: '+5',
      trend: 'up',
      icon: Clock,
      color: 'red',
      description: 'Tasks past their due date'
    }
  ];

  const topRiskyUsers = [
    { name: 'John Smith', department: 'Finance', riskScore: 95, reason: 'Excessive privileges' },
    { name: 'Sarah Wilson', department: 'IT', riskScore: 87, reason: 'Unusual access pattern' },
    { name: 'Mike Johnson', department: 'Sales', riskScore: 82, reason: 'Orphaned accounts' },
    { name: 'Lisa Chen', department: 'HR', riskScore: 78, reason: 'SoD violations' },
    { name: 'David Brown', department: 'Marketing', riskScore: 75, reason: 'Stale access rights' }
  ];

  const getDepartmentStats = () => [
    { department: 'Finance', pending: 45, completed: 32, overdue: 8 },
    { department: 'IT', pending: 38, completed: 28, overdue: 5 },
    { department: 'Sales', pending: 29, completed: 41, overdue: 3 },
    { department: 'HR', pending: 22, completed: 35, overdue: 2 },
    { department: 'Marketing', pending: 18, completed: 24, overdue: 1 }
  ];

  const getIconColor = (color: string) => {
    switch (color) {
      case 'red': return 'text-red-600';
      case 'orange': return 'text-orange-600';
      case 'blue': return 'text-blue-600';
      case 'green': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getBackgroundColor = (color: string) => {
    switch (color) {
      case 'red': return 'bg-red-100';
      case 'orange': return 'bg-orange-100';
      case 'blue': return 'bg-blue-100';
      case 'green': return 'bg-green-100';
      default: return 'bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Live Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {widgets.map((widget) => (
          <Card key={widget.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{widget.title}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <p className="text-2xl font-bold text-gray-900">{widget.value}</p>
                    <div className="flex items-center space-x-1">
                      {widget.trend === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-red-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-green-500" />
                      )}
                      <span className={`text-sm font-medium ${
                        widget.trend === 'up' ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {widget.change}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{widget.description}</p>
                </div>
                <div className={`${getBackgroundColor(widget.color)} p-3 rounded-lg`}>
                  <widget.icon className={`h-6 w-6 ${getIconColor(widget.color)}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Risky Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Top 5 Risky Users</span>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topRiskyUsers.map((user, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">{user.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {user.department}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{user.reason}</p>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant="secondary" 
                      className={`${
                        user.riskScore > 90 ? 'bg-red-100 text-red-800' :
                        user.riskScore > 80 ? 'bg-orange-100 text-orange-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {user.riskScore}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Department Certification Status */}
        <Card>
          <CardHeader>
            <CardTitle>Certification Status by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getDepartmentStats().map((dept, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{dept.department}</span>
                    <span className="text-xs text-gray-500">
                      {dept.pending + dept.completed + dept.overdue} total
                    </span>
                  </div>
                  <div className="flex space-x-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="bg-green-500 h-full"
                      style={{ width: `${(dept.completed / (dept.pending + dept.completed + dept.overdue)) * 100}%` }}
                    />
                    <div 
                      className="bg-yellow-500 h-full"
                      style={{ width: `${(dept.pending / (dept.pending + dept.completed + dept.overdue)) * 100}%` }}
                    />
                    <div 
                      className="bg-red-500 h-full"
                      style={{ width: `${(dept.overdue / (dept.pending + dept.completed + dept.overdue)) * 100}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>✓ {dept.completed} completed</span>
                    <span>⏳ {dept.pending} pending</span>
                    <span>⚠️ {dept.overdue} overdue</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
