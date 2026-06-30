import React, { memo, useState, useCallback } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { WorkflowNodeData } from '@/types/workflow';
import { NodeTooltip } from './NodeTooltip';
import * as LucideIcons from 'lucide-react';
import { Settings } from 'lucide-react';

const WorkflowNode = ({ data, selected, id }: NodeProps) => {
  const nodeData = data as WorkflowNodeData;
  
  // Handle icon - it might be a component, string name, or undefined
  let IconComponent = Settings;
  if (nodeData.icon) {
    if (typeof nodeData.icon === 'function') {
      IconComponent = nodeData.icon;
    } else if (typeof nodeData.icon === 'string') {
      // Icon is stored as string name, resolve from LucideIcons
      IconComponent = (LucideIcons as any)[nodeData.icon] || Settings;
    }
  }
  
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [editedLabel, setEditedLabel] = useState(nodeData.label);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-red-50 border-red-200 text-red-700';
      case 'medium': return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'low': return 'bg-green-50 border-green-200 text-green-700';
      default: return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const handleLabelDoubleClick = useCallback(() => {
    setIsEditingLabel(true);
  }, []);

  const handleLabelBlur = useCallback(() => {
    setIsEditingLabel(false);
    if (editedLabel !== nodeData.label) {
      window.dispatchEvent(new CustomEvent('node-update', { 
        detail: { id, updates: { label: editedLabel } } 
      }));
    }
  }, [editedLabel, nodeData.label, id]);

  const handleLabelKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLabelBlur();
    } else if (e.key === 'Escape') {
      setEditedLabel(nodeData.label);
      setIsEditingLabel(false);
    }
  }, [handleLabelBlur, nodeData.label]);

  const handleRiskClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const risks: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];
    const currentIndex = risks.indexOf(nodeData.risk);
    const nextRisk = risks[(currentIndex + 1) % risks.length];
    
    window.dispatchEvent(new CustomEvent('node-update', { 
      detail: { id, updates: { risk: nextRisk } } 
    }));
  }, [nodeData.risk, id]);

  return (
    <NodeTooltip nodeData={nodeData}>
      <Card className={`min-w-[180px] transition-all duration-200 hover:shadow-lg hover:scale-105 cursor-pointer ${
        selected ? 'ring-2 ring-blue-500 shadow-md' : ''
      }`}>
        <CardContent className="p-1.5">
          <div className="flex items-center gap-1 mb-0.5">
            <div className={`p-0.5 rounded ${getRiskColor(nodeData.risk)}`}>
              <IconComponent className="h-3 w-3" />
            </div>
            <div className="flex-1 min-w-0">
              {isEditingLabel ? (
                <Input
                  value={editedLabel}
                  onChange={(e) => setEditedLabel(e.target.value)}
                  onBlur={handleLabelBlur}
                  onKeyDown={handleLabelKeyDown}
                  className="h-5 text-xs font-medium p-1"
                  autoFocus
                />
              ) : (
                <h3 
                  className="font-medium text-xs truncate cursor-text hover:text-blue-600 transition-colors leading-none"
                  onDoubleClick={handleLabelDoubleClick}
                  title="Double-click to edit"
                >
                  {nodeData.label}
                </h3>
              )}
              <p className="text-[10px] text-gray-500 capitalize leading-none mt-0.5">{nodeData.stepType}</p>
            </div>
            <Badge 
              variant={nodeData.risk === 'high' ? 'destructive' : nodeData.risk === 'medium' ? 'default' : 'secondary'}
              className="text-[10px] px-1 py-0 h-3.5 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleRiskClick}
              title="Click to cycle risk level"
            >
              {nodeData.risk}
            </Badge>
          </div>
          
          {nodeData.description && (
            <p className="text-[10px] text-gray-600 line-clamp-1 leading-none">
              {nodeData.description}
            </p>
          )}

          {nodeData.metadata?.roleType && (
            <div className="flex items-center gap-1 text-[10px] text-gray-500 leading-none mt-0.5">
              <span>{nodeData.metadata.roleType}</span>
              {nodeData.metadata.estimatedDuration && (
                <>
                  <span>•</span>
                  <span>{nodeData.metadata.estimatedDuration}</span>
                </>
              )}
            </div>
          )}

          {/* Start node has no input handle (nothing before it) */}
          {nodeData.stepType !== 'trigger.start' && (
            <Handle
              type="target"
              position={Position.Top}
            />
          )}
          
          {/* End node has no output handle (nothing after it) */}
          {nodeData.stepType !== 'trigger.end' && (
            <>
              {nodeData.stepType === 'condition.if' ? (
                /* Condition IF nodes need TWO handles: one for TRUE branch, one for FALSE branch */
                <>
                  <div style={{ 
                    position: 'absolute', 
                    bottom: '-20px', 
                    left: '30%', 
                    transform: 'translateX(-50%)', 
                    fontSize: '10px', 
                    fontWeight: '600',
                    color: '#10b981',
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none'
                  }}>
                    {nodeData.trueLabel || 'Yes'}
                  </div>
                  <Handle
                    type="source"
                    position={Position.Bottom}
                    id="true"
                    className="handle-true"
                    style={{ 
                      left: '30%',
                      background: '#10b981 !important',
                      backgroundColor: '#10b981',
                      width: '14px',
                      height: '14px',
                      border: '2px solid white',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}
                  />
                  <div style={{ 
                    position: 'absolute', 
                    bottom: '-20px', 
                    left: '70%', 
                    transform: 'translateX(-50%)', 
                    fontSize: '10px', 
                    fontWeight: '600',
                    color: '#ef4444',
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none'
                  }}>
                    {nodeData.falseLabel || 'No'}
                  </div>
                  <Handle
                    type="source"
                    position={Position.Bottom}
                    id="false"
                    className="handle-false"
                    style={{ 
                      left: '70%',
                      background: '#ef4444 !important',
                      backgroundColor: '#ef4444',
                      width: '14px',
                      height: '14px',
                      border: '2px solid white',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}
                  />
                </>
              ) : nodeData.stepType === 'condition.switch' ? (
                /* Switch/Case nodes have dynamic handles based on configured cases + default */
                (() => {
                  const cases = (nodeData as any).cases || [];
                  const defaultCase = (nodeData as any).defaultCase || 'default';
                  const allCases = [...cases.map((c: any) => c.label), defaultCase];
                  const totalHandles = allCases.length || 1;
                  
                  // Colors for switch cases - cycle through these
                  const caseColors = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'];
                  
                  return (
                    <>
                      {allCases.map((caseLabel: string, index: number) => {
                        const percentage = totalHandles === 1 ? 50 : 15 + ((70 / (totalHandles - 1)) * index);
                        const isDefault = caseLabel === defaultCase;
                        const color = isDefault ? '#6b7280' : caseColors[index % caseColors.length];
                        
                        return (
                          <React.Fragment key={caseLabel}>
                            <div style={{ 
                              position: 'absolute', 
                              bottom: '-20px', 
                              left: `${percentage}%`, 
                              transform: 'translateX(-50%)', 
                              fontSize: '9px', 
                              fontWeight: '600',
                              color: color,
                              whiteSpace: 'nowrap',
                              pointerEvents: 'none',
                              maxWidth: '50px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>
                              {caseLabel}
                            </div>
                            <Handle
                              type="source"
                              position={Position.Bottom}
                              id={caseLabel}
                              style={{ 
                                left: `${percentage}%`,
                                background: `${color} !important`,
                                backgroundColor: color,
                                width: '12px',
                                height: '12px',
                                border: '2px solid white',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                              }}
                            />
                          </React.Fragment>
                        );
                      })}
                    </>
                  );
                })()
              ) : (
                /* Regular nodes have one output handle */
                <Handle
                  type="source"
                  position={Position.Bottom}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </NodeTooltip>
  );
};

export default memo(WorkflowNode);
