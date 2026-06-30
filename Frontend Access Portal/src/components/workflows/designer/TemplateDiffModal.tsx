"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  GitBranch, Plus, Minus, Edit3, RefreshCw, Clock
} from 'lucide-react';

interface DiffItem {
  type: 'node' | 'edge';
  action: 'add' | 'modify' | 'remove';
  id: string;
  current?: any;
  upstream?: any;
  selected: boolean;
}

interface TemplateDiffModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workflowId: string;
  templateId: string;
  onApplyChanges: (changes: Array<{ type: 'node' | 'edge'; id: string; action: 'add' | 'modify' | 'remove' }>) => void;
}

export const TemplateDiffModal: React.FC<TemplateDiffModalProps> = ({
  open,
  onOpenChange,
  workflowId,
  templateId,
  onApplyChanges
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [diffItems, setDiffItems] = useState<DiffItem[]>([]);
  const [selectedAction, setSelectedAction] = useState<'apply' | 'keep' | 'fork'>('apply');

  useEffect(() => {
    if (open && workflowId && templateId) {
      loadTemplateDrift();
    }
  }, [open, workflowId, templateId]);

  const loadTemplateDrift = async () => {
    setIsLoading(true);
    
    // Mock diff data
    setTimeout(() => {
      const mockDiff: DiffItem[] = [
        {
          type: 'node',
          action: 'add',
          id: 'new-approval-node',
          upstream: { id: 'new-approval-node', type: 'approval', data: { label: 'Manager Approval' } },
          selected: true
        },
        {
          type: 'node',
          action: 'modify',
          id: 'existing-node',
          current: { id: 'existing-node', type: 'task', data: { label: 'Old Label' } },
          upstream: { id: 'existing-node', type: 'task', data: { label: 'New Label' } },
          selected: true
        },
        {
          type: 'edge',
          action: 'remove',
          id: 'old-edge',
          current: { id: 'old-edge', source: 'node1', target: 'node2' },
          selected: false
        }
      ];
      
      setDiffItems(mockDiff);
      setIsLoading(false);
    }, 1000);
  };

  const toggleDiffItem = (index: number) => {
    setDiffItems(prev => prev.map((item, i) => 
      i === index ? { ...item, selected: !item.selected } : item
    ));
  };

  const selectAllByAction = (action: string, selected: boolean) => {
    setDiffItems(prev => prev.map(item => 
      item.action === action ? { ...item, selected } : item
    ));
  };

  const handleApplyChanges = () => {
    const selectedItems = diffItems
      .filter(item => item.selected)
      .map(item => ({
        type: item.type,
        id: item.id,
        action: item.action
      }));

    onApplyChanges(selectedItems);
    onOpenChange(false);
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'add': return <Plus className="h-4 w-4 text-green-600" />;
      case 'modify': return <Edit3 className="h-4 w-4 text-blue-600" />;
      case 'remove': return <Minus className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'add': return 'border-l-green-400 bg-green-50';
      case 'modify': return 'border-l-blue-400 bg-blue-50';
      case 'remove': return 'border-l-red-400 bg-red-50';
      default: return 'border-l-gray-400 bg-gray-50';
    }
  };

  const getDiffSummary = () => {
    const added = diffItems.filter(i => i.action === 'add').length;
    const modified = diffItems.filter(i => i.action === 'modify').length;
    const removed = diffItems.filter(i => i.action === 'remove').length;
    return { added, modified, removed };
  };

  const summary = getDiffSummary();

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 animate-spin" />
              Loading Template Diff...
            </DialogTitle>
          </DialogHeader>
          <div className="p-8 text-center text-muted-foreground">
            Analyzing differences between your workflow and the upstream template...
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Template Drift Analysis
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Drift Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center justify-between">
                <span>Drift Summary</span>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Last synced: 2 days ago
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <Card className="border-l-4 border-l-green-400">
                  <CardContent className="p-3 text-center">
                    <div className="text-2xl font-bold text-green-600">{summary.added}</div>
                    <p className="text-xs text-muted-foreground">Added</p>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-blue-400">
                  <CardContent className="p-3 text-center">
                    <div className="text-2xl font-bold text-blue-600">{summary.modified}</div>
                    <p className="text-xs text-muted-foreground">Modified</p>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-red-400">
                  <CardContent className="p-3 text-center">
                    <div className="text-2xl font-bold text-red-600">{summary.removed}</div>
                    <p className="text-xs text-muted-foreground">Removed</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Changes List */}
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Changes</TabsTrigger>
              <TabsTrigger value="add">Added ({summary.added})</TabsTrigger>
              <TabsTrigger value="modify">Modified ({summary.modified})</TabsTrigger>
              <TabsTrigger value="remove">Removed ({summary.removed})</TabsTrigger>
            </TabsList>

            {['all', 'add', 'modify', 'remove'].map(tab => (
              <TabsContent key={tab} value={tab} className="space-y-2 max-h-96 overflow-y-auto">
                {diffItems
                  .filter(item => tab === 'all' || item.action === tab)
                  .map((item, idx) => (
                    <Card key={idx} className={`border-l-4 ${getActionColor(item.action)}`}>
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={item.selected}
                            onCheckedChange={() => toggleDiffItem(idx)}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {getActionIcon(item.action)}
                              <p className="text-sm font-medium">{item.id}</p>
                              <Badge variant="outline" className="text-xs">
                                {item.type}
                              </Badge>
                            </div>
                            {item.action === 'modify' && (
                              <div className="text-xs text-muted-foreground mt-2">
                                <p>Current: {JSON.stringify(item.current?.data || {})}</p>
                                <p>Upstream: {JSON.stringify(item.upstream?.data || {})}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </TabsContent>
            ))}
          </Tabs>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => selectAllByAction('add', true)}>
                Select All Added
              </Button>
              <Button variant="outline" size="sm" onClick={() => selectAllByAction('modify', true)}>
                Select All Modified
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleApplyChanges}>
                Apply Selected Changes ({diffItems.filter(i => i.selected).length})
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
