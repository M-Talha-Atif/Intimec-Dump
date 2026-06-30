
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Settings,
  Eye,
  UserPlus,
  ArrowRight,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { mockDelegations, isActiveDelegation } from '@/types/delegation';
import type { TaskDelegation } from '@/types/delegation';

export const EnhancedDelegationPanel = () => {
  const [selectedDelegation, setSelectedDelegation] = useState<string | null>(null);

  const activeDelegations = mockDelegations.filter(isActiveDelegation);

  const handleEditDelegate = (delegationId: string) => {
    console.log(`Editing delegation: ${delegationId}`);
    setSelectedDelegation(delegationId);
  };

  const handleAutoFallbackSetup = () => {
    console.log('Opening auto-fallback setup wizard');
  };

  const handleEscalationPreview = () => {
    console.log('Opening escalation flow preview');
  };

  const getStatusBadge = (delegation: TaskDelegation) => {
    if (isActiveDelegation(delegation)) {
      return <Badge className="bg-green-100 text-green-800">Active</Badge>;
    }
    return <Badge className="bg-gray-100 text-gray-800">{delegation.status}</Badge>;
  };

  const formatDateRange = (startDate: string, endDate?: string) => {
    const start = new Date(startDate).toLocaleDateString();
    const end = endDate ? new Date(endDate).toLocaleDateString() : 'Indefinite';
    return `${start} - ${end}`;
  };

  const getScopeLabels = (scopes: string[]) => {
    const labels: Record<string, string> = {
      accessReview: 'Access Reviews',
      approvalTask: 'Approval Tasks',
      lifecycleRequest: 'Lifecycle Requests',
      policyViolation: 'Policy Violations'
    };
    return scopes.map(scope => labels[scope] || scope).join(', ');
  };

  const escalationFlow = [
    { level: 1, title: 'Direct Manager', assignee: 'David Kim' },
    { level: 2, title: 'Department Head', assignee: 'Sarah Johnson' },
    { level: 3, title: 'VP Level', assignee: 'Michael Brown' },
    { level: 4, title: 'C-Level', assignee: 'Jennifer Davis' }
  ];

  return (
    <div className="space-y-6">
      {/* Current Delegations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-600" />
              <span>Active Delegation Chains</span>
            </div>
            <Button size="sm" onClick={() => console.log('Adding new delegation')}>
              <UserPlus className="h-4 w-4 mr-1" />
              Add Delegation
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockDelegations.map((delegation) => (
            <div key={delegation.id} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-medium flex items-center">
                    User ID: {delegation.userId}
                    <ArrowRight className="h-4 w-4 mx-2 text-gray-400" />
                    {delegation.delegateName}
                  </div>
                  <div className="text-sm text-gray-600">{delegation.reason || 'No reason provided'}</div>
                </div>
                {getStatusBadge(delegation)}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                <div>
                  <span className="text-gray-500">Valid Period:</span>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDateRange(delegation.startDate, delegation.endDate)}</span>
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Scopes:</span>
                  <div className="flex items-center space-x-1">
                    <Users className="h-3 w-3" />
                    <span className="text-xs">{getScopeLabels(delegation.scopes)}</span>
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Created By:</span>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="h-3 w-3" />
                    <span>{delegation.createdBy}</span>
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Created:</span>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(delegation.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleEditDelegate(delegation.id)}
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Edit Delegate
                </Button>
                <Button variant="outline" size="sm">
                  View History
                </Button>
              </div>
            </div>
          ))}
          
          {mockDelegations.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No active delegations</p>
              <p className="text-sm">Set up delegation chains to ensure coverage during unavailability</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Auto-Fallback Setup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <span>Auto-Fallback Configuration</span>
            </div>
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleAutoFallbackSetup}
            >
              <Settings className="h-4 w-4 mr-1" />
              Auto-Fallback Setup
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">Manager Inactive &gt; 3 days</div>
                <div className="text-sm text-gray-600">Escalate to Next Level Manager</div>
              </div>
              <Badge variant="outline" className="text-green-600 border-green-300">
                <CheckCircle className="h-3 w-3 mr-1" />
                Active
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">No Delegation Set</div>
                <div className="text-sm text-gray-600">Auto-assign to Department Head</div>
              </div>
              <Badge variant="outline" className="text-green-600 border-green-300">
                <CheckCircle className="h-3 w-3 mr-1" />
                Active
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Escalation Flow Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ArrowRight className="h-5 w-5 text-blue-600" />
              <span>Escalation Flow</span>
            </div>
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleEscalationPreview}
            >
              <Eye className="h-4 w-4 mr-1" />
              Preview Flow
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {escalationFlow.map((level, index) => (
              <div key={level.level} className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                  {level.level}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{level.title}</div>
                  <div className="text-sm text-gray-600">{level.assignee}</div>
                </div>
                {index < escalationFlow.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
