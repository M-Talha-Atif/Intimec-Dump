
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { toast } from "sonner";

interface NhiRiskInvestigationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: { nhi?: string; name?: string; type?: string; violation?: string; severity?: string; owner?: string; category?: string } | null;
}

export function NhiRiskInvestigationModal({ open, onOpenChange, item }: NhiRiskInvestigationModalProps) {
  if (!item) return null;
  const name = item.nhi || item.name || 'Unknown';
  const severity = item.severity || item.category || 'Medium';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {/* <Shield className="h-5 w-5 text-red-500" /> */}
            Risk Investigation — {name}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Review detected risk signals for {name}, including high-risk entitlements, policy violations, and governance anomalies requiring investigation.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-3 mb-4 mt-4">
          <Badge className={severity === 'Critical' ? 'bg-red-100 text-red-800' : severity === 'High' ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'}>
            {severity}
          </Badge>
          <Badge variant="outline">{item.type || 'Service Account'}</Badge>
          <Badge variant="secondary">Owner: {item.owner || 'Unassigned'}</Badge>
        </div>

        {item.violation && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="font-medium text-red-800">Violation Details</span>
            </div>
            <p className="text-sm text-red-700">{item.violation}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-sm mb-2">Timeline</h4>
            <div className="space-y-2">
              {[
                { time: "2024-06-18 14:32", event: "Violation detected by automated scan", icon: AlertTriangle, color: "text-red-500" },
                { time: "2024-06-18 14:35", event: "Alert sent to owner team", icon: Clock, color: "text-orange-500" },
                { time: "2024-06-19 09:00", event: "Investigation assigned to security analyst", icon: Shield, color: "text-blue-500" },
              ].map((entry, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <entry.icon className={`h-4 w-4 mt-0.5 ${entry.color}`} />
                  <div>
                    <span className="text-muted-foreground">{entry.time}</span>
                    <span className="ml-2">{entry.event}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-sm mb-2">Affected Access</h4>
            <div className="grid grid-cols-2 gap-2">
              {["Production Database", "Admin Console", "Backup Systems", "Monitoring Dashboard"].map((access, i) => (
                <div key={i} className="flex items-center gap-2 p-2 border rounded text-sm">
                  <Shield className="h-3 w-3 text-muted-foreground" />
                  {access}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4 pt-4">
          <Button variant="outline" onClick={() => { toast.info("Exception request created"); onOpenChange(false); }}>
            Create Exception
          </Button>
          <Button variant="outline" onClick={() => { toast.info("Assigned to reviewer"); onOpenChange(false); }}>
            Assign Reviewer
          </Button>
          <Button variant="destructive" onClick={() => { toast.success("Access remediated successfully"); onOpenChange(false); }}>
            Remediate
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
