
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Mail, Eye, Shield, Clock, AlertTriangle } from 'lucide-react';
import { toast } from "sonner";

interface SponsorDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sponsor: { id: string; name: string; department: string; role: string; sponsoredCount: number; pendingReviews: number; expiringThisMonth: number; status: string; riskLevel: string } | null;
}

const sponsoredIdentities = [
  { name: "Alex Thompson", type: "Contractor", status: "Active", risk: "Medium", accessItems: 12, endDate: "2024-12-31" },
  { name: "Maria Rodriguez", type: "Consultant", status: "Expiring", risk: "Low", accessItems: 8, endDate: "2024-06-30" },
  { name: "Tom Wilson", type: "Contractor", status: "Active", risk: "Low", accessItems: 5, endDate: "2024-09-15" },
  { name: "Sarah Kim", type: "Consultant", status: "Active", risk: "High", accessItems: 18, endDate: "2024-08-31" },
];

export function SponsorDetailModal({ open, onOpenChange, sponsor }: SponsorDetailModalProps) {
  if (!sponsor) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {/* <Users className="h-5 w-5 text-purple-500" /> */}
            {sponsor.name} — Sponsor Profile
          </DialogTitle>

          <DialogDescription className="text-muted-foreground">
            View sponsor ownership details, associated identities, governance responsibilities, and related access oversight.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-3 mb-4 pt-4">
          <Badge variant="outline">{sponsor.role} · {sponsor.department}</Badge>
          <Badge variant="secondary">{sponsor.sponsoredCount} sponsored</Badge>
          {sponsor.pendingReviews > 0 && <Badge className="bg-orange-100 text-orange-800">{sponsor.pendingReviews} pending</Badge>}
          {sponsor.expiringThisMonth > 0 && <Badge className="bg-red-100 text-red-800">{sponsor.expiringThisMonth} expiring</Badge>}
        </div>

        <div className="space-y-3">
          {sponsoredIdentities.map((identity, i) => (
            <div key={i} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{identity.name}</span>
                  <Badge variant="outline" className="text-xs">{identity.type}</Badge>
                  <Badge className={
                    identity.status === 'Expiring' ? 'bg-orange-100 text-orange-800' :
                      'bg-green-100 text-green-800'
                  } >{identity.status}</Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {identity.accessItems} access items · Ends: {identity.endDate}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={
                  identity.risk === 'High' ? 'bg-red-100 text-red-800' :
                    identity.risk === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                }>{identity.risk}</Badge>
                <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 mt-4 pt-4">
          <Button variant="outline" onClick={() => { toast.success(`Reminder sent to ${sponsor.name}`); }}>
            <Mail className="h-4 w-4 mr-1" /> Send Reminder
          </Button>
          <Button variant="outline" onClick={() => { toast.info("Reviews reassigned"); }}>
            <Users className="h-4 w-4 mr-1" /> Reassign Reviews
          </Button>
          <Button onClick={() => { toast.info("Escalation initiated"); }}>
            <AlertTriangle className="h-4 w-4 mr-1" /> Escalate
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
