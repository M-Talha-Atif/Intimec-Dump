
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart3, Users, Calendar, Mail, Pause, RefreshCw, Clock } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface CampaignInfo {
  name: string;
  type: string;
  progress: number;
  due: string;
  status: string;
  employees: number;
}

interface CampaignManageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: CampaignInfo | null;
}

const mockReviewerBreakdown = [
  { reviewer: 'Bob Brown', assigned: 45, completed: 28, overdue: 5 },
  { reviewer: 'Jane Smith', assigned: 38, completed: 35, overdue: 0 },
  { reviewer: 'David Kim', assigned: 52, completed: 40, overdue: 3 },
  { reviewer: 'Lisa Rodriguez', assigned: 30, completed: 22, overdue: 2 },
];

const mockPendingItems = [
  { employee: 'Sarah Johnson', entitlement: 'SAP Admin', reviewer: 'Bob Brown', daysOpen: 12 },
  { employee: 'Alex Turner', entitlement: 'AWS Root', reviewer: 'David Kim', daysOpen: 8 },
  { employee: 'Mike Chen', entitlement: 'AD Domain Admin', reviewer: 'Bob Brown', daysOpen: 15 },
];

export function CampaignManageModal({ open, onOpenChange, campaign }: CampaignManageModalProps) {
  if (!campaign) return null;

  const handleSendReminder = () => {
    toast({ title: "Reminders Sent", description: `Reminder notifications sent to all reviewers with pending items.` });
  };
  const handlePause = () => {
    toast({ title: "Campaign Paused", description: `${campaign.name} has been paused. Reviewers will be notified.` });
  };
  const handleReassign = () => {
    toast({ title: "Overdue Items Reassigned", description: `Overdue review items redistributed to available reviewers.` });
  };
  const handleExtend = () => {
    toast({ title: "Due Date Extended", description: `Due date extended by 7 days to allow completion.` });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {/* <BarChart3 className="h-5 w-5 text-primary" /> */}
            {campaign.name}
          </DialogTitle>

          <DialogDescription className="text-muted-foreground">
            Review campaign progress, certification status, reviewer activity, and outstanding access decisions for this campaign.
          </DialogDescription>
        </DialogHeader>

        {/* Summary strip */}
        <div className="flex flex-wrap gap-3 items-center pt-4">
          <Badge variant="outline">{campaign.type}</Badge>
          <Badge className={campaign.status === 'Active' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'}>{campaign.status}</Badge>
          <div className="flex items-center gap-1.5 text-sm">
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{campaign.employees} employees</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Due: {campaign.due}</span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Progress value={campaign.progress} className="h-2 w-24" />
            <span className="text-sm font-medium">{campaign.progress}%</span>
          </div>
        </div>

        {/* Reviewer breakdown */}
        <div className="space-y-2 pt-4">
          <h4 className="text-sm font-medium">Progress by Reviewer</h4>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 font-medium">Reviewer</th>
                  <th className="pb-2 font-medium">Assigned</th>
                  <th className="pb-2 font-medium">Completed</th>
                  <th className="pb-2 font-medium">Overdue</th>
                  <th className="pb-2 font-medium">Progress</th>
                </tr>
              </thead>
              <tbody>
                {mockReviewerBreakdown.map((r, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-2 font-medium">{r.reviewer}</td>
                    <td className="py-2 text-muted-foreground">{r.assigned}</td>
                    <td className="py-2 text-muted-foreground">{r.completed}</td>
                    <td className="py-2">
                      <span className={r.overdue > 0 ? 'text-destructive font-medium' : 'text-muted-foreground'}>{r.overdue}</span>
                    </td>
                    <td className="py-2">
                      <div className="flex items-center gap-2">
                        <Progress value={Math.round((r.completed / r.assigned) * 100)} className="h-1.5 w-16" />
                        <span className="text-xs text-muted-foreground">{Math.round((r.completed / r.assigned) * 100)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending items */}
        <div className="space-y-2 pt-4">
          <h4 className="text-sm font-medium flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> Pending Items ({mockPendingItems.length})
          </h4>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 font-medium">Employee</th>
                  <th className="pb-2 font-medium">Entitlement</th>
                  <th className="pb-2 font-medium">Reviewer</th>
                  <th className="pb-2 font-medium">Days Open</th>
                </tr>
              </thead>
              <tbody>
                {mockPendingItems.map((p, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-2 font-medium">{p.employee}</td>
                    <td className="py-2 text-muted-foreground">{p.entitlement}</td>
                    <td className="py-2 text-muted-foreground">{p.reviewer}</td>
                    <td className="py-2">
                      <span className={p.daysOpen > 10 ? 'text-destructive font-medium' : 'text-muted-foreground'}>{p.daysOpen}d</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <DialogFooter className="mt-2 flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleSendReminder}>
            <Mail className="h-3 w-3 mr-1" />Send Reminders
          </Button>
          <Button variant="outline" size="sm" onClick={handleExtend}>
            <Calendar className="h-3 w-3 mr-1" />Extend Due Date
          </Button>
          <Button variant="outline" size="sm" onClick={handleReassign}>
            <RefreshCw className="h-3 w-3 mr-1" />Reassign Overdue
          </Button>
          <Button variant="secondary" size="sm" onClick={handlePause}>
            <Pause className="h-3 w-3 mr-1" />Pause Campaign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
