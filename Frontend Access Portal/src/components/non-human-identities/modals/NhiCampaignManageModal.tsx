
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ClipboardCheck, Mail, Pause, Play, Clock, Users } from 'lucide-react';
import { toast } from "sonner";

interface NhiCampaignManageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: { id: string; name: string; status: string; progress: number; totalNHIs: number; reviewedNHIs: number; dueDate: string; reviewers: string[]; scope: string } | null;
}

const reviewerBreakdown = [
  { reviewer: "Security Team", assigned: 89, completed: 67, overdue: 5 },
  { reviewer: "Platform Team", assigned: 67, completed: 45, overdue: 3 },
  { reviewer: "DevOps Team", assigned: 45, completed: 32, overdue: 1 },
];

const pendingItems = [
  { name: "prod-db-service", type: "Service Account", reviewer: "Security Team", daysLeft: 5, risk: "High" },
  { name: "legacy-api-key", type: "API Key", reviewer: "Platform Team", daysLeft: 3, risk: "Critical" },
  { name: "admin-token", type: "OAuth Token", reviewer: "DevOps Team", daysLeft: 8, risk: "Medium" },
  { name: "backup-cert", type: "Certificate", reviewer: "Security Team", daysLeft: 2, risk: "High" },
];

export function NhiCampaignManageModal({ open, onOpenChange, campaign }: NhiCampaignManageModalProps) {
  if (!campaign) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {/* <ClipboardCheck className="h-5 w-5 text-blue-500" /> */}
            {campaign.name}
          </DialogTitle>

          <DialogDescription className="text-muted-foreground">
            Review the certification campaign progress, including reviewers, completion status, pending access decisions, and overall governance outcomes.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-3 mb-4 mt-4">
          <Badge variant={campaign.status === 'Active' ? 'default' : campaign.status === 'Completed' ? 'secondary' : 'outline'}>
            {campaign.status}
          </Badge>
          <Badge variant="outline">{campaign.reviewedNHIs}/{campaign.totalNHIs} reviewed</Badge>
          <Badge variant="secondary">Due: {campaign.dueDate}</Badge>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Overall Progress</span>
            <span>{campaign.progress}%</span>
          </div>
          <Progress value={campaign.progress} className="h-2" />
        </div>

        <div className="mb-6">
          <h4 className="font-medium text-sm mb-3">Reviewer Breakdown</h4>
          <div className="space-y-3">
            {reviewerBreakdown.map((r, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">{r.reviewer}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-green-600">{r.completed} done</span>
                  <span className="text-muted-foreground">{r.assigned - r.completed} pending</span>
                  {r.overdue > 0 && <span className="text-red-600">{r.overdue} overdue</span>}
                  <Button variant="ghost" size="sm" onClick={() => toast.success(`Reminder sent to ${r.reviewer}`)}>
                    <Mail className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-sm mb-3">Pending Items</h4>
          <div className="space-y-2">
            {pendingItems.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{item.name}</span>
                    <Badge variant="outline" className="text-xs">{item.type}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">Assigned to: {item.reviewer} · {item.daysLeft} days left</div>
                </div>
                <Badge className={item.risk === 'Critical' ? 'bg-red-100 text-red-800' : item.risk === 'High' ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'}>
                  {item.risk}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4 pt-4">
          <Button variant="outline" onClick={() => toast.info("Campaign paused")}>
            <Pause className="h-4 w-4 mr-1" /> Pause
          </Button>
          <Button variant="outline" onClick={() => toast.success("Reminders sent to all reviewers")}>
            <Mail className="h-4 w-4 mr-1" /> Send All Reminders
          </Button>
          <Button onClick={() => toast.info("Due date extended by 7 days")}>
            <Clock className="h-4 w-4 mr-1" /> Extend Due Date
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
