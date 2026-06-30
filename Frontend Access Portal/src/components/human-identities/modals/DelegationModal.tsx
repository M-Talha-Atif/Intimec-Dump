
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, User, Clock, CheckCircle, AlertCircle, Users } from 'lucide-react';

interface DelegationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  onConfirm: (delegation: DelegationConfig) => Promise<void>;
}

interface DelegationConfig {
  delegateUserId: string;
  delegateName: string;
  startDate: string;
  endDate?: string;
  scopes: string[];
  reason?: string;
}

interface DelegationScope {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  estimatedTasks: number;
}

const delegationScopes: DelegationScope[] = [
  {
    id: 'accessReview',
    label: 'Access Reviews',
    description: 'Quarterly and ad-hoc access certification reviews',
    icon: <CheckCircle className="h-4 w-4" />,
    estimatedTasks: 12
  },
  {
    id: 'approvalTask',
    label: 'Approval Tasks',
    description: 'Access requests and provisioning approvals',
    icon: <CheckCircle className="h-4 w-4" />,
    estimatedTasks: 8
  },
  {
    id: 'lifecycleRequest',
    label: 'Lifecycle Requests',
    description: 'Onboarding, transfers, and termination workflows',
    icon: <Users className="h-4 w-4" />,
    estimatedTasks: 3
  },
  {
    id: 'policyViolation',
    label: 'Policy Violations',
    description: 'Review and remediate policy violation alerts',
    icon: <AlertCircle className="h-4 w-4" />,
    estimatedTasks: 2
  }
];

const mockUsers = [
  { id: 'user_1', name: 'Jane Smith', department: 'Engineering', status: 'Active' },
  { id: 'user_2', name: 'Bob Wilson', department: 'IT Security', status: 'Active' },
  { id: 'user_3', name: 'Carol Davis', department: 'HR', status: 'Active' },
  { id: 'user_4', name: 'Mike Johnson', department: 'Engineering', status: 'Active' },
];

export default function DelegationModal({ isOpen, onClose, userName, onConfirm }: DelegationModalProps) {
  const [selectedDelegate, setSelectedDelegate] = useState<{id: string; name: string} | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedScopes, setSelectedScopes] = useState<string[]>([]);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const filteredUsers = mockUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleScopeToggle = (scopeId: string) => {
    setSelectedScopes(prev =>
      prev.includes(scopeId)
        ? prev.filter(id => id !== scopeId)
        : [...prev, scopeId]
    );
  };

  const handleSubmit = async () => {
    if (!selectedDelegate || !startDate || selectedScopes.length === 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm({
        delegateUserId: selectedDelegate.id,
        delegateName: selectedDelegate.name,
        startDate,
        endDate: endDate || undefined,
        scopes: selectedScopes,
        reason
      });
      onClose();
    } catch (error) {
      console.error('Failed to create delegation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTotalEstimatedTasks = () => {
    return selectedScopes.reduce((total, scopeId) => {
      const scope = delegationScopes.find(s => s.id === scopeId);
      return total + (scope?.estimatedTasks || 0);
    }, 0);
  };

  const resetForm = () => {
    setSelectedDelegate(null);
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setSelectedScopes([]);
    setReason('');
    setShowPreview(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Configure Delegation for {userName}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Delegate Selection */}
          <div className="space-y-3">
            <Label>Select Delegate</Label>
            <div className="relative">
              <Input
                placeholder="Search users by name or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
              <User className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
            </div>
            
            {searchTerm && (
              <div className="border rounded-md max-h-32 overflow-y-auto">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className={`p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 ${
                      selectedDelegate?.id === user.id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => {
                      setSelectedDelegate({ id: user.id, name: user.name });
                      setSearchTerm('');
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-600">{user.department}</div>
                      </div>
                      <Badge variant="outline">{user.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedDelegate && (
              <div className="p-3 bg-blue-50 rounded-md">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{selectedDelegate.name}</div>
                    <div className="text-sm text-gray-600">Selected as delegate</div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDelegate(null)}
                  >
                    Change
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-2">
              <Label>End Date (Optional)</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {/* Delegation Scopes */}
          <div className="space-y-3">
            <Label>Delegation Scope</Label>
            <div className="grid grid-cols-1 gap-3">
              {delegationScopes.map((scope) => (
                <div key={scope.id} className="flex items-start space-x-3 p-3 border rounded-md hover:bg-gray-50">
                  <Checkbox
                    id={scope.id}
                    checked={selectedScopes.includes(scope.id)}
                    onCheckedChange={() => handleScopeToggle(scope.id)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      {scope.icon}
                      <Label htmlFor={scope.id} className="font-medium cursor-pointer">
                        {scope.label}
                      </Label>
                      <Badge variant="secondary" className="text-xs">
                        {scope.estimatedTasks} tasks
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{scope.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label>Reason (Optional)</Label>
            <Input
              placeholder="e.g., Vacation, Medical leave, Business travel..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          {/* Preview Impact */}
          {selectedScopes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Delegation Impact Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Estimated tasks to delegate:</span>
                    <Badge variant="outline">{getTotalEstimatedTasks()} tasks</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Delegation period:</span>
                    <span className="text-sm">
                      {startDate} {endDate ? `to ${endDate}` : '(indefinite)'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Delegate will receive:</span>
                    <span className="text-sm">Email notifications + dashboard access</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedDelegate || !startDate || selectedScopes.length === 0 || isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Delegation'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
