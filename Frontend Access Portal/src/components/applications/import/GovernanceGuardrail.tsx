
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, CheckCircle, Users } from 'lucide-react';

interface GovernanceGuardrailProps {
  estimatedChanges: number;
  onGuardrailUpdate: (data: GovernanceGuardrailData) => void;
}

export interface GovernanceGuardrailData {
  changeThreshold: number;
  requiresApproval: boolean;
  businessJustification: string;
}

export const GovernanceGuardrail: React.FC<GovernanceGuardrailProps> = ({
  estimatedChanges,
  onGuardrailUpdate
}) => {
  const [changeThreshold, setChangeThreshold] = useState(500);
  const [businessJustification, setBusinessJustification] = useState('');
  
  const requiresApproval = estimatedChanges > changeThreshold;

  useEffect(() => {
    onGuardrailUpdate({
      changeThreshold,
      requiresApproval,
      businessJustification
    });
  }, [changeThreshold, requiresApproval, businessJustification, onGuardrailUpdate]);

  const getRiskLevel = () => {
    const ratio = estimatedChanges / changeThreshold;
    if (ratio > 2) return { level: 'critical', color: 'red', label: 'Critical Risk' };
    if (ratio > 1.5) return { level: 'high', color: 'orange', label: 'High Risk' };
    if (ratio > 1) return { level: 'medium', color: 'yellow', label: 'Medium Risk' };
    return { level: 'low', color: 'green', label: 'Low Risk' };
  };

  const risk = getRiskLevel();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="h-5 w-5" />
          <span>Governance Guardrail</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Change Threshold Configuration */}
        <div className="space-y-3">
          <Label htmlFor="change-threshold" className="text-sm font-medium">
            Change Threshold (Default: 500)
          </Label>
          <div className="flex items-center space-x-2">
            <Input
              id="change-threshold"
              type="number"
              value={changeThreshold}
              onChange={(e) => setChangeThreshold(parseInt(e.target.value) || 500)}
              min={100}
              max={10000}
              className="w-32"
            />
            <span className="text-sm text-gray-500">changes</span>
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="p-4 bg-gray-50 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">Impact Assessment</span>
            </div>
            <Badge variant="outline" className={`text-${risk.color}-700 bg-${risk.color}-50 border-${risk.color}-200`}>
              {risk.label}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Estimated Changes:</span>
              <div className="font-semibold text-lg">{estimatedChanges.toLocaleString()}</div>
            </div>
            <div>
              <span className="text-gray-600">Threshold:</span>
              <div className="font-semibold text-lg">{changeThreshold.toLocaleString()}</div>
            </div>
          </div>

          {/* Progress bar showing risk level */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full bg-${risk.color}-500`}
              style={{ width: `${Math.min((estimatedChanges / changeThreshold) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Approval Required Alert */}
        {requiresApproval ? (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Approval Required</p>
                <p className="text-sm">
                  This import exceeds the configured change threshold and requires management approval.
                  Please provide business justification below.
                </p>
              </div>
            </AlertDescription>
          </Alert>
        ) : (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <p className="text-sm">
                This import is within acceptable change limits and can proceed without additional approval.
              </p>
            </AlertDescription>
          </Alert>
        )}

        {/* Business Justification */}
        {requiresApproval && (
          <div className="space-y-3">
            <Label htmlFor="business-justification" className="text-sm font-medium">
              Business Justification <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="business-justification"
              value={businessJustification}
              onChange={(e) => setBusinessJustification(e.target.value)}
              placeholder="Please provide detailed business justification for this large-scale import operation..."
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-gray-500">
              Required for imports exceeding {changeThreshold.toLocaleString()} changes
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
