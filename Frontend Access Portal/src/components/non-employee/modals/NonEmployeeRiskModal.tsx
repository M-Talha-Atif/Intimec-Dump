
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, Eye, Ban } from 'lucide-react';
import { toast } from "sonner";

interface NonEmployeeRiskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: { identity?: string; name?: string; type?: string; riskScore?: number; factors?: string[]; violations?: Array<{ type: string; description: string }>; sponsor?: string } | null;
}

export function NonEmployeeRiskModal({ open, onOpenChange, item }: NonEmployeeRiskModalProps) {
  if (!item) return null;
  const name = item.identity || item.name || 'Unknown';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {/* <Shield className="h-5 w-5 text-red-500" /> */}
            Risk Investigation — {name}
          </DialogTitle>

          <DialogDescription className="text-muted-foreground">
            Investigate risk signals related to {name}, including policy violations, high-risk access, and governance anomalies requiring review.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-3 mb-4 pt-4">
          {item.riskScore && (
            <Badge className={item.riskScore >= 80 ? 'bg-red-100 text-red-800' : item.riskScore >= 60 ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'}>
              Score: {item.riskScore}
            </Badge>
          )}
          <Badge variant="outline">{item.type || 'Non-Employee'}</Badge>
          <Badge variant="secondary">Sponsor: {item.sponsor || 'N/A'}</Badge>
        </div>

        {item.factors && item.factors.length > 0 && (
          <div className="mb-4 pt-4">
            <h4 className="font-medium text-sm mb-2">Risk Factors</h4>
            <div className="flex flex-wrap gap-2">
              {item.factors.map((factor, i) => (
                <Badge key={i} variant="secondary" className="bg-red-50 text-red-700">{factor}</Badge>
              ))}
            </div>
          </div>
        )}

        {item.violations && item.violations.length > 0 && (
          <div className="mb-4">
            <h4 className="font-medium text-sm mb-2">Active Violations</h4>
            <div className="space-y-2">
              {item.violations.map((v, i) => (
                <div key={i} className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <span className="font-medium text-sm text-red-800">{v.type}</span>
                  </div>
                  <p className="text-sm text-red-700">{v.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4">
          <h4 className="font-medium text-sm mb-2">Affected Access</h4>
          <div className="grid grid-cols-2 gap-2">
            {["SAP Finance", "SharePoint", "VPN Access", "Email Systems"].map((access, i) => (
              <div key={i} className="flex items-center gap-2 p-2 border rounded text-sm">
                <Shield className="h-3 w-3 text-muted-foreground" />
                {access}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4 pt-4">
          <Button variant="outline" onClick={() => { toast.info("Exception request created"); onOpenChange(false); }}>
            Request Exception
          </Button>
          <Button variant="outline" onClick={() => { toast.success("Review scheduled"); onOpenChange(false); }}>
            <Eye className="h-4 w-4 mr-1" /> Schedule Review
          </Button>
          <Button variant="destructive" onClick={() => { toast.success("Access revoked"); onOpenChange(false); }}>
            <Ban className="h-4 w-4 mr-1" /> Revoke Access
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
