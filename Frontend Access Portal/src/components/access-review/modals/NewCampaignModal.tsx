
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Users, Shield, Building, Settings, AlertTriangle, Calendar, Target } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface NewCampaignModalProps {
  onCampaignCreate: (campaign: any) => void;
}

export const NewCampaignModal = ({ onCampaignCreate }: NewCampaignModalProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '',
    scope: {
      users: [],
      groups: [],
      applications: []
    },
    reviewerAssignment: 'manager',
    customReviewer: '',
    slaHours: 168,
    autoCloseAfterSLA: false,
    preReviewSimulation: true,
    notifications: {
      email: true,
      slack: false,
      teams: false
    },
    complianceTags: [] as string[],
    riskThreshold: 'medium'
  });
  
  const { toast } = useToast();

  const campaignTypes = [
    { value: 'user-based', label: 'User-based Review', icon: Users, description: 'Review all access for selected users' },
    { value: 'entitlement-based', label: 'Entitlement-based Review', icon: Shield, description: 'Review specific entitlements across users' },
    { value: 'role-based', label: 'Role-based Review', icon: Target, description: 'Review all users assigned to specific roles' },
    { value: 'application-based', label: 'Application-based Review', icon: Building, description: 'Review all access to specific applications' },
    { value: 'event-driven', label: 'Event-driven Review', icon: Calendar, description: 'Triggered by specific events or changes' },
    { value: 'sod-based', label: 'SoD Review', icon: AlertTriangle, description: 'Review segregation of duties conflicts' },
    { value: 'hybrid', label: 'Hybrid/Mixed Campaign', icon: Settings, description: 'Combination of multiple review types' }
  ];

  const complianceOptions = ['SOX', 'GDPR', 'HIPAA', 'PCI-DSS', 'ISO27001', 'NIST', 'COSO'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.type) {
      toast({
        title: "Validation Error",
        description: "Campaign name and type are required.",
        variant: "destructive"
      });
      return;
    }

    const newCampaign = {
      id: `camp-${Date.now()}`,
      ...formData,
      status: 'draft',
      progress: 0,
      totalItems: Math.floor(Math.random() * 500) + 100,
      completedItems: 0,
      createdDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + formData.slaHours * 60 * 60 * 1000).toISOString(),
      reviewer: formData.reviewerAssignment === 'custom' ? formData.customReviewer : 'Auto-assigned'
    };

    onCampaignCreate(newCampaign);
    setOpen(false);
    
    toast({
      title: "Campaign Created",
      description: `${formData.name} has been created successfully.`,
    });

    setFormData({
      name: '',
      description: '',
      type: '',
      scope: { users: [], groups: [], applications: [] },
      reviewerAssignment: 'manager',
      customReviewer: '',
      slaHours: 168,
      autoCloseAfterSLA: false,
      preReviewSimulation: true,
      notifications: { email: true, slack: false, teams: false },
      complianceTags: [],
      riskThreshold: 'medium'
    });
  };

  const toggleComplianceTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      complianceTags: prev.complianceTags.includes(tag)
        ? prev.complianceTags.filter(t => t !== tag)
        : [...prev.complianceTags, tag]
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Campaign
        </Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col p-0 h-full">
        <div className="flex flex-col h-full min-w-0">
          <div className="flex-shrink-0">
            <DialogHeader>
              <DialogTitle>Create New Access Review Campaign</DialogTitle>
              <DialogDescription>
                Define the scope, reviewers, and configuration for a new access certification campaign.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="flex-1 min-h-0 pt-4 pb-6 overflow-hidden">
            <ScrollArea className="h-full pr-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="campaign-name">Campaign Name *</Label>
                    <Input
                      id="campaign-name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Q1 2024 User Access Review"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="risk-threshold">Risk Threshold</Label>
                    <Select value={formData.riskThreshold} onValueChange={(value) => setFormData(prev => ({ ...prev, riskThreshold: value }))}>
                      <SelectTrigger id="risk-threshold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low Risk & Above</SelectItem>
                        <SelectItem value="medium">Medium Risk & Above</SelectItem>
                        <SelectItem value="high">High Risk Only</SelectItem>
                        <SelectItem value="critical">Critical Risk Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the purpose and scope of this review campaign..."
                    rows={3}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Campaign Type *</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {campaignTypes.map((type) => (
                      <div
                        key={type.value}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          formData.type === type.value ? 'border-primary bg-primary/5' : 'hover:border-muted-foreground/30'
                        }`}
                        onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                      >
                        <div className="flex items-start gap-3">
                          <type.icon className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <h4 className="font-medium">{type.label}</h4>
                            <p className="text-sm text-muted-foreground">{type.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Reviewer Assignment</Label>
                  <Select value={formData.reviewerAssignment} onValueChange={(value) => setFormData(prev => ({ ...prev, reviewerAssignment: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manager">Auto-assign to Manager</SelectItem>
                      <SelectItem value="owner">Auto-assign to Resource Owner</SelectItem>
                      <SelectItem value="role">Assign by Role</SelectItem>
                      <SelectItem value="custom">Custom Reviewer</SelectItem>
                    </SelectContent>
                  </Select>
                  {formData.reviewerAssignment === 'custom' && (
                    <Input
                      value={formData.customReviewer}
                      onChange={(e) => setFormData(prev => ({ ...prev, customReviewer: e.target.value }))}
                      placeholder="Enter reviewer email or name"
                    />
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sla-hours">SLA (Hours)</Label>
                    <Input
                      id="sla-hours"
                      type="number"
                      value={formData.slaHours}
                      onChange={(e) => setFormData(prev => ({ ...prev, slaHours: parseInt(e.target.value) }))}
                      min="1"
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <Checkbox
                      id="auto-close"
                      checked={formData.autoCloseAfterSLA}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, autoCloseAfterSLA: checked as boolean }))}
                    />
                    <Label htmlFor="auto-close">Auto-close after SLA expiry</Label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="pre-simulation"
                      checked={formData.preReviewSimulation}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, preReviewSimulation: checked as boolean }))}
                    />
                    <Label htmlFor="pre-simulation">Run pre-review simulation</Label>
                  </div>

                  <div className="space-y-2">
                    <Label>Notification Channels</Label>
                    <div className="flex space-x-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="email-notifications" checked={formData.notifications.email} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, notifications: { ...prev.notifications, email: checked as boolean } }))} />
                        <Label htmlFor="email-notifications">Email</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="slack-notifications" checked={formData.notifications.slack} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, notifications: { ...prev.notifications, slack: checked as boolean } }))} />
                        <Label htmlFor="slack-notifications">Slack</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="teams-notifications" checked={formData.notifications.teams} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, notifications: { ...prev.notifications, teams: checked as boolean } }))} />
                        <Label htmlFor="teams-notifications">Teams</Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Compliance Framework Tags</Label>
                    <div className="flex flex-wrap gap-2">
                      {complianceOptions.map((tag) => (
                        <Badge key={tag} variant={formData.complianceTags.includes(tag) ? "default" : "outline"} className="cursor-pointer" onClick={() => toggleComplianceTag(tag)}>
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button type="submit">Create Campaign</Button>
                </div>
              </form>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
