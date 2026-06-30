
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, User, Building, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface RiskItem {
  identity: string;
  type: string;
  detail: string;
  severity: string;
  department: string;
}

interface RiskInvestigationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: RiskItem | null;
}

export function RiskInvestigationModal({ open, onOpenChange, item }: RiskInvestigationModalProps) {
  if (!item) return null;

  const handleRemediate = () => {
    toast({ title: "Remediation Initiated", description: `Remediation workflow started for ${item.identity}.` });
    onOpenChange(false);
  };
  const handleAccept = () => {
    toast({ title: "Risk Accepted", description: `Risk formally accepted for ${item.identity}. Exception logged.` });
    onOpenChange(false);
  };
  const handleException = () => {
    toast({ title: "Exception Created", description: `Temporary exception created for ${item.identity} (90-day review).` });
    onOpenChange(false);
  };
  const handleAssign = () => {
    toast({ title: "Assigned to Reviewer", description: `${item.identity} assigned to next available reviewer.` });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {/* <Shield className="h-5 w-5 text-destructive" /> */}
            Risk Investigation
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Investigate and address the identified risk for {item.identity}.
          </DialogDescription>
        </DialogHeader>

        {/* Summary strip */}
        <div className="flex flex-wrap gap-3 pt-4">
          <div className="flex items-center gap-1.5 text-sm">
            <User className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-medium">{item.identity}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <Building className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">{item.department}</span>
          </div>
          <Badge variant="outline">{item.type}</Badge>
          <Badge className={
            item.severity === 'Critical' ? 'bg-red-900/10 text-red-900 border-red-900/20' :
            item.severity === 'High' ? 'bg-destructive/10 text-destructive border-destructive/20' :
            'bg-yellow-100 text-yellow-800 border-yellow-200'
          }>{item.severity}</Badge>
        </div>

        {/* Violation Details */}
        <div className="space-y-3 pt-4">
          <div>
            <h4 className="text-sm font-medium mb-1">Violation / Anomaly Details</h4>
            <div className="bg-muted/50 rounded p-3 text-sm text-muted-foreground">{item.detail}</div>
          </div>

          <div className="pt-4">
            <h4 className="text-sm font-medium mb-1">Affected Access</h4>
            <div className="bg-muted/50 rounded p-3 text-xs space-y-1 text-muted-foreground">
              <p>• SAP Financial Module — Admin role</p>
              <p>• Active Directory — Domain Admin group</p>
              <p>• ServiceNow — Change Management approver</p>
            </div>
          </div>

          <div className="pt-4">
            <h4 className="text-sm font-medium mb-1 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> Timeline
            </h4>
            <div className="bg-muted/50 rounded p-3 text-xs space-y-1 text-muted-foreground">
              <p>• <span className="font-medium text-foreground">Detected:</span> 2024-02-08 14:22 UTC</p>
              <p>• <span className="font-medium text-foreground">Last access:</span> 2024-02-10 02:30 UTC</p>
              <p>• <span className="font-medium text-foreground">Risk score change:</span> 45 → 82 (+37)</p>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-4 flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleAssign}>Assign to Reviewer</Button>
          <Button variant="outline" size="sm" onClick={handleException}>
            <AlertTriangle className="h-3 w-3 mr-1" />Create Exception
          </Button>
          <Button variant="secondary" size="sm" onClick={handleAccept}>
            <CheckCircle className="h-3 w-3 mr-1" />Accept Risk
          </Button>
          <Button variant="destructive" size="sm" onClick={handleRemediate}>
            <XCircle className="h-3 w-3 mr-1" />Remediate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
