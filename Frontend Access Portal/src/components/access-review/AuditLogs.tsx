import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Download, Search, CheckCircle, XCircle, 
  Clock, AlertTriangle, User, Shield, FileText, Calendar
} from "lucide-react";
import { useState } from "react";
import InfoTooltip from "@/components/dashboard/InfoTooltip";

interface AuditLogEntry {
  id: string;
  timestamp: string;
  campaignId: string;
  campaignName: string;
  reviewerId: string;
  reviewerName: string;
  itemType: 'user' | 'role' | 'entitlement' | 'application';
  itemName: string;
  decision: 'approve' | 'revoke' | 'modify';
  justification: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  aiSuggestionUsed: boolean;
  complianceFramework: string[];
  ipAddress: string;
  sessionId: string;
  beforeState?: any;
  afterState?: any;
}

const mockAuditLogs: AuditLogEntry[] = [
  { id: "audit-rev-001", timestamp: "2024-11-16T14:30:45Z", campaignId: "camp-001", campaignName: "Q4 2024 User Access Certification", reviewerId: "reviewer-001", reviewerName: "Sarah Johnson", itemType: "user", itemName: "John Smith", decision: "revoke", justification: "Administrative access unused for 45+ days. Following least privilege principle.", riskLevel: "high", aiSuggestionUsed: true, complianceFramework: ["SOX", "GDPR"], ipAddress: "192.168.1.45", sessionId: "sess-abc123", beforeState: { access: ["SAP_ADMIN", "ORACLE_GL_WRITE"] }, afterState: { access: ["ORACLE_GL_WRITE"] } },
  { id: "audit-rev-002", timestamp: "2024-11-16T14:25:12Z", campaignId: "camp-001", campaignName: "Q4 2024 User Access Certification", reviewerId: "reviewer-001", reviewerName: "Sarah Johnson", itemType: "user", itemName: "Mary Williams", decision: "approve", justification: "Access appropriate for role. Regular usage confirmed.", riskLevel: "medium", aiSuggestionUsed: true, complianceFramework: ["GDPR"], ipAddress: "192.168.1.45", sessionId: "sess-abc123" },
  { id: "audit-rev-003", timestamp: "2024-11-16T13:45:33Z", campaignId: "camp-002", campaignName: "SOX Critical Application Review", reviewerId: "reviewer-002", reviewerName: "Michael Chen", itemType: "role", itemName: "Finance Controller", decision: "modify", justification: "SoD violation detected. Removing journal approval rights while maintaining read access.", riskLevel: "critical", aiSuggestionUsed: false, complianceFramework: ["SOX"], ipAddress: "10.0.1.23", sessionId: "sess-def456" },
  { id: "audit-rev-004", timestamp: "2024-11-16T13:20:18Z", campaignId: "camp-003", campaignName: "Privileged Access Audit", reviewerId: "reviewer-003", reviewerName: "Lisa Rodriguez", itemType: "entitlement", itemName: "Database Admin Rights", decision: "approve", justification: "Critical infrastructure role. Emergency access protocols verified.", riskLevel: "critical", aiSuggestionUsed: true, complianceFramework: ["ISO27001", "SOX"], ipAddress: "172.16.2.10", sessionId: "sess-ghi789" },
];

