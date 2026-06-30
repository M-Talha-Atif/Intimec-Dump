
import React, { useState, useEffect } from 'react';
import { TreeNode } from '@/types/hierarchical-delegation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Clock, Save } from 'lucide-react';
import { toast } from 'sonner';

interface ScopeSettingsTabProps {
  nodeId: string;
  node?: TreeNode | null;
  treeNodes: TreeNode[];
}

export function ScopeSettingsTab({ nodeId, node, treeNodes }: ScopeSettingsTabProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'organizational' as TreeNode['type'],
    status: 'active' as TreeNode['status'],
    description: '',
    allowSiblingAccess: false,
    timeWindow: {
      enabled: false,
      start: '',
      end: ''
    }
  });

  const [hasChanges, setHasChanges] = useState(false);

  // Initialize form data when node changes
  useEffect(() => {
    if (node) {
      setFormData({
        name: node.name,
        type: node.type,
        status: node.status,
        description: '', // Could be added to TreeNode interface
        allowSiblingAccess: node.delegates.some(d => d.allowSiblingAccess) || false,
        timeWindow: {
          enabled: false, // Could be derived from node data
          start: '',
          end: ''
        }
      });
      setHasChanges(false);
    }
  }, [node]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleTimeWindowChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      timeWindow: {
        ...prev.timeWindow,
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      // In a real implementation, this would update the node in the tree
      // For now, we'll just simulate the save
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success('Settings saved successfully');
      setHasChanges(false);
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  const isExpired = node?.status === 'expired';
  const isPending = node?.status === 'pending';

  return (
    <div className="space-y-6">
      {/* Status Alerts */}
      {isExpired && (
        <Alert variant="destructive">
          <Clock className="h-4 w-4" />
          <AlertDescription>
            This node has expired and may have limited functionality.
          </AlertDescription>
        </Alert>
      )}

      {isPending && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            This node is pending activation and may not be fully functional yet.
          </AlertDescription>
        </Alert>
      )}

      {formData.timeWindow.enabled && (
        <Alert>
          <Calendar className="h-4 w-4" />
          <AlertDescription>
            Time-windowed access is enabled for this node.
          </AlertDescription>
        </Alert>
      )}

      {/* Basic Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleChange('type', value)}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="organizational">Organizational</SelectItem>
                  <SelectItem value="geographical">Geographical</SelectItem>
                  <SelectItem value="application">Application</SelectItem>
                  <SelectItem value="identity">Identity</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleChange('status', value)}
            >
              <SelectTrigger id="status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Optional description for this scope..."
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Access Policies */}
      <Card>
        <CardHeader>
          <CardTitle>Access Policies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sibling-access">Default Sibling Access</Label>
              <p className="text-sm text-muted-foreground">
                Allow new delegates to access sibling nodes by default
              </p>
            </div>
            <Switch
              id="sibling-access"
              checked={formData.allowSiblingAccess}
              onCheckedChange={(checked) => handleChange('allowSiblingAccess', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Time Window Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Time Window</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="time-window">Enable Time Window</Label>
              <p className="text-sm text-muted-foreground">
                Restrict access to this scope within specific time periods
              </p>
            </div>
            <Switch
              id="time-window"
              checked={formData.timeWindow.enabled}
              onCheckedChange={(checked) => handleTimeWindowChange('enabled', checked)}
            />
          </div>

          {formData.timeWindow.enabled && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="datetime-local"
                  value={formData.timeWindow.start}
                  onChange={(e) => handleTimeWindowChange('start', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="datetime-local"
                  value={formData.timeWindow.end}
                  onChange={(e) => handleTimeWindowChange('end', e.target.value)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={!hasChanges}
          className="min-w-[120px]"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}
