
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, ShieldAlert, Target, Mail, RefreshCw, AlertTriangle } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface ManagerInfo {
  name: string;
  reports: number;
  risk: number;
  pendingReviews: number;
  certPct: number;
}

interface ManagerDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  manager: ManagerInfo | null;
}

const mockTeamMembers = [
  { name: 'Sarah Johnson', role: 'Sr. Engineer', risk: 'High', certified: false, lastReview: '2024-01-12' },
  { name: 'Mike Chen', role: 'Engineer', risk: 'Medium', certified: true, lastReview: '2024-02-01' },
  { name: 'Emily Davis', role: 'Jr. Engineer', risk: 'Low', certified: true, lastReview: '2024-02-10' },
  { name: 'Alex Turner', role: 'DevOps', risk: 'High', certified: false, lastReview: '2023-11-15' },
  { name: 'Rachel Kim', role: 'QA Lead', risk: 'Low', certified: true, lastReview: '2024-01-28' },
];

export function ManagerDetailModal({ open, onOpenChange, manager }: ManagerDetailModalProps) {
  if (!manager) return null;

  const handleSendReminder = () => {
    toast({ title: "Reminder Sent", description: `Certification reminder sent to ${manager.name}.` });
  };

  const handleReassign = () => {
    toast({ title: "Reviews Reassigned", description: `${manager.pendingReviews} pending reviews reassigned to backup reviewer.` });
  };

  const handleEscalate = () => {
    toast({ title: "Escalated", description: `${manager.name}'s pending items escalated to VP level.` });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {/* <Users className="h-5 w-5 text-primary" /> */}
            {manager.name} — Team Details
          </DialogTitle>

          <DialogDescription className="text-muted-foreground">
            Explore team members reporting to {manager.name}, including roles, hierarchy structure, and organizational relationships.
          </DialogDescription>
        </DialogHeader>

        {/* Summary strip */}
        <div className="flex flex-wrap gap-3 pt-4">
          <div className="flex items-center gap-1.5 text-sm">
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{manager.reports} reports</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <Target className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Risk: </span>
            <Badge className={
              manager.risk >= 70 ? 'bg-destructive/10 text-destructive border-destructive/20' :
                manager.risk >= 50 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                  'bg-green-100 text-green-800 border-green-200'
            }>{manager.risk}</Badge>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <ShieldAlert className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{manager.pendingReviews} pending reviews</span>
          </div>
          <div className="text-sm">
            <span className={manager.certPct < 75 ? 'text-destructive font-medium' : 'text-green-600 font-medium'}>{manager.certPct}% certified</span>
          </div>
        </div>

        {/* Team members */}
        <div className="overflow-auto flex-1 pt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-2 font-medium">Team Member</th>
                <th className="pb-2 font-medium">Role</th>
                <th className="pb-2 font-medium">Risk</th>
                <th className="pb-2 font-medium">Certified</th>
                <th className="pb-2 font-medium">Last Review</th>
              </tr>
            </thead>
            <tbody>
              {mockTeamMembers.map((m, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="py-2.5 font-medium">{m.name}</td>
                  <td className="py-2.5 text-muted-foreground">{m.role}</td>
                  <td className="py-2.5">
                    <Badge className={
                      m.risk === 'High' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                        m.risk === 'Medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                          'bg-green-100 text-green-800 border-green-200'
                    }>{m.risk}</Badge>
                  </td>
                  <td className="py-2.5">
                    {m.certified
                      ? <Badge className="bg-green-100 text-green-800 border-green-200">Yes</Badge>
                      : <Badge className="bg-destructive/10 text-destructive border-destructive/20">No</Badge>
                    }
                  </td>
                  <td className="py-2.5 text-muted-foreground">{m.lastReview}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <DialogFooter className="pt-4">
          <Button variant="outline" size="sm" onClick={handleSendReminder}>
            <Mail className="h-3 w-3 mr-1" />Send Reminder
          </Button>
          <Button variant="outline" size="sm" onClick={handleReassign}>
            <RefreshCw className="h-3 w-3 mr-1" />Reassign Reviews
          </Button>
          <Button variant="destructive" size="sm" onClick={handleEscalate}>
            <AlertTriangle className="h-3 w-3 mr-1" />Escalate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
