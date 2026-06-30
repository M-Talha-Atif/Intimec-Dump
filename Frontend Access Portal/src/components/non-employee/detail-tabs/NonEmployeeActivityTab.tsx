
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  LogIn, 
  Shield, 
  Settings, 
  FileText,
  Clock
} from 'lucide-react';

type NonEmployeeActivityTabProps = {
  nonEmployee: any;
};

const defaultActivities = [
  { id: 'da1', timestamp: '2024-06-21 09:15', type: 'Login', description: 'Logged into Salesforce', risk: 'Low' },
  { id: 'da2', timestamp: '2024-06-20 14:30', type: 'Access', description: 'Access granted to GitHub repository', risk: 'Medium' },
  { id: 'da3', timestamp: '2024-06-19 16:45', type: 'Login', description: 'Logged into Jira', risk: 'Low' },
  { id: 'da4', timestamp: '2024-06-18 11:20', type: 'Config', description: 'Profile information updated', risk: 'Low' },
  { id: 'da5', timestamp: '2024-06-17 08:30', type: 'Login', description: 'Failed login attempt to Confluence', risk: 'High' },
  { id: 'da6', timestamp: '2024-06-15 10:00', type: 'Policy', description: 'Access review completed by sponsor', risk: 'Low' }
];

const filterTypes = ['All', 'Login', 'Access', 'Config', 'Policy'];

export function NonEmployeeActivityTab({ nonEmployee }: NonEmployeeActivityTabProps) {
  const [activeFilter, setActiveFilter] = useState('All');
  const activities = nonEmployee.activity?.length ? nonEmployee.activity : defaultActivities;

  const filteredActivities = activeFilter === 'All' 
    ? activities 
    : activities.filter((a: any) => a.type === activeFilter);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'Login': return LogIn;
      case 'Access': return Shield;
      case 'Config': return Settings;
      case 'Policy': return FileText;
      default: return Activity;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Group activities by time bucket
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const grouped = filteredActivities.reduce((acc: any, activity: any) => {
    const actDate = new Date(activity.timestamp);
    const dateStr = actDate.toISOString().split('T')[0];
    let bucket: string;
    if (dateStr === todayStr) bucket = 'Today';
    else if (actDate >= weekAgo) bucket = 'This Week';
    else bucket = 'Older';
    
    if (!acc[bucket]) acc[bucket] = [];
    acc[bucket].push(activity);
    return acc;
  }, {});

  const bucketOrder = ['Today', 'This Week', 'Older'];

  return (
    <div className="space-y-6 pt-4">
      {/* Filter Buttons */}
      <div className="flex gap-2 flex-wrap">
        {filterTypes.map((filter) => (
          <Button
            key={filter}
            size="sm"
            variant={activeFilter === filter ? 'default' : 'outline'}
            onClick={() => setActiveFilter(filter)}
          >
            {filter}
          </Button>
        ))}
      </div>

      {/* Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Activity Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {activities.filter((a: any) => a.type === 'Login').length}
              </div>
              <div className="text-sm text-slate-600">Logins</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {activities.filter((a: any) => a.type === 'Access').length}
              </div>
              <div className="text-sm text-slate-600">Access Events</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {activities.filter((a: any) => a.type === 'Config').length}
              </div>
              <div className="text-sm text-slate-600">Config Changes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {activities.filter((a: any) => a.risk === 'High').length}
              </div>
              <div className="text-sm text-slate-600">High Risk</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      {bucketOrder.map((bucket) => {
        const items = grouped[bucket];
        if (!items || items.length === 0) return null;
        
        return (
          <Card key={bucket}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{bucket}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {items.map((activity: any) => {
                  const Icon = getActivityIcon(activity.type);
                  return (
                    <div key={activity.id} className="flex items-start space-x-3 py-2 border-b last:border-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{activity.description}</p>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {activity.timestamp}
                          </span>
                          <Badge className={`text-xs ${getRiskColor(activity.risk)}`}>
                            {activity.risk}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {filteredActivities.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No activity found for the selected filter.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
