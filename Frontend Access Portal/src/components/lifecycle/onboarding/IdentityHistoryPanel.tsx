
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  History, UserPlus, Edit, Pause, Trash2, 
  CheckCircle, Clock, AlertTriangle, Download 
} from 'lucide-react';

interface IdentityHistoryPanelProps {
  identityType: 'employee' | 'non-employee' | 'non-human' | null;
}

const mockHistoryData = [
  {
    id: '1',
    action: 'Identity Created',
    type: 'employee',
    user: 'John Doe',
    actor: 'Sarah Johnson',
    timestamp: '2024-01-15T10:30:00Z',
    status: 'completed',
    details: 'New employee onboarded - Engineering Department'
  },
  {
    id: '2',
    action: 'Access Modified',
    type: 'employee',
    user: 'John Doe',
    actor: 'Michael Chen',
    timestamp: '2024-01-10T14:15:00Z',
    status: 'completed',
    details: 'Added Jira and Confluence access'
  },
  {
    id: '3',
    action: 'Identity Created',
    type: 'non-employee',
    user: 'Maria Rodriguez',
    actor: 'David Kim',
    timestamp: '2024-01-05T09:45:00Z',
    status: 'pending',
    details: 'Contractor onboarding - Marketing consultation'
  },
  {
    id: '4',
    action: 'Identity Disabled',
    type: 'non-human',
    user: 'api-service-old',
    actor: 'System Admin',
    timestamp: '2024-01-02T16:20:00Z',
    status: 'completed',
    details: 'Service account decommissioned'
  },
  {
    id: '5',
    action: 'Risk Assessment',
    type: 'employee',
    user: 'Emily Davis',
    actor: 'Security Team',
    timestamp: '2023-12-28T11:10:00Z',
    status: 'completed',
    details: 'Quarterly risk review - elevated to high risk'
  }
];

export function IdentityHistoryPanel({ identityType }: IdentityHistoryPanelProps) {
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'Identity Created': return UserPlus;
      case 'Access Modified': return Edit;
      case 'Identity Disabled': return Pause;
      case 'Identity Deleted': return Trash2;
      case 'Risk Assessment': return AlertTriangle;
      default: return History;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'failed': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'pending': return Clock;
      case 'failed': return AlertTriangle;
      default: return History;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const filteredHistory = identityType 
    ? mockHistoryData.filter(item => item.type === identityType)
    : mockHistoryData;

  return (
    <div className="space-y-4 h-full overflow-y-auto">
      <div className="sticky top-0 bg-gray-50 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">Recent History</h3>
            <p className="text-sm text-slate-600">
              {identityType ? `${identityType.replace('-', ' ')} lifecycle events` : 'All identity lifecycle events'}
            </p>
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* History Timeline */}
      <div className="space-y-4">
        {filteredHistory.map((event, index) => {
          const ActionIcon = getActionIcon(event.action);
          const StatusIcon = getStatusIcon(event.status);
          const timestamp = formatTimestamp(event.timestamp);

          return (
            <Card key={event.id} className="relative">
              {/* Timeline connector */}
              {index < filteredHistory.length - 1 && (
                <div className="absolute left-6 top-12 w-px h-8 bg-slate-200" />
              )}
              
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <ActionIcon className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-medium text-slate-900">{event.action}</h4>
                        <Badge variant="outline" className="text-xs capitalize">
                          {event.type.replace('-', ' ')}
                        </Badge>
                      </div>
                      
                      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${getStatusColor(event.status)}`}>
                        <StatusIcon className="h-3 w-3" />
                        <span className="capitalize">{event.status}</span>
                      </div>
                    </div>
                    
                    <div className="mt-1">
                      <p className="text-sm text-slate-600">{event.details}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500">
                        <div className="flex items-center space-x-1">
                          <span>Identity:</span>
                          <span className="font-medium">{event.user}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>By:</span>
                          <span className="font-medium">{event.actor}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>{timestamp.date}</span>
                          <span>•</span>
                          <span>{timestamp.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Statistics Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Activity Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {filteredHistory.filter(e => e.status === 'completed').length}
              </div>
              <div className="text-xs text-slate-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {filteredHistory.filter(e => e.status === 'pending').length}
              </div>
              <div className="text-xs text-slate-600">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {filteredHistory.filter(e => e.status === 'failed').length}
              </div>
              <div className="text-xs text-slate-600">Failed</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="space-y-2">
        <Button variant="outline" className="w-full" size="sm">
          View Full Audit Log
        </Button>
        <Button variant="outline" className="w-full" size="sm">
          Generate Compliance Report
        </Button>
      </div>
    </div>
  );
}
