import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  CheckCircle, XCircle, AlertTriangle, Clock, Eye, Users, 
  Shield, Building, Search, Filter, ChevronDown, ChevronRight,
  Bot, Info, Calendar, Activity, Globe
} from "lucide-react";
import { useState } from "react";

interface ReviewItem {
  id: string;
  type: 'user' | 'role' | 'entitlement' | 'application';
  name: string;
  description: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  lastUsed: string | null;
  usageCount: number;
  aiSuggestion: {
    action: 'keep' | 'revoke' | 'review';
    confidence: number;
    reason: string;
  };
  complianceTags: string[];
  entitlements?: {
    id: string;
    name: string;
    application: string;
    riskLevel: string;
    lastUsed: string | null;
    aiExplanation: string;
  }[];
  sodViolations?: string[];
  piiAccess: boolean;
  owner: string;
  businessJustification?: string;
}

const mockReviewItems: ReviewItem[] = [
  {
    id: "review-001",
    type: "user",
    name: "John Smith",
    description: "Senior Financial Analyst - Finance Department",
    riskScore: 85,
    riskLevel: "high",
    lastUsed: "2024-11-15T10:30:00Z",
    usageCount: 247,
    aiSuggestion: {
      action: "review",
      confidence: 78,
      reason: "User has excessive privileges compared to similar roles. Last privileged access unused for 45 days."
    },
    complianceTags: ["SOX", "GDPR"],
    entitlements: [
      {
        id: "ent-001",
        name: "SAP Finance Admin",
        application: "SAP ERP",
        riskLevel: "high",
        lastUsed: "2024-10-01T14:20:00Z",
        aiExplanation: "Unused for 45 days. Similar users in Finance don't have admin access."
      },
      {
        id: "ent-002",
        name: "Oracle GL Write",
        application: "Oracle Financials",
        riskLevel: "medium",
        lastUsed: "2024-11-14T09:15:00Z",
        aiExplanation: "Actively used. Required for month-end closing activities."
      }
    ],
    sodViolations: ["Can both create and approve journal entries"],
    piiAccess: true,
    owner: "Finance Manager",
    businessJustification: "Required for quarterly financial reporting and SOX compliance testing"
  },
  {
    id: "review-002",
    type: "role",
    name: "Database Administrator",
    description: "Production database administrative access",
    riskScore: 95,
    riskLevel: "critical",
    lastUsed: "2024-11-16T08:45:00Z",
    usageCount: 12,
    aiSuggestion: {
      action: "keep",
      confidence: 92,
      reason: "Critical infrastructure role with appropriate usage patterns and emergency access protocols."
    },
    complianceTags: ["ISO27001", "SOX"],
    entitlements: [
      {
        id: "ent-003",
        name: "Production DB Admin",
        application: "PostgreSQL Cluster",
        riskLevel: "critical",
        lastUsed: "2024-11-16T08:45:00Z",
        aiExplanation: "Used for emergency maintenance. Access patterns match job responsibilities."
      }
    ],
    piiAccess: true,
    owner: "IT Security Manager"
  }
];

interface ReviewInterfaceProps {
  campaignId: string | null;
}

