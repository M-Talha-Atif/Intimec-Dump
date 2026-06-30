"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edge } from '@xyflow/react';
import { Trash2 } from 'lucide-react';

interface EnhancedEdgeData {
  type?: string;
  label?: string;
  guard?: string;
  priority?: number;
}

interface EnhancedEdgeEditorProps {
  edge: Edge | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (edgeId: string, data: EnhancedEdgeData) => void;
  onDelete: (edgeId: string) => void;
}

export const EnhancedEdgeEditor: React.FC<EnhancedEdgeEditorProps> = ({
  edge,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
}) => {
  const [edgeType, setEdgeType] = useState<string>('default');
  const [label, setLabel] = useState<string>('');
  const [guard, setGuard] = useState<string>('');
  const [priority, setPriority] = useState<string>('0');

  useEffect(() => {
    if (edge?.data) {
      setEdgeType((edge.data as EnhancedEdgeData).type || 'default');
      setLabel((edge.data as EnhancedEdgeData).label || '');
      setGuard((edge.data as EnhancedEdgeData).guard || '');
      setPriority(String((edge.data as EnhancedEdgeData).priority || 0));
    }
  }, [edge]);

  const handleSave = () => {
    if (!edge) return;

    const data: EnhancedEdgeData = {
      type: edgeType,
      label,
      guard: guard.trim() || undefined,
      priority: parseInt(priority) || 0,
    };

    onUpdate(edge.id, data);
    onClose();
  };

  const handleDelete = () => {
    if (!edge) return;
    if (confirm('Are you sure you want to delete this edge?')) {
      onDelete(edge.id);
      onClose();
    }
  };

  if (!edge) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edge Configuration</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="guard">Guard Condition</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edgeType">Edge Type</Label>
                <Select value={edgeType} onValueChange={setEdgeType}>
                  <SelectTrigger id="edgeType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="conditional">Conditional</SelectItem>
                    <SelectItem value="error">Error Handler</SelectItem>
                    <SelectItem value="timeout">Timeout</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="label">Label</Label>
                <Input
                  id="label"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Edge label..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Input
                  id="priority"
                  type="number"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  placeholder="0"
                />
                <p className="text-xs text-muted-foreground">
                  Higher priority edges are evaluated first when multiple paths exist
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="guard" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="guard">Guard Expression (JavaScript)</Label>
                <Textarea
                  id="guard"
                  value={guard}
                  onChange={(e) => setGuard(e.target.value)}
                  placeholder="user.risk > 'medium' && request.type === 'privileged'"
                  rows={6}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Example: user.role === 'admin' || request.amount &lt; 1000
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between">
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Edge
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
