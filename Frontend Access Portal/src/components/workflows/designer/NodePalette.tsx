"use client";

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  X, Zap, UserCheck, Shield, Mail, Clock, Webhook, Database, GitBranch, 
  Settings, AlertTriangle, Bot, Sparkles, Award, RefreshCw, Shuffle, Network,
  UserPlus, UserMinus, UserX, UserCog, FileText, FileArchive, Link2, 
  PlusSquare, Edit, Hourglass, CheckSquare, GitFork, GitMerge, Repeat, 
  CornerDownLeft, Undo2, XCircle, Bell, CheckCircle2, Activity, TrendingUp,
  ArrowUpCircle, Camera, GitCommit, RotateCcw, Power, Globe, Code, Eye,
  BarChart3, Flag, EyeOff, Key, FileUp, CheckCircle, Users, Wrench, Layers,
  ChevronDown, ChevronRight, AlertCircle, PlayCircle, StopCircle, Trash2, Search
} from 'lucide-react';

interface NodePaletteProps {
  onAddNode: (nodeData: { 
    label: string; 
    stepType: string; 
    nodeType: string; // Add nodeType for ReactFlow
    icon: any; 
    risk: 'low' | 'medium' | 'high';
    implemented?: boolean;
  }) => void;
}

export const NodePalette: React.FC<NodePaletteProps> = ({ onAddNode }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openCategories, setOpenCategories] = useState<string[]>([
    'Triggers',
    'Approvals', 
    'Actions'
  ]);

  const toggleCategory = (category: string) => {
    setOpenCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleAddNode = (node: any) => {
    onAddNode({
      label: node.label,
      stepType: node.type,
      nodeType: node.type, // Pass the type for ReactFlow node.type
      icon: node.icon,
      risk: node.risk,
      implemented: node.implemented
    });
  };

  // Backend Implementation Status (Phase 6b - Dec 2025)
  // Fully Implemented | Partial/Needs Fix | Future Phase
  const nodeCategories = {
    // Start and End nodes are automatically added to each workflow and should not be in palette
    'Approvals': [
      { type: 'approval.single', icon: UserCheck, label: 'Single Approver', risk: 'high' as const, implemented: true },
      { type: 'approval.multi', icon: Users, label: 'Multiple Approvers', risk: 'high' as const, implemented: true },
      { type: 'approval.dynamic', icon: Bot, label: 'Dynamic Approver', risk: 'high' as const, implemented: true },
    ],
    'Control Flow': [
      { type: 'condition.if', icon: GitBranch, label: 'If/Else Branch', risk: 'medium' as const, implemented: true },
      { type: 'condition.switch', icon: Shuffle, label: 'Switch/Case', risk: 'medium' as const, implemented: true },
      { type: 'gateway.parallel-split', icon: GitFork, label: 'Parallel Split', risk: 'medium' as const, implemented: true },
      { type: 'gateway.parallel-join', icon: GitMerge, label: 'Parallel Join', risk: 'medium' as const, implemented: true },
      { type: 'gateway.dynamic-split', icon: Layers, label: 'Dynamic Split', risk: 'medium' as const, implemented: true },
      { type: 'gateway.dynamic-join', icon: GitMerge, label: 'Dynamic Join', risk: 'medium' as const, implemented: true },
      { type: 'control.foreach', icon: Repeat, label: 'ForEach Loop', risk: 'medium' as const, implemented: true },
      { type: 'control.foreach-end', icon: CornerDownLeft, label: 'ForEach End', risk: 'low' as const, implemented: true },
    ],
    'Actions': [
      { type: 'action.provision', icon: UserPlus, label: 'Provision Access', risk: 'high' as const, implemented: true },
      { type: 'action.deprovision', icon: UserMinus, label: 'Deprovision Access', risk: 'high' as const, implemented: true },
      { type: 'action.notify', icon: Mail, label: 'Send Notification', risk: 'low' as const, implemented: true },
      { type: 'action.script', icon: Code, label: 'Execute Script', risk: 'high' as const, implemented: true },
      { type: 'action.http', icon: Globe, label: 'HTTP Request', risk: 'medium' as const, implemented: true },
    ],
    'Delays': [
      { type: 'delay.wait', icon: Clock, label: 'Wait/Sleep', risk: 'low' as const, implemented: true },
      { type: 'delay.schedule', icon: Hourglass, label: 'Schedule Until', risk: 'low' as const, implemented: true },
    ],
    'Forms & Input': [
      { type: 'form.dynamic', icon: FileText, label: 'Dynamic Form', risk: 'low' as const, implemented: false },
      { type: 'form.fileupload', icon: FileUp, label: 'File Upload', risk: 'low' as const, implemented: false },
    ],
    'Policy & Governance': [
      { type: 'policy.gate', icon: Shield, label: 'Policy Gate', risk: 'medium' as const, implemented: false },
      { type: 'policy.eligibility', icon: CheckCircle, label: 'Eligibility Check', risk: 'medium' as const, implemented: false },
      { type: 'sod.precheck', icon: AlertTriangle, label: 'SoD Pre-Check', risk: 'high' as const, implemented: false },
      { type: 'sod.postcheck', icon: CheckCircle2, label: 'SoD Post-Check', risk: 'high' as const, implemented: false },
      { type: 'risk.score', icon: Activity, label: 'Risk Score', risk: 'medium' as const, implemented: false },
      { type: 'impact.analyzer', icon: TrendingUp, label: 'Impact Analyzer', risk: 'medium' as const, implemented: false },
    ],
    'Advanced Flows': [
      { type: 'escalation', icon: ArrowUpCircle, label: 'Escalation', risk: 'high' as const, implemented: false },
      { type: 'reminder', icon: Bell, label: 'Reminder', risk: 'low' as const, implemented: false },
    ],
    'Account Operations': [
      { type: 'account.update', icon: UserCog, label: 'Update Account', risk: 'medium' as const, implemented: false },
      { type: 'account.disable', icon: UserX, label: 'Disable Account', risk: 'high' as const, implemented: false },
    ],
    'ITSM Ticketing': [
      { type: 'ticket.create', icon: PlusSquare, label: 'Create Ticket', risk: 'low' as const, implemented: false },
      { type: 'ticket.update', icon: Edit, label: 'Update Ticket', risk: 'low' as const, implemented: false },
      { type: 'ticket.wait', icon: Hourglass, label: 'Wait for Ticket', risk: 'low' as const, implemented: false },
      { type: 'ticket.close', icon: CheckSquare, label: 'Close Ticket', risk: 'low' as const, implemented: false },
    ],
    'Data Operations': [
      { type: 'data.correlate', icon: Link2, label: 'Correlate', risk: 'medium' as const, implemented: false },
      { type: 'data.reconcile', icon: RefreshCw, label: 'Reconcile', risk: 'medium' as const, implemented: false },
      { type: 'data.transform', icon: Shuffle, label: 'Transform', risk: 'low' as const, implemented: false },
      { type: 'enrichment', icon: Sparkles, label: 'Enrich', risk: 'low' as const, implemented: false },
    ],
    'Audit & Evidence': [
      { type: 'evidence.collect', icon: FileArchive, label: 'Collect Evidence', risk: 'low' as const, implemented: false },
      { type: 'audit.append', icon: FileText, label: 'Audit Log', risk: 'low' as const, implemented: false },
    ],
    'Version Control': [
      { type: 'snapshot', icon: Camera, label: 'Snapshot', risk: 'low' as const, implemented: false },
      { type: 'version', icon: GitCommit, label: 'Version', risk: 'low' as const, implemented: false },
      { type: 'rollback', icon: Undo2, label: 'Rollback', risk: 'high' as const, implemented: false },
    ],
    'Error Handling': [
      { type: 'exception', icon: AlertCircle, label: 'Error Handler', risk: 'medium' as const, implemented: false },
      { type: 'retry', icon: RotateCcw, label: 'Retry', risk: 'low' as const, implemented: false },
    ],
    'External Systems': [
      { type: 'webhook', icon: Webhook, label: 'Webhook', risk: 'medium' as const, implemented: false },
      { type: 'database', icon: Database, label: 'Database', risk: 'high' as const, implemented: false },
    ],
  };

  // Filter nodes based on search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return nodeCategories;
    
    const query = searchQuery.toLowerCase();
    const filtered: typeof nodeCategories = {};
    
    Object.entries(nodeCategories).forEach(([category, nodes]) => {
      const matchingNodes = nodes.filter(node => 
        node.label.toLowerCase().includes(query) ||
        node.type.toLowerCase().includes(query) ||
        category.toLowerCase().includes(query)
      );
      
      if (matchingNodes.length > 0) {
        filtered[category] = matchingNodes;
      }
    });
    
    return filtered;
  }, [searchQuery]);

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium mb-2">Workflow Steps</h4>
      
      {/* Search Bar */}
      <div className="relative mb-3">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search nodes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8 h-9 text-sm"
        />
      </div>
      
      {Object.entries(filteredCategories).map(([category, nodes]) => (
        <Collapsible
          key={category}
          open={openCategories.includes(category)}
          onOpenChange={() => toggleCategory(category)}
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted rounded-md transition-colors">
            <span className="text-xs font-medium text-muted-foreground">{category}</span>
            {openCategories.includes(category) ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1 mt-1">
            {nodes.map((node, idx) => (
              <div
                key={`${node.type}-${idx}`}
                className={`border border-border rounded-lg p-2 cursor-pointer transition-all ${
                  node.implemented 
                    ? 'hover:shadow-md hover:bg-muted/50' 
                    : 'opacity-50 hover:opacity-70 cursor-not-allowed'
                }`}
                onClick={() => node.implemented && handleAddNode(node)}
                title={node.implemented ? undefined : 'Not yet implemented - Coming in future phase'}
              >
                <div className="flex items-center gap-2">
                  <node.icon className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium flex-1">{node.label}</span>
                  {!node.implemented && (
                    <Badge variant="outline" className="text-[10px] px-1 py-0">
                      Future
                    </Badge>
                  )}
                  <Badge 
                    variant={node.risk === 'high' ? 'destructive' : 
                            node.risk === 'medium' ? 'default' : 'secondary'}
                    className="text-[10px] px-1 py-0"
                  >
                    {node.risk}
                  </Badge>
                </div>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      ))}
      
      <div className="pt-4">
        <h4 className="text-xs font-medium text-muted-foreground mb-2">AI Assistance</h4>
        <Button variant="outline" size="sm" className="w-full text-xs">
          <Bot className="h-3 w-3 mr-1" />
          Suggest Next Step
        </Button>
      </div>
    </div>
  );
};

export default NodePalette;