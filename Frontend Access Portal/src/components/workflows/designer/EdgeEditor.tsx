"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Edge } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { X, Edit3, GripVertical } from 'lucide-react';

interface EdgeData extends Record<string, unknown> {
  type?: 'success' | 'failure' | 'yes' | 'no' | 'escalation';
  label?: string;
  guard?: string;
}

interface EdgeEditorProps {
  edge: Edge<EdgeData> | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (edgeId: string, data: EdgeData) => void;
  onDelete: (edgeId: string) => void;
}

const EDGE_TYPES = [
  { value: 'success', label: 'Success', color: 'text-green-600' },
  { value: 'failure', label: 'Failure', color: 'text-red-600' },
  { value: 'yes', label: 'Yes', color: 'text-blue-600' },
  { value: 'no', label: 'No', color: 'text-orange-600' },
  { value: 'escalation', label: 'Escalation', color: 'text-purple-600' },
];

export const EdgeEditor: React.FC<EdgeEditorProps> = ({
  edge,
  isOpen,
  onClose,
  onUpdate,
  onDelete
}) => {
  const [edgeType, setEdgeType] = useState<string>('');
  const [label, setLabel] = useState<string>('');
  const [guard, setGuard] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

  // Reset position when dialog opens
  useEffect(() => {
    if (isOpen) {
      setOffset({ x: 0, y: 0 });
    }
  }, [isOpen]);

  useEffect(() => {
    if (edge?.data) {
      setEdgeType(edge.data.type || '');
      setLabel(edge.data.label || '');
      setGuard(edge.data.guard || '');
    } else {
      setEdgeType('');
      setLabel('');
      setGuard('');
    }
  }, [edge]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.drag-handle')) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - offset.x,
        y: e.clientY - offset.y
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  const handleSave = () => {
    if (!edge) return;

    const data: EdgeData = {
      type: edgeType as EdgeData['type'],
      label: label.trim() || undefined,
      guard: guard.trim() || undefined,
    };

    onUpdate(edge.id, data);
    onClose();
  };

  const handleDelete = () => {
    if (!edge) return;
    onDelete(edge.id);
    onClose();
  };

  if (!edge || !isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />
      
      {/* Draggable Panel */}
      <div
        ref={panelRef}
        className="fixed z-50 w-80 bg-white rounded-lg shadow-xl border left-1/2 top-1/2 -translate-x-[60%] -translate-y-[40%]"
        style={{
          transform: `translate(calc(-60% + ${offset.x}px), calc(-40% + ${offset.y}px))`,
          cursor: isDragging ? 'grabbing' : 'default'
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Header with drag handle */}
        <div className="p-4 border-b bg-gray-50 rounded-t-lg drag-handle cursor-grab active:cursor-grabbing">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-gray-400" />
              <Edit3 className="h-4 w-4" />
              <h3 className="font-semibold">Edge Properties</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edge-type">Type</Label>
            <Select value={edgeType} onValueChange={setEdgeType}>
              <SelectTrigger id="edge-type">
                <SelectValue placeholder="Select edge type" />
              </SelectTrigger>
              <SelectContent>
                {EDGE_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    <span className={type.color}>{type.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edge-label">Label</Label>
            <Input
              id="edge-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Enter edge label"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edge-guard">Guard Condition</Label>
            <Textarea
              id="edge-guard"
              value={guard}
              onChange={(e) => setGuard(e.target.value)}
              placeholder="e.g., approval.status === 'approved'"
              rows={3}
            />
          </div>

          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
            >
              Delete Edge
            </Button>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
