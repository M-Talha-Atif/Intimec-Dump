import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Users, AlertTriangle, Clock, CheckCircle, XCircle,
  Search, Calendar, Shield, ChevronRight
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BulkReviewModal } from "@/components/access-review/advanced/BulkReviewModal";
import InfoTooltip from "@/components/dashboard/InfoTooltip";

interface ReviewQueueItem {
  id: string;
  campaignId: string;
  campaignName: string;
  userName: string;
  userDepartment: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  itemCount: number;
  dueDate: string;
  daysUntilDue: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

const mockReviewQueue: ReviewQueueItem[] = [
  { id: "rq-001", campaignId: "camp-001", campaignName: "Q4 2024 User Access Certification", userName: "John Smith", userDepartment: "Finance", riskScore: 91, riskLevel: "critical", itemCount: 22, dueDate: "2024-12-18", daysUntilDue: 1, priority: "critical" },
  { id: "rq-002", campaignId: "camp-002", campaignName: "SOX Critical Application Review", userName: "Sarah Johnson", userDepartment: "IT", riskScore: 85, riskLevel: "high", itemCount: 15, dueDate: "2024-12-20", daysUntilDue: 3, priority: "high" },
  { id: "rq-003", campaignId: "camp-001", campaignName: "Q4 2024 User Access Certification", userName: "Michael Chen", userDepartment: "Operations", riskScore: 42, riskLevel: "medium", itemCount: 8, dueDate: "2024-12-25", daysUntilDue: 8, priority: "medium" },
  { id: "rq-004", campaignId: "camp-003", campaignName: "Privileged Access Audit", userName: "Lisa Rodriguez", userDepartment: "Security", riskScore: 78, riskLevel: "high", itemCount: 18, dueDate: "2024-12-22", daysUntilDue: 5, priority: "high" },
  { id: "rq-005", campaignId: "camp-001", campaignName: "Q4 2024 User Access Certification", userName: "David Kim", userDepartment: "Marketing", riskScore: 28, riskLevel: "low", itemCount: 5, dueDate: "2024-12-31", daysUntilDue: 14, priority: "low" },
];

export const MyReviewsTab = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<'approve' | 'revoke'>('approve');

  const totalItems = mockReviewQueue.length;
  const completedItems = 0;
  const progressPercentage = Math.round((completedItems / totalItems) * 100);

  const getRiskBadgeVariant = (risk: string) => {
    switch (risk) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'default';
      default: return 'outline';
    }
  };

  const getDueDateColor = (daysUntilDue: number) => {
    if (daysUntilDue <= 1) return 'text-red-600 bg-red-50';
    if (daysUntilDue <= 3) return 'text-orange-600 bg-orange-50';
    if (daysUntilDue <= 7) return 'text-yellow-600 bg-yellow-50';
    return 'text-muted-foreground bg-muted';
  };

  const filteredQueue = mockReviewQueue.filter(item => {
    const matchesSearch = item.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.campaignName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.userDepartment.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = riskFilter === 'all' || item.riskLevel === riskFilter;
    const matchesPriority = priorityFilter === 'all' || item.priority === priorityFilter;
    return matchesSearch && matchesRisk && matchesPriority;
  });

  const handleSelectItem = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) newSelected.delete(itemId);
    else newSelected.add(itemId);
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === filteredQueue.length) setSelectedItems(new Set());
    else setSelectedItems(new Set(filteredQueue.map(item => item.id)));
  };

  const handleReviewItem = (item: ReviewQueueItem) => {
    router.push(`/access-review/campaign/${item.campaignId}`);
  };

  return (
    <div className="space-y-6 pt-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  Total Pending
                  <InfoTooltip text="Total review items assigned to you that are awaiting a decision." />
                </p>
                <p className="text-2xl font-bold">{totalItems}</p>
              </div>
              <Clock className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  Overdue
                  <InfoTooltip text="Items past their SLA deadline. These require immediate action to maintain compliance." />
                </p>
                <p className="text-2xl font-bold text-destructive">
                  {filteredQueue.filter(i => i.daysUntilDue <= 0).length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  High Risk
                  <InfoTooltip text="Items with elevated risk scores requiring careful evaluation before approval." />
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {filteredQueue.filter(i => i.riskLevel === 'high' || i.riskLevel === 'critical').length}
                </p>
              </div>
              <Shield className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  Progress
                  <InfoTooltip text="Percentage of your assigned review items that have been completed." />
                </p>
                <p className="text-2xl font-bold text-green-600">{progressPercentage}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by user, campaign, or department..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <Select value={riskFilter} onValueChange={setRiskFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Risk Level" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Risk</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk Actions */}
      {selectedItems.size > 0 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox checked={selectedItems.size === filteredQueue.length} onCheckedChange={handleSelectAll} />
                <span className="font-medium">{selectedItems.size} items selected</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => { setBulkAction('approve'); setBulkModalOpen(true); }}>
                  <CheckCircle className="h-4 w-4 mr-1" /> Bulk Approve
                </Button>
                <Button size="sm" variant="outline" onClick={() => { setBulkAction('revoke'); setBulkModalOpen(true); }}>
                  <XCircle className="h-4 w-4 mr-1" /> Bulk Revoke
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Review Queue */}
      <div className="space-y-3">
        {filteredQueue.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleReviewItem(item)}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Checkbox checked={selectedItems.has(item.id)} onCheckedChange={() => handleSelectItem(item.id)} onClick={(e) => e.stopPropagation()} />
                <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{item.userName}</p>
                        <p className="text-sm text-muted-foreground">{item.userDepartment}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Campaign</p>
                    <p className="font-medium text-sm truncate">{item.campaignName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getRiskBadgeVariant(item.riskLevel)}>Risk: {item.riskScore}</Badge>
                    <Badge variant="outline">{item.itemCount} items</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge className={getDueDateColor(item.daysUntilDue)}>
                      <Calendar className="h-3 w-3 mr-1" />
                      {item.daysUntilDue === 0 ? 'Due Today' :
                       item.daysUntilDue < 0 ? `${Math.abs(item.daysUntilDue)}d Overdue` :
                       item.daysUntilDue === 1 ? 'Due Tomorrow' :
                       `${item.daysUntilDue}d Remaining`}
                    </Badge>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredQueue.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold">No reviews found</h3>
            <p className="text-muted-foreground mt-1">
              {searchTerm || riskFilter !== 'all' || priorityFilter !== 'all' ? 'Try adjusting your filters' : 'You have no pending reviews at this time'}
            </p>
          </CardContent>
        </Card>
      )}

      <BulkReviewModal open={bulkModalOpen} onOpenChange={setBulkModalOpen} selectedItems={Array.from(selectedItems)} onComplete={() => { setSelectedItems(new Set()); setBulkModalOpen(false); }} />
    </div>
  );
};
