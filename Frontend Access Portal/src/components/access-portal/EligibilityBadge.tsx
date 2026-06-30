import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';
import { EligibilityResult } from '@/utils/accessEligibilityEngine';

interface EligibilityBadgeProps {
  result: EligibilityResult;
  compact?: boolean;
}

const EligibilityBadge: React.FC<EligibilityBadgeProps> = ({ result, compact = false }) => {
  const getStatusIcon = () => {
    if (!result.isEligible) return <XCircle className="h-4 w-4" />;
    if (result.warnings.length > 0) return <AlertTriangle className="h-4 w-4" />;
    if (result.requiresApproval) return <Info className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };

  const getStatusColor = () => {
    if (!result.isEligible) return 'destructive';
    if (result.warnings.length > 0) return 'warning';
    if (result.requiresApproval) return 'secondary';
    return 'success';
  };

  const getStatusText = () => {
    if (!result.isEligible) return 'Not Eligible';
    if (result.requiresApproval) {
      return `Requires ${result.approvalLevel} approval`;
    }
    if (result.warnings.length > 0) return 'Eligible with conditions';
    return 'Eligible';
  };

  if (compact) {
    return (
      <Badge variant={getStatusColor() as any} className="flex items-center gap-1">
        {getStatusIcon()}
        {getStatusText()}
      </Badge>
    );
  }

  return (
    <div className="space-y-2">
      <Badge variant={getStatusColor() as any} className="flex items-center gap-1 w-fit">
        {getStatusIcon()}
        {getStatusText()}
      </Badge>

      {!result.isEligible && result.reasons.length > 0 && (
        <Alert variant="destructive">
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {result.reasons.map((reason, index) => (
                <li key={index} className="text-sm">{reason}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {result.warnings.length > 0 && (
        <Alert>
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {result.warnings.map((warning, index) => (
                <li key={index} className="text-sm">{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default EligibilityBadge;