export const AuditLogs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [decisionFilter, setDecisionFilter] = useState("all");
  const [campaignFilter, setCampaignFilter] = useState("all");
  const [reviewerFilter, setReviewerFilter] = useState("all");

  const getDecisionIcon = (decision: string) => {
    switch (decision) {
      case 'approve': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'revoke': return <XCircle className="h-4 w-4 text-destructive" />;
      case 'modify': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getDecisionBadgeVariant = (decision: string) => {
    switch (decision) {
      case 'approve': return 'default' as const;
      case 'revoke': return 'destructive' as const;
      case 'modify': return 'secondary' as const;
      default: return 'outline' as const;
    }
  };

  const getRiskBadgeVariant = (risk: string) => {
    switch (risk) {
      case 'critical': return 'destructive' as const;
      case 'high': return 'destructive' as const;
      case 'medium': return 'secondary' as const;
      case 'low': return 'default' as const;
      default: return 'outline' as const;
    }
  };

  const getItemTypeIcon = (type: string) => {
    switch (type) {
      case 'user': return <User className="h-4 w-4" />;
      case 'role': return <Shield className="h-4 w-4" />;
      case 'entitlement': return <FileText className="h-4 w-4" />;
      case 'application': return <Calendar className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const filteredLogs = mockAuditLogs.filter(log => {
    const matchesSearch = log.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.reviewerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.campaignName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.justification.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDecision = decisionFilter === 'all' || log.decision === decisionFilter;
    const matchesCampaign = campaignFilter === 'all' || log.campaignId === campaignFilter;
    const matchesReviewer = reviewerFilter === 'all' || log.reviewerId === reviewerFilter;
    return matchesSearch && matchesDecision && matchesCampaign && matchesReviewer;
  });

  const uniqueCampaigns = [...new Set(mockAuditLogs.map(log => ({ id: log.campaignId, name: log.campaignName })))];
  const uniqueReviewers = [...new Set(mockAuditLogs.map(log => ({ id: log.reviewerId, name: log.reviewerName })))];

  return (
    <div className="space-y-6 pt-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Access Review Audit Logs</h2>
          <p className="text-muted-foreground">Immutable record of all review decisions and actions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" /> Export CSV
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" /> Compliance Report
          </Button>
        </div>
      </div>

      {/* Inline Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search logs..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <Select value={decisionFilter} onValueChange={setDecisionFilter}>
          <SelectTrigger><SelectValue placeholder="Decision" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Decisions</SelectItem>
            <SelectItem value="approve">Approved</SelectItem>
            <SelectItem value="revoke">Revoked</SelectItem>
            <SelectItem value="modify">Modified</SelectItem>
          </SelectContent>
        </Select>
        <Select value={campaignFilter} onValueChange={setCampaignFilter}>
          <SelectTrigger><SelectValue placeholder="Campaign" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Campaigns</SelectItem>
            {uniqueCampaigns.map(campaign => (
              <SelectItem key={campaign.id} value={campaign.id}>{campaign.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={reviewerFilter} onValueChange={setReviewerFilter}>
          <SelectTrigger><SelectValue placeholder="Reviewer" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reviewers</SelectItem>
            {uniqueReviewers.map(reviewer => (
              <SelectItem key={reviewer.id} value={reviewer.id}>{reviewer.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Audit Log Entries */}
      <div className="space-y-4">
        {filteredLogs.map((log) => (
          <Card key={log.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start gap-3">
                  {getDecisionIcon(log.decision)}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getItemTypeIcon(log.itemType)}
                      <h3 className="font-semibold">{log.itemName}</h3>
                      <Badge variant={getDecisionBadgeVariant(log.decision)}>{log.decision.toUpperCase()}</Badge>
                      <Badge variant={getRiskBadgeVariant(log.riskLevel)}>{log.riskLevel.toUpperCase()}</Badge>
                      {log.aiSuggestionUsed && (
                        <Badge variant="outline" className="bg-primary/10 text-primary">AI Assisted</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {log.itemType.charAt(0).toUpperCase() + log.itemType.slice(1)} in {log.campaignName}
                    </p>
                  </div>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <div>{new Date(log.timestamp).toLocaleDateString()}</div>
                  <div>{new Date(log.timestamp).toLocaleTimeString()}</div>
                </div>
              </div>

              <div className="bg-muted rounded-lg p-3 mb-4">
                <h4 className="font-medium text-sm mb-1">Justification:</h4>
                <p className="text-sm">{log.justification}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Reviewer:</span>
                  <p className="font-medium">{log.reviewerName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Session ID:</span>
                  <p className="font-mono text-xs">{log.sessionId}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">IP Address:</span>
                  <p className="font-mono text-xs">{log.ipAddress}</p>
                </div>
              </div>

              <div className="flex gap-1 mt-3">
                {log.complianceFramework.map(framework => (
                  <Badge key={framework} variant="outline" className="text-xs">{framework}</Badge>
                ))}
              </div>

              {log.beforeState && log.afterState && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-medium text-sm mb-2">State Changes:</h4>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-muted-foreground">Before:</span>
                      <pre className="bg-destructive/10 p-2 rounded mt-1 overflow-x-auto">{JSON.stringify(log.beforeState, null, 2)}</pre>
                    </div>
                    <div>
                      <span className="text-muted-foreground">After:</span>
                      <pre className="bg-green-500/10 p-2 rounded mt-1 overflow-x-auto">{JSON.stringify(log.afterState, null, 2)}</pre>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Session Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-1.5">
            Session Summary
            <InfoTooltip text="Aggregated metrics for the current filtered view of audit log entries." />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {filteredLogs.filter(log => log.decision === 'approve').length}
              </div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                Approved
                <InfoTooltip text="Access entitlements confirmed as appropriate for the user's current role." />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-destructive">
                {filteredLogs.filter(log => log.decision === 'revoke').length}
              </div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                Revoked
                <InfoTooltip text="Access entitlements removed due to policy violations or lack of business justification." />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {filteredLogs.filter(log => log.decision === 'modify').length}
              </div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                Modified
                <InfoTooltip text="Access scope reduced or changed to resolve conflicts while maintaining business continuity." />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {filteredLogs.length > 0 ? Math.round((filteredLogs.filter(log => log.aiSuggestionUsed).length / filteredLogs.length) * 100) : 0}%
              </div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                AI Assisted
                <InfoTooltip text="Percentage of decisions where the reviewer accepted or used AI-generated recommendations." />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
