import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Clock, Settings, Award, Users, Shield,
  CheckCircle, Zap, ChevronRight, X, Star,
  Play, StopCircle, Mail, Link, GitBranch,
  UserPlus, UserCheck, UserMinus, Key, FileCheck,
  XCircle, AlertTriangle, Activity, Target, BarChart,
  ShieldCheck, Workflow, Database, Cloud, Layers,
  Lock, FileText
} from 'lucide-react';
import { WorkflowTemplate } from '@/types/workflow';
import { ScrollArea } from "@/components/ui/scroll-area";
import { getRiskBadgeClass } from '@/utils/getRiskColor';  

interface TemplatePreviewModalProps {
  template: WorkflowTemplate | null;
  open: boolean;
  onClose: () => void;
  onUseTemplate: (template: WorkflowTemplate) => void;
}

export const TemplatePreviewModal = ({ template, open, onClose, onUseTemplate }: TemplatePreviewModalProps) => {
  if (!template) return null;

  const getCategoryIcon = (category: string) => {
    const icons = {
      'joiner-mover-leaver': UserPlus,
      'joiner': UserPlus,
      'mover': UserCheck,
      'leaver': UserMinus,
      'access-request': Key,
      'access': Key,
      'certification': FileCheck,
      'recertification': Award,
      'revocation': XCircle,
      'exception': AlertTriangle,
      'ai-risk': Zap,
      'ai': Activity,
      'risk-assessment': BarChart,
      'risk': Target,
      'compliance': ShieldCheck,
      'approval': CheckCircle,
      'workflow': Workflow,
      'automation': GitBranch,
      'provisioning': Database,
      'deprovisioning': Cloud,
      'integration': Layers,
      'identity': Users,
      'security': Shield,
      'governance': Lock,
      'audit': FileText,
      'role': Award,
      'permission': ShieldCheck,
      'management': Settings,
      'user': Users,
      'assignment': CheckCircle,
      'policy': FileCheck
    };

    const lowerCategory = category?.toLowerCase() || '';
    for (const [key, icon] of Object.entries(icons)) {
      if (lowerCategory.includes(key)) {
        return icon;
      }
    }

    return Workflow;
  };

  const getCategoryIconColor = (category: string) => {
    const colors = {
      'joiner-mover-leaver': { bg: 'bg-green-50', text: 'text-green-600' },
      'joiner': { bg: 'bg-emerald-50', text: 'text-emerald-600' },
      'mover': { bg: 'bg-cyan-50', text: 'text-cyan-600' },
      'leaver': { bg: 'bg-orange-50', text: 'text-orange-600' },
      'access-request': { bg: 'bg-purple-50', text: 'text-purple-600' },
      'access': { bg: 'bg-indigo-50', text: 'text-indigo-600' },
      'certification': { bg: 'bg-teal-50', text: 'text-teal-600' },
      'recertification': { bg: 'bg-sky-50', text: 'text-sky-600' },
      'revocation': { bg: 'bg-red-50', text: 'text-red-600' },
      'exception': { bg: 'bg-amber-50', text: 'text-amber-600' },
      'ai-risk': { bg: 'bg-violet-50', text: 'text-violet-600' },
      'ai': { bg: 'bg-fuchsia-50', text: 'text-fuchsia-600' },
      'risk-assessment': { bg: 'bg-rose-50', text: 'text-rose-600' },
      'risk': { bg: 'bg-pink-50', text: 'text-pink-600' },
      'compliance': { bg: 'bg-blue-50', text: 'text-blue-600' },
      'approval': { bg: 'bg-green-50', text: 'text-green-600' },
      'workflow': { bg: 'bg-purple-50', text: 'text-purple-600' },
      'automation': { bg: 'bg-indigo-50', text: 'text-indigo-600' },
      'provisioning': { bg: 'bg-teal-50', text: 'text-teal-600' },
      'deprovisioning': { bg: 'bg-orange-50', text: 'text-orange-600' },
      'integration': { bg: 'bg-blue-50', text: 'text-blue-600' },
      'identity': { bg: 'bg-purple-50', text: 'text-purple-600' },
      'security': { bg: 'bg-red-50', text: 'text-red-600' },
      'governance': { bg: 'bg-gray-50', text: 'text-gray-600' },
      'audit': { bg: 'bg-slate-50', text: 'text-slate-600' },
      'role': { bg: 'bg-amber-50', text: 'text-amber-600' },
      'permission': { bg: 'bg-blue-50', text: 'text-blue-600' },
      'management': { bg: 'bg-gray-50', text: 'text-gray-600' },
      'user': { bg: 'bg-purple-50', text: 'text-purple-600' },
      'assignment': { bg: 'bg-green-50', text: 'text-green-600' },
      'policy': { bg: 'bg-teal-50', text: 'text-teal-600' }
    };

    const lowerCategory = category?.toLowerCase() || '';
    for (const [key, color] of Object.entries(colors)) {
      if (lowerCategory.includes(key)) {
        return color;
      }
    }

    return { bg: 'bg-brand-teal/10', text: 'text-brand-teal' };
  };

  const CategoryIcon = getCategoryIcon(template.category);
  const iconColors = getCategoryIconColor(template.category);

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg flex flex-col p-0 h-full"
      >
        <div className="flex flex-col h-full min-w-0">

          {/* Fixed Header */}
          <div className="flex-shrink-0 px-6 py-4">
            <SheetHeader className="p-0">
              <div className="flex items-start gap-4 pr-8">
                <div className={`p-3 ${iconColors.bg} rounded-lg flex-shrink-0`}>
                  <CategoryIcon className={`h-8 w-8 ${iconColors.text}`} />
                </div>
                <div className="flex-1 min-w-0">
                  {template.isSystemTemplate ? (
                    <Badge variant="outline" className="text-xs mb-2">🌐 Global</Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs mb-2">👤 User</Badge>
                  )}
                  <SheetTitle className="text-xl font-semibold leading-tight">
                    {template.name}
                  </SheetTitle>
                  <SheetDescription className="mt-1 text-sm">
                    {template.description || 'No description available'}
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 min-h-0 px-6 pb-6 overflow-hidden">
            <ScrollArea className="h-full pr-2">
              <div className="space-y-6">

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-border bg-card p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <Settings className="h-4 w-4" />
                      <span className="text-xs font-medium">Steps</span>
                    </div>
                    <div className="text-2xl font-bold text-foreground">{template.steps}</div>
                  </div>
                  <div className="rounded-lg border border-border bg-card p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <Clock className="h-4 w-4" />
                      <span className="text-xs font-medium">Duration</span>
                    </div>
                    <div className="text-lg font-bold text-foreground">{template.estimatedTime}</div>
                  </div>
                  <div className="rounded-lg border border-border bg-card p-4">
                    <div className="text-xs text-muted-foreground mb-2">Complexity</div>
                    <div className="text-sm font-medium text-orange-600 dark:text-orange-400">
                      {template.complexity}
                    </div>
                  </div>
                  <div className="rounded-lg border border-border bg-card p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <Users className="h-4 w-4" />
                      <span className="text-xs font-medium">Usage</span>
                    </div>
                    <div className="text-2xl font-bold text-foreground">{template.usageCount || 0}</div>
                  </div>
                </div>

                {/* Description & Use Case */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground">Description & Use Case</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {template.description || 'No description available'}
                  </p>

                  {/* Typical Scenarios */}
                  <div>
                    <h4 className="text-xs font-semibold text-foreground mb-2">Typical Scenarios:</h4>
                    {template.tags && template.tags.length > 0 ? (
                      <ul className="space-y-1">
                        {template.tags.slice(0, 3).map((tag, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="mt-1">•</span>
                            <span className="capitalize">{tag.replace(/-/g, ' ')}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No specific scenarios defined</p>
                    )}
                  </div>

                  {/* Benefits */}
                  <div>
                    <h4 className="text-xs font-semibold text-foreground mb-2">Benefits:</h4>
                    {template.complianceFrameworks && template.complianceFrameworks.length > 0 ? (
                      <ul className="space-y-1">
                        <li className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="mt-1">•</span>
                          <span>Ensures compliance with {template.complianceFrameworks.join(', ')} standards</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="mt-1">•</span>
                          <span>Provides complete audit trail</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="mt-1">•</span>
                          <span>Minimizes human error</span>
                        </li>
                      </ul>
                    ) : (
                      <ul className="space-y-1">
                        <li className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="mt-1">•</span>
                          <span>Streamlines workflow execution</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="mt-1">•</span>
                          <span>Provides complete audit trail</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="mt-1">•</span>
                          <span>Minimizes human error</span>
                        </li>
                      </ul>
                    )}
                  </div>
                </div>

                {/* Workflow Steps & Configuration */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground">Workflow Steps & Configuration</h3>

                  {template.nodes && template.nodes.length > 0 ? (
                    <div className="space-y-3">
                      {template.nodes.map((node, index) => {
                        const actualType = node.data?.stepType || node.type;
                        const isTrigger = actualType === 'trigger.start' || actualType === 'trigger.end';
                        const nodeType = actualType.split('.')[0];

                        let nodeLabel = node.data?.ui?.label || node.data?.label || actualType;
                        if (isTrigger) {
                          nodeLabel = actualType === 'trigger.start' ? 'Start' : 'End';
                        } else if (nodeLabel === actualType) {
                          const typeMapping: Record<string, string> = {
                            'approval.manager': 'Manager Approval',
                            'approval.admin': 'Admin Approval',
                            'approval.custom': 'Custom Approval',
                            'action.http': 'HTTP Action',
                            'action.email': 'Email Action',
                            'action.custom': 'Custom Action',
                            'condition.if': 'Condition',
                            'condition.switch': 'Switch Condition',
                          };
                          nodeLabel = typeMapping[actualType] || `Step ${index + 1}`;
                        }

                        const nodeRisk = node.data?.ui?.risk || node.data?.risk || 'low';
                        const nodeDuration = node.data?.slaTimeout ? `${node.data.slaTimeout}h` : '5 minutes';

                        const getNodeIcon = () => {
                          if (actualType === 'trigger.start') return Play;
                          if (actualType === 'trigger.end') return StopCircle;
                          const iconMap: Record<string, any> = {
                            'approval.manager': Users,
                            'approval.admin': Shield,
                            'approval.custom': Users,
                            'action.http': Link,
                            'action.email': Mail,
                            'action.custom': Zap,
                            'condition.if': GitBranch,
                            'condition.switch': GitBranch,
                          };
                          if (iconMap[actualType]) return iconMap[actualType];
                          switch (nodeType) {
                            case 'approval': return Users;
                            case 'action': return Zap;
                            case 'condition': return GitBranch;
                            case 'trigger': return Settings;
                            default: return Settings;
                          }
                        };

                        const NodeIcon = getNodeIcon();

                        if (index === 0) {
                          console.log('Node data:', node);
                          console.log('Node type:', node.type);
                          console.log('NodeIcon:', NodeIcon);
                        }

                        return (
                          <div
                            key={node.id}
                            className={`rounded-lg border border-border p-4 ${isTrigger ? 'bg-blue-50/30 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800' : 'bg-card'
                              }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded ${isTrigger ? 'bg-blue-100 dark:bg-blue-900/40' : 'bg-muted'}`}>
                                <NodeIcon className={`h-4 w-4 ${isTrigger ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground'}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-semibold text-foreground">{nodeLabel}</h4>
                                    {isTrigger && (
                                      <Badge variant="outline" className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700">
                                        Trigger
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      className={`text-xs capitalize ${getRiskBadgeClass(nodeRisk)}`}
                                    >
                                      {nodeRisk} risk
                                    </Badge>
                                    <Clock className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground">{nodeDuration}</span>
                                  </div>
                                </div>

                                {node.data?.ui?.description && (
                                  <p className="text-xs text-muted-foreground mb-2">{node.data.ui.description}</p>
                                )}

                                {node.data?.field && (
                                  <div className="mt-2 p-2 bg-muted rounded text-xs font-mono text-foreground">
                                    {node.data.field} {node.data.operator || '=='} {JSON.stringify(node.data.value)}
                                  </div>
                                )}

                                {template.complianceFrameworks && index === 0 && (
                                  <div className="flex gap-2 mt-2">
                                    {template.complianceFrameworks.map((framework, fIdx) => (
                                      <Badge key={fIdx} variant="outline" className="text-xs border-border">
                                        ○ {framework}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No workflow steps configured</p>
                  )}
                </div>

                {/* Compliance & Framework */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Compliance & Framework</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">Primary Framework:</div>
                      <Badge variant="secondary" className="text-xs">{template.framework}</Badge>
                    </div>
                    {template.complianceFrameworks && template.complianceFrameworks.length > 0 && (
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-1">Compliance Standards:</div>
                        <div className="flex flex-wrap gap-2">
                          {template.complianceFrameworks.map((framework, index) => (
                            <Badge key={index} variant="outline" className="text-xs border-border">{framework}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {template.tags && template.tags.length > 0 && (
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-1">Tags:</div>
                        <div className="flex flex-wrap gap-2">
                          {template.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs border-border">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </ScrollArea>
          </div>

          {/* Footer — sits outside ScrollArea, pinned to bottom */}
          <div className="flex-shrink-0 px-6 py-4">
            <Button
              onClick={() => { onUseTemplate(template); onClose(); }}
              className="w-full h-10"
            >
              Use This Template
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

        </div>
      </SheetContent>
    </Sheet>
  );
};
