import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Play, Pause, Clock, Users, CheckCircle, Mail, Settings,
  AlertTriangle, Wrench
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import InfoTooltip from "@/components/dashboard/InfoTooltip";
import { getStatusBadgeClass } from '@/utils/getBadgeClass';
import { cn } from '@/lib/utils';

interface Campaign {
  id: string;
  name: string;
  type: string;
  status: string;
  progress: number;
  totalItems: number;
  completedItems: number;
  riskLevel: string;
  dueDate: string;
  reviewer: string;
  complianceFramework: string[];
  createdDate: string;
  description: string;
}

interface CampaignDetailsModalProps {
  campaign: Campaign | null;
  open: boolean;
  onClose: () => void;
  onCampaignUpdate: (campaign: Campaign) => void;
}

const remediationItems = [
  { id: "rem-001", action: "Deprovision SAP_ADMIN", target: "John Smith", status: "completed", completedAt: "2024-11-16" },
  { id: "rem-002", action: "Reduce scope: ORACLE_GL_WRITE → READ", target: "Mary Williams", status: "in-progress", completedAt: null },
  { id: "rem-003", action: "Remove journal approval rights", target: "Finance Controller role", status: "queued", completedAt: null },
];

export const CampaignDetailsModal = ({ campaign, open, onClose, onCampaignUpdate }: CampaignDetailsModalProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  if (!campaign) return null;

  const handleStatusChange = (newStatus: string) => {
    onCampaignUpdate({ ...campaign, status: newStatus });
    toast({ title: "Campaign Updated", description: `Campaign status changed to ${newStatus}` });
  };

  const mockReviewItems = [
    { user: 'John Smith', riskScore: 85, status: 'pending', itemsCount: 15 },
    { user: 'Sarah Johnson', riskScore: 42, status: 'completed', itemsCount: 8 },
    { user: 'Mike Chen', riskScore: 73, status: 'in-progress', itemsCount: 12 },
    { user: 'Lisa Rodriguez', riskScore: 91, status: 'pending', itemsCount: 22 },
  ];


  const getRemediationStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default' as const;
      case 'in-progress': return 'secondary' as const;
      case 'queued': return 'outline' as const;
      default: return 'outline' as const;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-xl">{campaign.name}</DialogTitle>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge className={cn(getStatusBadgeClass(campaign.status), "border text-xs")}>{campaign.status.toUpperCase()}</Badge>
                <Badge variant="outline">{campaign.type}</Badge>
                {campaign.complianceFramework.map(framework => (
                  <Badge key={framework} variant="secondary">{framework}</Badge>
                ))}
              </div>
            </div>
            <div className="flex gap-2 mr-4 mb-4">
              {campaign.status === 'draft' && (
                <Button onClick={() => handleStatusChange('active')}><Play className="h-4 w-4 mr-2" /> Launch</Button>
              )}
              {campaign.status === 'active' && (
                <Button variant="outline" onClick={() => handleStatusChange('paused')}><Pause className="h-4 w-4 mr-2" /> Pause</Button>
              )}
              {campaign.status === 'paused' && (
                <Button onClick={() => handleStatusChange('active')}><Play className="h-4 w-4 mr-2" /> Resume</Button>
              )}
              <Button variant="outline"><Settings className="h-4 w-4 mr-2" /> Configure</Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="audit">Audit Trail</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 pt-4">
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-primary/5 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      Total Items
                      <InfoTooltip text="Total entitlements and access assignments included in this campaign scope." />
                    </p>
                    <p className="text-2xl font-bold">{campaign.totalItems}</p>
                  </div>
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </div>
              <div className="p-4 bg-green-500/5 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      Completed
                      <InfoTooltip text="Items that have received a final review decision (approve, revoke, or modify)." />
                    </p>
                    <p className="text-2xl font-bold text-green-700">{campaign.completedItems}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <div className="p-4 bg-orange-500/5 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      Remaining
                      <InfoTooltip text="Items still awaiting reviewer action before the campaign deadline." />
                    </p>
                    <p className="text-2xl font-bold text-orange-700">{campaign.totalItems - campaign.completedItems}</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-muted-foreground">{campaign.progress}%</span>
              </div>
              <Progress value={campaign.progress} className="h-2" />
            </div>

            {/* Campaign Details + Risk Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Campaign Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Type:</span><span className="font-medium">{campaign.type}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Reviewer:</span><span className="font-medium">{campaign.reviewer}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Due Date:</span><span className="font-medium">{new Date(campaign.dueDate).toLocaleDateString()}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Created:</span><span className="font-medium">{new Date(campaign.createdDate).toLocaleDateString()}</span></div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Risk Distribution</h4>
                <div className="space-y-2">
                  {[{ label: "High Risk", pct: 25, color: "bg-destructive" }, { label: "Medium Risk", pct: 45, color: "bg-yellow-500" }, { label: "Low Risk", pct: 30, color: "bg-green-500" }].map(r => (
                    <div key={r.label} className="flex justify-between items-center">
                      <span className="text-sm">{r.label}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-muted rounded-full h-2"><div className={`${r.color} h-2 rounded-full`} style={{ width: `${r.pct}%` }} /></div>
                        <span className="text-sm">{r.pct}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Remediation Status */}
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-1.5">
                <Wrench className="h-4 w-4" />
                Remediation Status
                <InfoTooltip text="Automated and manual remediation actions triggered by revoke/modify decisions in this campaign." />
              </h4>
              <div className="space-y-2">
                {remediationItems.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-3 rounded-lg border">
                    <div>
                      <p className="text-sm font-medium">{item.action}</p>
                      <p className="text-xs text-muted-foreground">Target: {item.target}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getRemediationStatusColor(item.status)}>{item.status}</Badge>
                      {item.completedAt && <span className="text-xs text-muted-foreground">{item.completedAt}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="progress" className="space-y-4 pt-4">
            <h4 className="font-semibold">Review Items Status</h4>
            {mockReviewItems.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{item.user}</p>
                    <p className="text-sm text-muted-foreground">{item.itemsCount} access items</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={item.riskScore > 80 ? 'destructive' : item.riskScore > 60 ? 'secondary' : 'default'}>
                    Risk: {item.riskScore}
                  </Badge>
                  <Badge className={cn(getStatusBadgeClass(item.status), "border text-xs")}>
                    {item.status}</Badge>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="settings" className="space-y-4 pt-4">
            <h4 className="font-semibold">Campaign Configuration</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h5 className="font-medium mb-2">Notifications</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span>Email Reminders</span><Badge>Enabled</Badge></div>
                  <div className="flex justify-between"><span>Slack Integration</span><Badge variant="outline">Disabled</Badge></div>
                  <div className="flex justify-between"><span>Escalation Rules</span><Badge>Active</Badge></div>
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <h5 className="font-medium mb-2">Review Rules</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span>Auto-approve Low Risk</span><Badge variant="outline">Disabled</Badge></div>
                  <div className="flex justify-between"><span>Require Justification</span><Badge>High Risk Only</Badge></div>
                  <div className="flex justify-between"><span>SoD Validation</span><Badge>Enabled</Badge></div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="audit" className="space-y-4 pt-4">
            <h4 className="font-semibold">Campaign Audit Trail</h4>
            <div className="space-y-2">
              {[
                { action: 'Campaign Created', user: 'Admin User', timestamp: '2024-01-15 10:30:00', details: 'Initial campaign setup completed' },
                { action: 'Configuration Updated', user: 'John Doe', timestamp: '2024-01-15 11:15:00', details: 'Updated SLA settings and notification rules' },
                { action: 'Campaign Launched', user: 'Admin User', timestamp: '2024-01-15 14:00:00', details: 'Campaign activated and reviewers notified' },
                { action: 'Review Completed', user: 'Sarah Johnson', timestamp: '2024-01-16 09:45:00', details: 'Completed review for 15 access items' },
              ].map((event, index) => (
                <div key={index} className="flex justify-between items-start p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">{event.action}</p>
                    <p className="text-sm text-muted-foreground">{event.details}</p>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>{event.user}</p>
                    <p>{event.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button><Mail className="h-4 w-4 mr-2" /> Send Reminder</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
