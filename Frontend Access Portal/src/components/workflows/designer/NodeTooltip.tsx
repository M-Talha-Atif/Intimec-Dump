
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Shield, Tag, User } from 'lucide-react';
import { WorkflowNodeData } from '@/types/workflow';

interface NodeTooltipProps {
  nodeData: WorkflowNodeData;
  children: React.ReactNode;
}

export const NodeTooltip: React.FC<NodeTooltipProps> = ({ nodeData, children }) => {
  const [showTooltip, setShowTooltip] = React.useState(false);

  if (!nodeData.metadata) {
    return <>{children}</>;
  }

  return (
    <div 
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {children}
      
      {showTooltip && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-50">
          <Card className="w-80 shadow-lg border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                {nodeData.metadata.roleType && (
                  <span className="text-lg">{nodeData.metadata.roleType}</span>
                )}
                {nodeData.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {nodeData.metadata.realLifePurpose && (
                <p className="text-sm text-gray-600">
                  {nodeData.metadata.realLifePurpose}
                </p>
              )}
              
              <div className="flex items-center gap-4 text-xs">
                {nodeData.metadata.estimatedDuration && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{nodeData.metadata.estimatedDuration}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  <span className="capitalize">{nodeData.risk} Risk</span>
                </div>
              </div>

              {nodeData.metadata.complianceFramework && nodeData.metadata.complianceFramework.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {nodeData.metadata.complianceFramework.map((framework, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {framework}
                    </Badge>
                  ))}
                </div>
              )}

              {nodeData.metadata.auditTags && nodeData.metadata.auditTags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {nodeData.metadata.auditTags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      <Tag className="h-2 w-2 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
