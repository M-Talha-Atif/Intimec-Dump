import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, Shield, CheckCircle, XCircle, Clock } from 'lucide-react';
import { mockSoDViolations } from '@/services/mockRiskData';

interface SoDViolationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SoDViolationDetailModal: React.FC<SoDViolationDetailModalProps> = ({
  isOpen,
  onClose
}) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-300 bg-red-50 text-red-700';
      case 'high': return 'border-orange-300 bg-orange-50 text-orange-700';
      case 'medium': return 'border-yellow-300 bg-yellow-50 text-yellow-700';
      default: return 'border-gray-300 bg-gray-50 text-gray-700';
    }
  };

  const getApprovalStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'border-green-300 bg-green-50 text-green-700';
      case 'denied': return 'border-red-300 bg-red-50 text-red-700';
      case 'pending': return 'border-yellow-300 bg-yellow-50 text-yellow-700';
      default: return 'border-gray-300 bg-gray-50 text-gray-700';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-destructive" />
            <span>Segregation of Duties Violations</span>
            <Badge variant="outline">{mockSoDViolations.length} Active</Badge>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-8rem)]">
          <div className="space-y-4 pr-4">
            {mockSoDViolations.map((violation) => (
              <Card key={violation.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="outline" className={getSeverityColor(violation.severity)}>
                          {violation.severity}
                        </Badge>
                        <Badge variant="outline" className={getApprovalStatusColor(violation.approvalStatus)}>
                          {violation.approvalStatus}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{violation.userName}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        User ID: {violation.userId}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve Exception
                      </Button>
                      <Button size="sm" variant="outline">
                        <XCircle className="h-4 w-4 mr-2" />
                        Remediate
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Violated Policy</h4>
                    <div className="p-3 bg-accent rounded-lg text-sm">
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                        <span>{violation.violatedPolicy}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Conflicting Roles</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {violation.conflictingRoles.map((role, idx) => (
                        <div key={idx} className="p-3 border rounded-lg">
                          <div className="text-sm font-medium">{role.roleName}</div>
                          <div className="text-xs text-muted-foreground">ID: {role.roleId}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {violation.businessJustification && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Business Justification</h4>
                      <p className="text-sm p-3 bg-muted rounded-lg">{violation.businessJustification}</p>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-medium mb-2">Remediation Options</h4>
                    <div className="space-y-2">
                      {violation.remediationOptions.map((option, idx) => (
                        <div key={idx} className="flex items-center space-x-2 text-sm p-2 hover:bg-accent rounded cursor-pointer">
                          <input type="radio" name={`remediation-${violation.id}`} className="h-4 w-4" />
                          <span>{option}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>Discovered: {violation.discoveredDate.toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
