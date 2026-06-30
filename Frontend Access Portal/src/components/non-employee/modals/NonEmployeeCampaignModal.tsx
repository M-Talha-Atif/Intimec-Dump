
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ClipboardCheck, Mail, Pause, Clock, Users, Eye } from 'lucide-react';
import { toast } from "sonner";

interface NonEmployeeCampaignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: { id: string; name: string; type: string; identitiesCount: number; completed: number; pending: number; dueDate: string; status: string; progress: number } | null;
}

const pendingReviews = [
  { name: "Alex Thompson", type: "Contractor", reviewer: "Jane Smith", daysLeft: 5, risk: "Medium" },
  { name: "Maria Rodriguez", type: "Consultant", reviewer: "Bob Brown", daysLeft: 2, risk: "High" },
  { name: "David Chen", type: "Vendor", reviewer: "Carol Wilson", daysLeft: -3, risk: "Critical" },
];

const reviewerStats = [
  { reviewer: "Jane Smith", assigned: 15, completed: 12, overdue: 0 },
  { reviewer: "Bob Brown", assigned: 10, completed: 6, overdue: 2 },
  { reviewer: "Carol Wilson", assigned: 20, completed: 14, overdue: 3 },
];

export function NonEmployeeCampaignModal({ open, onOpenChange, campaign }: NonEmployeeCampaignModalProps) {
  if (!campaign) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {/* <ClipboardCheck className="h-5 w-5 text-purple-500" /> */}
            {campaign.name}
          </DialogTitle>

          <DialogDescription className="text-muted-foreground">
            View certification campaign details including reviewers, identity scope, completion progress, and pending access decisions.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-3 mb-4">
          <Badge className={
            campaign.status === 'Completed' ? 'bg-green-100 text-green-800' :
              campaign.status === 'Critical' ? 'bg-red-100 text-red-800' :
                'bg-orange-100 text-orange-800'
          }>{campaign.status}</Badge>
          <Badge variant="outline">{campaign.completed}/{campaign.identitiesCount} completed</Badge>
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
          <h4 className="font-medium text-sm mb-3">Reviewer Performance</h4>
          <div className="space-y-3">
            {reviewerStats.map((r, i) => (
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
            {pendingReviews.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{item.name}</span>
                    <Badge variant="outline" className="text-xs">{item.type}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Reviewer: {item.reviewer} · {item.daysLeft > 0 ? `${item.daysLeft} days left` : `${Math.abs(item.daysLeft)} days overdue`}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={item.risk === 'Critical' ? 'bg-red-100 text-red-800' : item.risk === 'High' ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'}>
                    {item.risk}
                  </Badge>
                  <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4 pt-4">
          <Button variant="outline" onClick={() => toast.info("Campaign paused")}>
            <Pause className="h-4 w-4 mr-1" /> Pause
          </Button>
          <Button variant="outline" onClick={() => toast.success("Reminders sent")}>
            <Mail className="h-4 w-4 mr-1" /> Send All Reminders
          </Button>
          <Button onClick={() => toast.info("Due date extended")}>
            <Clock className="h-4 w-4 mr-1" /> Extend Due Date
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
