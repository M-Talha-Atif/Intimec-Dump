
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClipboardCheck, AlertTriangle, Play, Pause, Settings, BarChart3, Plus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import InfoTooltip from '@/components/dashboard/InfoTooltip';
import { NhiKpiDrilldownModal } from './modals/NhiKpiDrilldownModal';
import { NhiCampaignManageModal } from './modals/NhiCampaignManageModal';
import { toast } from "sonner";

const reviewCampaigns = [
  { id: 'camp_001', name: 'NHI Quarterly High-Privilege Review', status: 'Active', progress: 67, totalNHIs: 234, reviewedNHIs: 156, dueDate: '2024-07-15', reviewers: ['Security Team', 'Platform Team'], scope: 'High privilege NHIs with admin access' },
  { id: 'camp_002', name: 'NHI GitHub Secrets Audit', status: 'Pending', progress: 0, totalNHIs: 89, reviewedNHIs: 0, dueDate: '2024-07-30', reviewers: ['DevOps Team', 'Security Officer'], scope: 'All GitHub secrets created >90 days ago' },
  { id: 'camp_003', name: 'NHI Orphaned Account Cleanup', status: 'Completed', progress: 100, totalNHIs: 45, reviewedNHIs: 45, dueDate: '2024-06-20', reviewers: ['HR', 'IT Manager'], scope: 'NHIs owned by departed employees' },
  { id: 'camp_004', name: 'NHI Dormant Credential Review', status: 'Active', progress: 42, totalNHIs: 187, reviewedNHIs: 78, dueDate: '2024-08-01', reviewers: ['Platform Team', 'Infrastructure'], scope: 'NHIs unused for 60+ days' }
];

const reviewMetrics = [
  { month: 'Jan', completed: 45, pending: 12, overdue: 3 },
  { month: 'Feb', completed: 52, pending: 8, overdue: 2 },
  { month: 'Mar', completed: 38, pending: 15, overdue: 5 },
  { month: 'Apr', completed: 61, pending: 9, overdue: 1 },
  { month: 'May', completed: 47, pending: 11, overdue: 4 },
  { month: 'Jun', completed: 53, pending: 7, overdue: 2 }
];

const kpiCards = [
  { label: "Active Campaigns", value: "4", icon: Play, color: "text-green-500", tooltip: "NHI-specific certification campaigns currently in progress." },
  { label: "NHIs Under Review", value: "510", icon: ClipboardCheck, color: "text-blue-500", tooltip: "Total NHIs across all active campaigns pending or in-progress review." },
  { label: "Overdue Reviews", value: "12", icon: AlertTriangle, color: "text-orange-500", tooltip: "Review items past their due date requiring escalation." },
  { label: "Avg Completion", value: "89%", icon: BarChart3, color: "text-purple-500", tooltip: "Average completion rate across all NHI review campaigns." }
];

export function ReviewsManagement() {
  const [kpiModal, setKpiModal] = useState<{ open: boolean; label: string; value: string }>({ open: false, label: '', value: '' });
  const [campaignModal, setCampaignModal] = useState<{ open: boolean; campaign: any }>({ open: false, campaign: null });

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {kpiCards.map((kpi, index) => (
          <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setKpiModal({ open: true, label: kpi.label, value: kpi.value })}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-slate-600">{kpi.label}</p>
                <InfoTooltip text={kpi.tooltip} />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold">{kpi.value}</p>
                <kpi.icon className={`h-8 w-8 ${kpi.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Campaign List — flattened from tabs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle>NHI Certification Campaigns</CardTitle>
              <InfoTooltip text="Active and recent NHI-specific access review campaigns. Click Manage to view details." />
            </div>
            <Button size="sm" onClick={() => toast.info("Create Campaign wizard opened")}>
              <Plus className="h-4 w-4 mr-1" /> Create Campaign
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reviewCampaigns.map((campaign) => (
              <div key={campaign.id} className="border rounded-lg p-4 hover:bg-muted/50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-base font-semibold">{campaign.name}</h3>
                      <Badge variant={campaign.status === 'Active' ? 'default' : campaign.status === 'Completed' ? 'secondary' : 'outline'}>
                        {campaign.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">{campaign.scope}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div><p className="text-xs text-slate-500">Progress</p><p className="font-medium">{campaign.progress}%</p></div>
                      <div><p className="text-xs text-slate-500">NHIs</p><p className="font-medium">{campaign.reviewedNHIs}/{campaign.totalNHIs}</p></div>
                      <div><p className="text-xs text-slate-500">Due Date</p><p className="font-medium">{campaign.dueDate}</p></div>
                      <div><p className="text-xs text-slate-500">Reviewers</p>
                        <div className="flex flex-wrap gap-1">{campaign.reviewers.map((r, i) => (<Badge key={i} variant="outline" className="text-xs">{r}</Badge>))}</div>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${campaign.progress}%` }} />
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    {campaign.status === 'Active' && (
                      <Button size="sm" variant="outline" onClick={() => toast.info("Campaign paused")}><Pause className="h-4 w-4" /></Button>
                    )}
                    <Button size="sm" onClick={() => setCampaignModal({ open: true, campaign })}>Manage</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Review Trends Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Review Completion Trends</CardTitle>
            <InfoTooltip text="Monthly NHI review performance. Shows completion, pending, and overdue counts." />
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reviewMetrics}>
              <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip /><Legend />
              <Bar dataKey="completed" fill="#10b981" name="Completed" />
              <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
              <Bar dataKey="overdue" fill="#ef4444" name="Overdue" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <NhiKpiDrilldownModal open={kpiModal.open} onOpenChange={(o) => setKpiModal(p => ({ ...p, open: o }))} kpiLabel={kpiModal.label} kpiValue={kpiModal.value} />
      <NhiCampaignManageModal open={campaignModal.open} onOpenChange={(o) => setCampaignModal(p => ({ ...p, open: o }))} campaign={campaignModal.campaign} />
    </div>
  );
}
