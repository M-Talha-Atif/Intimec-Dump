import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Play, Pause, Settings, Users, Shield, Building, 
  Calendar, Clock, AlertTriangle, CheckCircle, Search, UserCheck, Eye
} from "lucide-react";
import { useState } from "react";
import { CampaignDetailsModal } from "./modals/CampaignDetailsModal";
import { useToast } from "@/hooks/use-toast";
import InfoTooltip from "@/components/dashboard/InfoTooltip";

interface Campaign {
  id: string;
  name: string;
  type: 'user-based' | 'role-based' | 'application-based' | 'entitlement-based' | 'sod-based' | 'event-driven';
  status: 'active' | 'paused' | 'completed' | 'draft';
  progress: number;
  totalItems: number;
  completedItems: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  dueDate: string;
  reviewer: string;
  complianceFramework: string[];
  createdDate: string;
  description: string;
}

const mockCampaigns: Campaign[] = [
  { id: "camp-001", name: "Q4 2024 User Access Certification", type: "user-based", status: "active", progress: 85, totalItems: 1250, completedItems: 1063, riskLevel: "medium", dueDate: "2024-12-31", reviewer: "Sarah Johnson", complianceFramework: ["SOX", "GDPR"], createdDate: "2024-11-01", description: "Quarterly user access review for all active employees" },
  { id: "camp-002", name: "SOX Critical Application Review", type: "application-based", status: "active", progress: 92, totalItems: 45, completedItems: 41, riskLevel: "high", dueDate: "2024-12-20", reviewer: "Michael Chen", complianceFramework: ["SOX"], createdDate: "2024-11-15", description: "Review of access to SOX-critical financial applications" },
  { id: "camp-003", name: "Privileged Access Audit", type: "role-based", status: "active", progress: 67, totalItems: 180, completedItems: 121, riskLevel: "critical", dueDate: "2024-12-25", reviewer: "Lisa Rodriguez", complianceFramework: ["ISO27001", "SOX"], createdDate: "2024-10-15", description: "Annual review of all privileged access roles and entitlements" },
  { id: "camp-004", name: "SoD Conflict Resolution", type: "sod-based", status: "paused", progress: 45, totalItems: 89, completedItems: 40, riskLevel: "high", dueDate: "2024-12-30", reviewer: "David Kim", complianceFramework: ["SOX", "COSO"], createdDate: "2024-11-10", description: "Review and remediation of segregation of duties conflicts" },
  { id: "camp-005", name: "GDPR Data Access Review", type: "entitlement-based", status: "completed", progress: 100, totalItems: 890, completedItems: 890, riskLevel: "medium", dueDate: "2024-11-30", reviewer: "Emma Thompson", complianceFramework: ["GDPR"], createdDate: "2024-10-01", description: "Review of access to personal data processing systems" },
];

interface CampaignListProps {
  onCampaignSelect: (campaignId: string) => void;
}

export const CampaignList = ({ onCampaignSelect }: CampaignListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [campaigns, setCampaigns] = useState(mockCampaigns);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { toast } = useToast();

  const getTypeIcon = (type: Campaign['type']) => {
    switch (type) {
      case 'user-based': return <Users className="h-4 w-4" />;
      case 'role-based': return <Shield className="h-4 w-4" />;
      case 'application-based': return <Building className="h-4 w-4" />;
      case 'entitlement-based': return <Settings className="h-4 w-4" />;
      case 'sod-based': return <AlertTriangle className="h-4 w-4" />;
      case 'event-driven': return <Calendar className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: Campaign['status']) => {
    switch (status) {
      case 'active': return <Play className="h-4 w-4 text-green-500" />;
      case 'paused': return <Pause className="h-4 w-4 text-yellow-500" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-primary" />;
      case 'draft': return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getRiskBadgeVariant = (risk: Campaign['riskLevel']) => {
    switch (risk) {
      case 'critical': return 'destructive' as const;
      case 'high': return 'destructive' as const;
      case 'medium': return 'secondary' as const;
      case 'low': return 'default' as const;
    }
  };

  const handleStatusToggle = (campaignId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    setCampaigns(prev => prev.map(c => c.id === campaignId ? { ...c, status: newStatus as any } : c));
    toast({ title: "Campaign Updated", description: `Status changed to ${newStatus}` });
  };

  const handleReassign = (campaignId: string) => {
    toast({ title: "Reassign Reviewer", description: "Reviewer reassignment dialog would open here" });
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) || campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    const matchesType = typeFilter === 'all' || campaign.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6 pt-4">
      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search campaigns..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="user-based">User-based</SelectItem>
            <SelectItem value="role-based">Role-based</SelectItem>
            <SelectItem value="application-based">Application-based</SelectItem>
            <SelectItem value="entitlement-based">Entitlement-based</SelectItem>
            <SelectItem value="sod-based">SoD-based</SelectItem>
            <SelectItem value="event-driven">Event-driven</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Campaign Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCampaigns.map((campaign) => (
          <Card key={campaign.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(campaign.type)}
                    <CardTitle className="text-lg">{campaign.name}</CardTitle>
                  </div>
                  <CardDescription>{campaign.description}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(campaign.status)}
                  <Badge variant={getRiskBadgeVariant(campaign.riskLevel)} className="flex items-center gap-1">
                    {campaign.riskLevel.toUpperCase()}
                    <InfoTooltip text={`This campaign has a ${campaign.riskLevel} risk level based on the aggregate risk scores of included entitlements.`} />
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span>Progress</span>
                    <span>{campaign.completedItems}/{campaign.totalItems} ({campaign.progress}%)</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${campaign.progress}%` }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Reviewer:</span>
                    <p className="font-medium">{campaign.reviewer}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Due Date:</span>
                    <p className="font-medium">{new Date(campaign.dueDate).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex gap-1 flex-wrap">
                  {campaign.complianceFramework.map((framework) => (
                    <Badge key={framework} variant="outline" className="text-xs">{framework}</Badge>
                  ))}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button size="sm" onClick={() => { setSelectedCampaign(campaign); setDetailsOpen(true); }}>
                    <Eye className="h-4 w-4 mr-1" /> Details
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onCampaignSelect(campaign.id)}>
                    View Campaign
                  </Button>
                  {(campaign.status === 'active' || campaign.status === 'paused') && (
                    <Button size="sm" variant="outline" onClick={() => handleStatusToggle(campaign.id, campaign.status)}>
                      {campaign.status === 'active' ? <><Pause className="h-4 w-4 mr-1" /> Pause</> : <><Play className="h-4 w-4 mr-1" /> Resume</>}
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => handleReassign(campaign.id)}>
                    <UserCheck className="h-4 w-4 mr-1" /> Reassign
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <CampaignDetailsModal
        campaign={selectedCampaign}
        open={detailsOpen}
        onClose={() => { setDetailsOpen(false); setSelectedCampaign(null); }}
        onCampaignUpdate={(updated) => setCampaigns(prev => prev.map(c => c.id === updated.id ? { ...c, status: updated.status as Campaign['status'] } : c))}
      />
    </div>
  );
};