export const ReviewInterface = ({ campaignId }: ReviewInterfaceProps) => {
  const [selectedView, setSelectedView] = useState<'user' | 'access'>('user');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [filterRisk, setFilterRisk] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [reviewDecisions, setReviewDecisions] = useState<Record<string, {
    decision: 'approve' | 'revoke' | 'modify';
    justification: string;
    aiAccepted: boolean;
  }>>({});
  const [accessItemDecisions, setAccessItemDecisions] = useState<Record<string, 'approve' | 'revoke'>>({});

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const handleDecision = (itemId: string, decision: 'approve' | 'revoke' | 'modify', justification: string = '', aiAccepted: boolean = false) => {
    setReviewDecisions(prev => ({
      ...prev,
      [itemId]: { decision, justification, aiAccepted }
    }));
  };

  const handleAccessItemDecision = (itemId: string, decision: 'approve' | 'revoke') => {
    setAccessItemDecisions(prev => ({
      ...prev,
      [itemId]: decision
    }));
  };

  const acceptAISuggestion = (item: ReviewItem) => {
    const action = item.aiSuggestion.action === 'keep' ? 'approve' : 
                  item.aiSuggestion.action === 'revoke' ? 'revoke' : 'modify';
    handleDecision(item.id, action, `AI Suggestion: ${item.aiSuggestion.reason}`, true);
  };

  const getRiskBadgeVariant = (risk: string) => {
    switch (risk) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'default';
      default: return 'outline';
    }
  };

  const filteredItems = mockReviewItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = filterRisk === 'all' || item.riskLevel === filterRisk;
    return matchesSearch && matchesRisk;
  });

  if (!campaignId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground">No Campaign Selected</h3>
          <p className="text-sm text-muted-foreground">Select a campaign from the Campaigns tab to start reviewing</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header Controls */}
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold">Access Review Interface</h2>
            <p className="text-muted-foreground">Campaign: Q4 2024 User Access Certification</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              <Activity className="h-3 w-3 mr-1" />
              247 Items Remaining
            </Badge>
            <Badge variant="outline" className="bg-green-50 text-green-700">
              85% Complete
            </Badge>
          </div>
        </div>

        {/* View Toggle and Filters */}
        <div className="flex justify-between items-center">
          <Tabs value={selectedView} onValueChange={(v) => setSelectedView(v as 'user' | 'access')}>
            <TabsList>
              <TabsTrigger value="user" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                User View
              </TabsTrigger>
              <TabsTrigger value="access" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Access View
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Select value={filterRisk} onValueChange={setFilterRisk}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Review Items */}
        <div className="space-y-4">
          {filteredItems.map((item) => {
            const isExpanded = expandedItems.has(item.id);
            const decision = reviewDecisions[item.id];

            return (
              <Card key={item.id} className={`transition-all ${decision?.decision === 'revoke' ? 'border-red-200 bg-red-50' : decision ? 'border-green-200 bg-green-50' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(item.id)}
                        className="p-1 h-8 w-8"
                      >
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </Button>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{item.name}</CardTitle>
                          <Badge variant={getRiskBadgeVariant(item.riskLevel)}>
                            Risk: {item.riskScore}
                          </Badge>
                          {item.piiAccess && (
                            <Badge variant="outline" className="bg-purple-50 text-purple-700">
                              PII Access
                            </Badge>
                          )}
                        </div>
                        <CardDescription>{item.description}</CardDescription>
                        <div className="flex gap-1">
                          {item.complianceTags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {decision ? (
                        <Badge variant={decision.decision === 'revoke' ? 'destructive' : 'default'} className={decision.decision === 'revoke' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}>
                          {decision.decision.toUpperCase()}
                          {decision.aiAccepted && ' (AI)'}
                        </Badge>
                      ) : (
                        <>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => acceptAISuggestion(item)}
                                className="flex items-center gap-1 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                              >
                                <Bot className="h-4 w-4" />
                                Accept AI ({item.aiSuggestion.confidence}%)
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">{item.aiSuggestion.reason}</p>
                            </TooltipContent>
                          </Tooltip>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDecision(item.id, 'approve')}
                            className="text-green-600 hover:bg-green-50"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDecision(item.id, 'revoke')}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4" />
                            Revoke
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      {/* AI Insights */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                          <Bot className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div className="space-y-2">
                            <h4 className="font-semibold text-blue-900">AI Analysis</h4>
                            <p className="text-sm text-blue-800">{item.aiSuggestion.reason}</p>
                            <div className="flex items-center gap-2 text-xs text-blue-700">
                              <span>Confidence: {item.aiSuggestion.confidence}%</span>
                              <span>•</span>
                              <span>Suggestion: {item.aiSuggestion.action.toUpperCase()}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Entitlements Details */}
                      {item.entitlements && (
                        <div className="space-y-2">
                          <h4 className="font-semibold flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Access Details
                          </h4>
                          <div className="space-y-2">
                            {item.entitlements.map((ent) => {
                              const entDecision = accessItemDecisions[ent.id];
                              return (
                                <div 
                                  key={ent.id} 
                                  className={`flex justify-between items-center p-3 rounded-lg transition-colors ${
                                    entDecision === 'revoke' ? 'bg-red-50 border border-red-200' : 'bg-slate-50'
                                  }`}
                                >
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">{ent.name}</span>
                                      <Badge variant={getRiskBadgeVariant(ent.riskLevel)} className="text-xs">
                                        {ent.riskLevel}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{ent.application}</p>
                                    <p className="text-xs text-blue-700 mt-1">{ent.aiExplanation}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="text-right text-sm text-muted-foreground mr-3">
                                      {ent.lastUsed ? (
                                        <>
                                          <div>Last used:</div>
                                          <div>{new Date(ent.lastUsed).toLocaleDateString()}</div>
                                        </>
                                      ) : (
                                        <Badge variant="outline" className="text-red-600">Never used</Badge>
                                      )}
                                    </div>
                                    <div className="flex gap-1">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleAccessItemDecision(ent.id, 'approve')}
                                        className={`text-green-600 hover:bg-green-50 ${
                                          entDecision === 'approve' ? 'bg-green-100 border-green-300' : ''
                                        }`}
                                      >
                                        Approve
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleAccessItemDecision(ent.id, 'revoke')}
                                        className={`hover:bg-red-50 ${
                                          entDecision === 'revoke' 
                                            ? 'bg-red-100 border-red-300 text-red-700' 
                                            : 'text-red-600'
                                        }`}
                                      >
                                        Revoke
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* SoD Violations */}
                      {item.sodViolations && item.sodViolations.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                            <div>
                              <h4 className="font-semibold text-red-900">Segregation of Duties Violations</h4>
                              <ul className="text-sm text-red-800 mt-1">
                                {item.sodViolations.map((violation, idx) => (
                                  <li key={idx}>• {violation}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Business Justification (if exists) */}
                      {item.businessJustification && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <div className="flex items-start gap-2">
                            <Info className="h-5 w-5 text-yellow-600 mt-0.5" />
                            <div>
                              <h4 className="font-semibold text-yellow-900">Business Justification</h4>
                              <p className="text-sm text-yellow-800 mt-1">{item.businessJustification}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Decision Form (if not decided yet) */}
                      {!decision && (
                        <div className="border-t pt-4">
                          <h4 className="font-semibold mb-2">Review Decision</h4>
                          <div className="space-y-3">
                            <Textarea
                              placeholder="Add justification for your decision (required for high-risk items)..."
                              className="min-h-20"
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleDecision(item.id, 'approve', 'Approved after review')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve Access
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDecision(item.id, 'revoke', 'Revoked due to risk')}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Revoke Access
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDecision(item.id, 'modify', 'Requires modification')}
                              >
                                Modify Access
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
};
