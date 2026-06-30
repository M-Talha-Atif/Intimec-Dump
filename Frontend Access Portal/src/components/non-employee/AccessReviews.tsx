
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, AlertTriangle, Calendar, User, Shield, Mail, Eye, Plus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import InfoTooltip from '@/components/dashboard/InfoTooltip';
import { NonEmployeeKpiDrilldownModal } from './modals/NonEmployeeKpiDrilldownModal';
import { NonEmployeeCampaignModal } from './modals/NonEmployeeCampaignModal';
import { toast } from "sonner";

const kpiCards = [
  { label: "Active Campaigns", value: "3", icon: CheckCircle, color: "text-green-500", tooltip: "Non-employee-specific review campaigns currently in progress." },
  { label: "Pending Reviews", value: "17", icon: Clock, color: "text-orange-500", tooltip: "Individual review items awaiting sponsor/reviewer decision." },
  { label: "Overdue Reviews", value: "5", icon: AlertTriangle, color: "text-red-500", tooltip: "Reviews past due date requiring escalation per SLA policy." },
  { label: "Avg Completion", value: "79%", icon: Shield, color: "text-blue-500", tooltip: "Average completion rate across all non-employee review campaigns." }
];

const reviewCampaigns = [
  { id: 'camp_1', name: 'Q2 Non-Employee Contractor Review', type: 'Scheduled', identitiesCount: 45, completed: 32, pending: 13, dueDate: '2024-06-30', status: 'In Progress', progress: 71 },
  { id: 'camp_2', name: 'Non-Employee High-Risk Vendor Access Review', type: 'Event-Driven', identitiesCount: 12, completed: 8, pending: 4, dueDate: '2024-06-25', status: 'Critical', progress: 67 },
  { id: 'camp_3', name: 'Non-Employee Intern Program Review', type: 'Ad-hoc', identitiesCount: 23, completed: 23, pending: 0, dueDate: '2024-06-15', status: 'Completed', progress: 100 },
  { id: 'camp_4', name: 'Non-Employee Partner Access Certification', type: 'Scheduled', identitiesCount: 18, completed: 10, pending: 8, dueDate: '2024-07-10', status: 'In Progress', progress: 56 }
];

const reviewTrend = [
  { month: 'Jan', completed: 28, pending: 8, overdue: 2 },
  { month: 'Feb', completed: 35, pending: 5, overdue: 1 },
  { month: 'Mar', completed: 22, pending: 12, overdue: 4 },
  { month: 'Apr', completed: 40, pending: 6, overdue: 0 },
  { month: 'May', completed: 32, pending: 9, overdue: 3 },
  { month: 'Jun', completed: 38, pending: 7, overdue: 2 }
];

const pendingReviews = [
  { id: 'rev_1', nonEmployee: 'Alex Thompson', type: 'Contractor', reviewer: 'Jane Smith', accessItems: 15, dueDate: '2024-06-25', riskLevel: 'Medium', daysOverdue: 0 },
  { id: 'rev_2', nonEmployee: 'Maria Rodriguez', type: 'Consultant', reviewer: 'Bob Brown', accessItems: 8, dueDate: '2024-06-20', riskLevel: 'High', daysOverdue: 5 },
  { id: 'rev_3', nonEmployee: 'David Chen', type: 'Vendor', reviewer: 'Carol Wilson', accessItems: 22, dueDate: '2024-06-22', riskLevel: 'Critical', daysOverdue: 3 }
];

export function AccessReviews() {
  const [kpiModal, setKpiModal] = useState<{ open: boolean; label: string; value: string | number }>({ open: false, label: '', value: '' });
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
                <p className="text-sm font-medium text-muted-foreground">{kpi.label}</p>
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

      {/* Campaign List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle>Non-Employee Certification Campaigns</CardTitle>
              <InfoTooltip text="Active and recent access review campaigns scoped to non-employee identities." />
            </div>
            <Button size="sm" onClick={() => toast.info("Create Campaign wizard opened")}>
              <Plus className="h-4 w-4 mr-1" /> Create Campaign
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviewCampaigns.map((campaign) => (
              <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{campaign.name}</CardTitle>
                    <Badge className={
                      campaign.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      campaign.status === 'Critical' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                    }>{campaign.status}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">{campaign.type}</div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1"><span>Progress</span><span>{campaign.progress}%</span></div>
                      <Progress value={campaign.progress} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="font-medium">Total: </span>{campaign.identitiesCount}</div>
                      <div><span className="font-medium">Done: </span><span className="text-green-600">{campaign.completed}</span></div>
                      <div><span className="font-medium">Pending: </span><span className="text-orange-600">{campaign.pending}</span></div>
                      <div><span className="font-medium">Due: </span>{campaign.dueDate}</div>
                    </div>
                    <Button size="sm" className="w-full" onClick={() => setCampaignModal({ open: true, campaign })}>
                      <Eye className="h-4 w-4 mr-1" /> Manage
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pending Reviews */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Pending Non-Employee Reviews</span>
            </CardTitle>
            <InfoTooltip text="Individual review items awaiting action. Red items are overdue." />
          </div>
          <Badge variant="destructive">{pendingReviews.filter(r => r.daysOverdue > 0).length} Overdue</Badge>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingReviews.map((review) => (
              <div key={review.id} className={`border rounded-lg p-4 ${review.daysOverdue > 0 ? 'border-red-200 bg-red-50' : ''}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div><div className="font-medium">{review.nonEmployee}</div><div className="text-sm text-muted-foreground">{review.type}</div></div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={
                      review.riskLevel === 'Critical' ? 'bg-red-100 text-red-800' :
                      review.riskLevel === 'High' ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'
                    }>{review.riskLevel} Risk</Badge>
                    {review.daysOverdue > 0 && <Badge variant="destructive">{review.daysOverdue}d overdue</Badge>}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                  <div><span className="font-medium">Reviewer: </span>{review.reviewer}</div>
                  <div><span className="font-medium">Access: </span>{review.accessItems} items</div>
                  <div><span className="font-medium">Due: </span>{review.dueDate}</div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button size="sm" variant="outline" onClick={() => toast.success(`Reminder sent to ${review.reviewer}`)}>
                    <Mail className="h-4 w-4 mr-1" /> Remind
                  </Button>
                  <Button size="sm" onClick={() => toast.info(`Review started for ${review.nonEmployee}`)}>
                    <Eye className="h-4 w-4 mr-1" /> Start Review
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Review Trends */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Review Completion Trends</CardTitle>
            <InfoTooltip text="Monthly non-employee review performance showing completion, pending, and overdue counts." />
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reviewTrend}>
              <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip /><Legend />
              <Bar dataKey="completed" fill="#10b981" name="Completed" />
              <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
              <Bar dataKey="overdue" fill="#ef4444" name="Overdue" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <NonEmployeeKpiDrilldownModal open={kpiModal.open} onOpenChange={(o) => setKpiModal(p => ({ ...p, open: o }))} kpiLabel={kpiModal.label} kpiValue={kpiModal.value} />
      <NonEmployeeCampaignModal open={campaignModal.open} onOpenChange={(o) => setCampaignModal(p => ({ ...p, open: o }))} campaign={campaignModal.campaign} />
    </div>
  );
}
