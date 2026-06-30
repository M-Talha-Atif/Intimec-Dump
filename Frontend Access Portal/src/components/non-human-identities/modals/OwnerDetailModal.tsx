
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Shield, Eye, Mail, AlertTriangle } from 'lucide-react';
import { toast } from "sonner";

interface OwnerDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  owner: { team: string; count: number; risk: number } | null;
}

const teamMembers = [
  { name: "prod-db-service", type: "Service Account", risk: "High", lastUsed: "2 days ago", rotationStatus: "Due Soon" },
  { name: "ci-cd-runner", type: "Service Account", risk: "Low", lastUsed: "1 hour ago", rotationStatus: "Current" },
  { name: "monitoring-key", type: "API Key", risk: "Medium", lastUsed: "5 days ago", rotationStatus: "Current" },
  { name: "backup-cert", type: "Certificate", risk: "Medium", lastUsed: "12 days ago", rotationStatus: "Overdue" },
  { name: "deploy-token", type: "OAuth Token", risk: "Low", lastUsed: "3 hours ago", rotationStatus: "Current" },
];

export function OwnerDetailModal({ open, onOpenChange, owner }: OwnerDetailModalProps) {
  if (!owner) return null;

  const highRisk = Math.floor(owner.count * (owner.risk / 10) * 0.1);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {/* <Users className="h-5 w-5 text-blue-500" /> */}
            {owner.team} — NHI Portfolio
          </DialogTitle>

          <DialogDescription className="text-muted-foreground">
            Explore the non-human identities owned by the {owner.team} team, including service accounts, API keys, certificates, and secrets with their lifecycle status and risk exposure.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-3 mb-4 mt-4">
          <Badge variant="outline">{owner.count} NHIs</Badge>
          <Badge variant="secondary">Risk Score: {owner.risk}</Badge>
          <Badge className="bg-red-100 text-red-800">{highRisk} High Risk</Badge>
        </div>

        <div className="space-y-3">
          {teamMembers.map((member, i) => (
            <div key={i} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{member.name}</span>
                  <Badge variant="outline" className="text-xs">{member.type}</Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Last used: {member.lastUsed} · Rotation: {member.rotationStatus}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={
                  member.risk === 'High' ? 'bg-red-100 text-red-800' :
                    member.risk === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                }>{member.risk}</Badge>
                <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 mt-4 pt-4">
          <Button variant="outline" onClick={() => { toast.success("Reminder sent to " + owner.team); }}>
            <Mail className="h-4 w-4 mr-1" /> Send Reminder
          </Button>
          <Button variant="outline" onClick={() => { toast.info("Bulk review initiated"); }}>
            <Shield className="h-4 w-4 mr-1" /> Review All
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
