import React from 'react';
import { CheckCircle, Clock, XCircle, Circle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ApprovalStep {
  stepNumber: number;
  approverId: string;
  approverName: string;
  approverRole: string;
  status: 'pending' | 'approved' | 'rejected' | 'delegated' | 'skipped';
  respondedAt?: string;
  comments?: string;
  delegatedTo?: string;
  slaHours: number;
  hoursRemaining?: number;
}

interface ApprovalChainVisualizationProps {
  approvalChain: ApprovalStep[];
  currentStep: number;
}

const ApprovalChainVisualization: React.FC<ApprovalChainVisualizationProps> = ({
  approvalChain,
  currentStep,
}) => {
  const getStepIcon = (step: ApprovalStep) => {
    switch (step.status) {
      case 'approved':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-6 w-6 text-red-500" />;
      case 'pending':
        return <Clock className="h-6 w-6 text-yellow-500" />;
      default:
        return <Circle className="h-6 w-6 text-muted-foreground" />;
    }
  };

  const getStepColor = (step: ApprovalStep) => {
    switch (step.status) {
      case 'approved':
        return 'border-green-500 bg-green-50';
      case 'rejected':
        return 'border-red-500 bg-red-50';
      case 'pending':
        return 'border-yellow-500 bg-yellow-50';
      default:
        return 'border-muted bg-muted/30';
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Approval Workflow</h3>
      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          {approvalChain.map((step, index) => (
            <React.Fragment key={step.stepNumber}>
              <div className="flex-1 flex flex-col items-center">
                <div className={cn(
                  "w-full border-2 rounded-lg p-4 transition-all",
                  getStepColor(step)
                )}>
                  <div className="flex flex-col items-center text-center">
                    {getStepIcon(step)}
                    <h4 className="font-medium mt-2">{step.approverName}</h4>
                    <p className="text-sm text-muted-foreground">{step.approverRole}</p>
                    <div className="mt-2">
                      <span className={cn(
                        "text-xs px-2 py-1 rounded-full",
                        step.status === 'approved' ? 'bg-green-100 text-green-700' :
                        step.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        step.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-muted text-muted-foreground'
                      )}>
                        {step.status.toUpperCase()}
                      </span>
                    </div>
                    {step.respondedAt && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(step.respondedAt).toLocaleDateString()}
                      </p>
                    )}
                    {step.comments && (
                      <p className="text-xs mt-2 text-left w-full italic">
                        "{step.comments}"
                      </p>
                    )}
                    {step.status === 'pending' && step.hoursRemaining !== undefined && (
                      <div className="mt-2 text-xs">
                        <span className="text-muted-foreground">
                          {step.hoursRemaining}h remaining
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  Step {step.stepNumber}
                </div>
              </div>
              {index < approvalChain.length - 1 && (
                <div className="flex items-center justify-center pt-4">
                  <ArrowRight className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ApprovalChainVisualization;
