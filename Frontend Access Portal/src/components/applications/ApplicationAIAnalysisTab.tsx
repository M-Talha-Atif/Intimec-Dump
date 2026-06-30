import React, { useState } from 'react';
import { Application } from '@/data/mock-applications';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sparkles, AlertTriangle, Shield, Users, Clock, ChevronDown, ChevronRight, Zap, Eye, Settings, PlayCircle, TrendingUp, CheckCircle, AlertCircle, XCircle, ExternalLink, History, FileText, Target } from 'lucide-react';
import { useRouter } from "next/navigation";
import { cn } from '@/lib/utils';

type AIAnalysisTabProps = {
  application: Application;
};

type RiskLevel = 'critical' | 'high' | 'medium' | 'low';

type RiskCard = {
  id: string;
  title: string;
  description: string;
  severity: RiskLevel;
  category: string;
  affectedIdentities: string[];
  affectedObjects: string[];
  lastDetected: string;
  recommendation: string;
  actionType: 'deprovisioning' | 'access-review' | 'entitlement-editor' | 'policy-review';
  // Enhanced properties
  correlationId: string;
  firstSeen: string;
  peakOccurrence: string;
  previouslyMitigated: boolean;
  rootCause: string;
  complianceLabels: string[];
  workflowAttached: boolean;
  riskReduction: string;
  estimatedImpact: string;
};

type PreviewMitigationData = {
  changes: string[];
  affectedUsers: string[];
  riskReduction: string;
  workflowType: string;
  estimatedTime: string;
};

const ApplicationAIAnalysisTab = ({ application }: AIAnalysisTabProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [selectedMitigation, setSelectedMitigation] = useState<RiskCard | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, 'accurate' | 'needs-review' | 'false-positive'>>({});
  const router = useRouter();

  // Enhanced mock analysis results
  const mockAnalysisResults: RiskCard[] = [
    {
      id: 'orphan-accounts-1',
      title: 'Critical Orphan Accounts Detected',
      description: `${application.orphanCount} accounts lack proper identity correlation and governance oversight`,
      severity: 'critical',
      category: 'Orphan Accounts',
      affectedIdentities: ['john.doe@company.com', 'service.account.1', 'temp.contractor.23'],
      affectedObjects: ['Admin Role', 'DB Access', 'Financial Systems'],
      lastDetected: '2 hours ago',
      recommendation: 'Immediately correlate orphan accounts with authoritative identity sources or disable unused accounts',
      actionType: 'access-review',
      correlationId: 'req-372839',
      firstSeen: 'Jun 14, 2024',
      peakOccurrence: 'Jul 23, 2024 (12 accounts)',
      previouslyMitigated: false,
      rootCause: 'Detected due to misalignment between identity lifecycle and provisioning data. Accounts are active but identities were deleted 21 days ago.',
      complianceLabels: ['SOX', 'GDPR'],
      workflowAttached: true,
      riskReduction: '87%',
      estimatedImpact: '3 high-privilege accounts will be disabled'
    },
    {
      id: 'excessive-admin-1',
      title: 'Excessive Administrative Rights',
      description: `${application.riskyCount} identities have elevated privileges that exceed job requirements`,
      severity: 'high',
      category: 'Privilege Escalation',
      affectedIdentities: ['admin.user.1', 'power.user.2'],
      affectedObjects: ['System Admin', 'Global Config', 'User Management'],
      lastDetected: '4 hours ago',
      recommendation: 'Review administrative role assignments and implement principle of least privilege',
      actionType: 'entitlement-editor',
      correlationId: 'req-384721',
      firstSeen: 'May 8, 2024',
      peakOccurrence: 'Jun 15, 2024 (8 users)',
      previouslyMitigated: true,
      rootCause: 'Role creep detected: Users accumulated admin rights through multiple promotion cycles without proper review.',
      complianceLabels: ['SOX'],
      workflowAttached: false,
      riskReduction: '72%',
      estimatedImpact: '2 users will have admin privileges removed'
    },
    {
      id: 'stale-entitlements-1',
      title: 'Stale Entitlements Accumulation',
      description: 'Multiple entitlements have not been used for 90+ days indicating potential over-provisioning',
      severity: 'medium',
      category: 'Access Hygiene',
      affectedIdentities: ['inactive.user.1', 'former.employee.2'],
      affectedObjects: ['Legacy System Access', 'Unused Roles'],
      lastDetected: '1 day ago',
      recommendation: 'Launch automated access review campaign to remove unused entitlements',
      actionType: 'access-review',
      correlationId: 'req-391847',
      firstSeen: 'Apr 12, 2024',
      peakOccurrence: 'Aug 3, 2024 (23 entitlements)',
      previouslyMitigated: false,
      rootCause: 'Entitlements granted during project work were not removed upon project completion. No automated cleanup policies exist.',
      complianceLabels: ['Internal Policy'],
      workflowAttached: true,
      riskReduction: '65%',
      estimatedImpact: '15 unused entitlements will be revoked'
    },
    {
      id: 'sod-violations-1',
      title: 'Segregation of Duties Violations',
      description: '2 users have conflicting roles that violate segregation of duties policies',
      severity: 'high',
      category: 'Policy Violations',
      affectedIdentities: ['finance.user.1', 'audit.user.2'],
      affectedObjects: ['Financial Approval', 'Audit Review'],
      lastDetected: '6 hours ago',
      recommendation: 'Immediately review and remediate conflicting role assignments',
      actionType: 'policy-review',
      correlationId: 'req-398472',
      firstSeen: 'Mar 22, 2024',
      peakOccurrence: 'May 11, 2024 (4 violations)',
      previouslyMitigated: true,
      rootCause: 'SoD Rule ID: SOD-FIN-001 violated. Users gained conflicting roles through department transfer without proper segregation review.',
      complianceLabels: ['SOX', 'Internal Policy'],
      workflowAttached: true,
      riskReduction: '95%',
      estimatedImpact: '2 users will have conflicting roles removed'
    }
  ];

  const runAIAnalysis = async () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisComplete(true);
    }, 3000);
  };

  const toggleCardExpansion = (cardId: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(cardId)) {
      newExpanded.delete(cardId);
    } else {
      newExpanded.add(cardId);
    }
    setExpandedCards(newExpanded);
  };

  const getSeverityColor = (severity: RiskLevel) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleTakeAction = (riskCard: RiskCard) => {
    setSelectedMitigation(riskCard);
  };

  const handleViewInMonitoring = (riskCard: RiskCard) => {
    // Create detailed query params for deep linking
    const queryParams = new URLSearchParams({
      tab: 'alerts',
      alertType: riskCard.category.toLowerCase().replace(/\s+/g, '-'),
      app: application.name,
      correlationId: riskCard.correlationId,
      severity: riskCard.severity,
      timestamp: encodeURIComponent(riskCard.lastDetected),
      riskId: riskCard.id,
      focus: 'true'
    });
    
    router.push(`/monitoring?${queryParams.toString()}`);
  };

  const handleDeepLink = (linkType: string, riskCard: RiskCard) => {
    switch (linkType) {
      case 'accounts':
        router.push(`/identities?filter=${riskCard.affectedIdentities[0]}`);
        break;
      case 'entitlements':
        router.push(`/entitlements?filter=${riskCard.affectedObjects[0]}`);
        break;
      case 'access-review':
        router.push('/access-review');
        break;
      case 'audit-logs':
        router.push(`/audit-logs?correlation=${riskCard.correlationId}`);
        break;
    }
  };

  const handleFeedback = (riskId: string, feedback: 'accurate' | 'needs-review' | 'false-positive') => {
    setFeedbackGiven(prev => ({ ...prev, [riskId]: feedback }));
  };

  const getMitigationPreview = (riskCard: RiskCard): PreviewMitigationData => {
    return {
      changes: [
        `Disable ${riskCard.affectedIdentities.length} orphan accounts`,
        `Remove ${riskCard.affectedObjects.length} unused entitlements`,
        'Update governance policies'
      ],
      affectedUsers: riskCard.affectedIdentities,
      riskReduction: riskCard.riskReduction,
      workflowType: riskCard.workflowAttached ? 'Automated Workflow' : 'Manual Review',
      estimatedTime: '2-4 hours'
    };
  };

  const criticalCount = mockAnalysisResults.filter(r => r.severity === 'critical').length;
  const highCount = mockAnalysisResults.filter(r => r.severity === 'high').length;
  const mediumCount = mockAnalysisResults.filter(r => r.severity === 'medium').length;

  return (
    <div className="space-y-6">
      {/* AI Analysis Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">AI Security Analysis</h3>
        </div>
        {!analysisComplete && (
          <Button 
            onClick={runAIAnalysis} 
            disabled={isAnalyzing}
            className="flex items-center space-x-2"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <PlayCircle className="h-4 w-4" />
                <span>Run AI Analysis</span>
              </>
            )}
          </Button>
        )}
      </div>

      {/* Loading State */}
      {isAnalyzing && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center space-y-4">
              <div className="relative">
                <div className="animate-pulse flex items-center justify-center">
                  <Sparkles className="h-12 w-12 text-blue-600" />
                </div>
                <div className="absolute inset-0 animate-ping">
                  <Sparkles className="h-12 w-12 text-blue-600 opacity-20" />
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">AI Analysis in Progress</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Scanning accounts, entitlements, and access patterns...
                </p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '65%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Complete - Summary Banner */}
      {analysisComplete && (
        <>
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900">AI Scan Complete</h4>
                    <div className="flex items-center space-x-4 mt-1">
                      <Badge className="bg-red-100 text-red-800">
                        {criticalCount} Critical Risks
                      </Badge>
                      <Badge className="bg-orange-100 text-orange-800">
                        {highCount} High Risks
                      </Badge>
                      <Badge className="bg-yellow-100 text-yellow-800">
                        {mediumCount} Warnings
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-blue-700">
                  Last scan: {new Date().toLocaleTimeString()}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Risk Cards */}
          <div className="space-y-4">
            {mockAnalysisResults.map((riskCard) => (
              <Card key={riskCard.id} className="border-l-4" style={{
                borderLeftColor: riskCard.severity === 'critical' ? '#ef4444' : 
                                riskCard.severity === 'high' ? '#f97316' :
                                riskCard.severity === 'medium' ? '#eab308' : '#3b82f6'
              }}>
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <CardTitle className="text-base">{riskCard.title}</CardTitle>
                            <Badge className={cn("text-xs", getSeverityColor(riskCard.severity))}>
                              {riskCard.severity.toUpperCase()}
                            </Badge>
                            {riskCard.previouslyMitigated && (
                              <Badge variant="outline" className="text-xs text-green-700 border-green-300">
                                Previously Mitigated
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{riskCard.description}</p>
                          
                          {/* Risk Evolution Timeline */}
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                            <span className="flex items-center space-x-1">
                              <History className="h-3 w-3" />
                              <span>First Seen: {riskCard.firstSeen}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <TrendingUp className="h-3 w-3" />
                              <span>Peak: {riskCard.peakOccurrence}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>Detected {riskCard.lastDetected}</span>
                            </span>
                          </div>

                          {/* Compliance Labels */}
                          <div className="flex items-center space-x-2 mb-2">
                            {riskCard.complianceLabels.map((label, index) => (
                              <Badge key={index} variant="outline" className="text-xs text-purple-700 border-purple-300">
                                {label}
                              </Badge>
                            ))}
                            {riskCard.workflowAttached && (
                              <Badge variant="outline" className="text-xs text-blue-700 border-blue-300">
                                Workflow Attached
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span className="flex items-center space-x-1">
                              <Users className="h-3 w-3" />
                              <span>{riskCard.affectedIdentities.length} identities</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Shield className="h-3 w-3" />
                              <span>ID: {riskCard.correlationId}</span>
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleCardExpansion(riskCard.id)}
                        >
                          {expandedCards.has(riskCard.id) ? 
                            <ChevronDown className="h-4 w-4" /> : 
                            <ChevronRight className="h-4 w-4" />
                          }
                        </Button>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        {/* Root Cause Analysis */}
                        <div className="bg-orange-50 p-3 rounded-lg">
                          <h5 className="font-medium text-sm mb-1 flex items-center space-x-1">
                            <AlertTriangle className="h-3 w-3 text-orange-600" />
                            <span>Why This Risk Exists</span>
                          </h5>
                          <p className="text-sm text-gray-700">{riskCard.rootCause}</p>
                        </div>

                        {/* Affected Identities */}
                        <div>
                          <h5 className="font-medium text-sm mb-2">Affected Identities</h5>
                          <div className="flex flex-wrap gap-2">
                            {riskCard.affectedIdentities.map((identity, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {identity}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Affected Objects */}
                        <div>
                          <h5 className="font-medium text-sm mb-2">Affected Objects</h5>
                          <div className="flex flex-wrap gap-2">
                            {riskCard.affectedObjects.map((object, index) => (
                              <Badge key={index} variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                {object}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* AI Recommendation */}
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <h5 className="font-medium text-sm mb-1 flex items-center space-x-1">
                            <Zap className="h-3 w-3 text-blue-600" />
                            <span>AI Recommendation</span>
                          </h5>
                          <p className="text-sm text-gray-700 mb-2">{riskCard.recommendation}</p>
                          <div className="text-xs text-blue-600">
                            Estimated Risk Reduction: {riskCard.riskReduction}
                          </div>
                        </div>

                        {/* Cross-navigation Links */}
                        <div className="grid grid-cols-2 gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeepLink('accounts', riskCard)}
                            className="flex items-center space-x-1 text-xs"
                          >
                            <Users className="h-3 w-3" />
                            <span>View Accounts</span>
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeepLink('entitlements', riskCard)}
                            className="flex items-center space-x-1 text-xs"
                          >
                            <Shield className="h-3 w-3" />
                            <span>View Entitlements</span>
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeepLink('access-review', riskCard)}
                            className="flex items-center space-x-1 text-xs"
                          >
                            <Eye className="h-3 w-3" />
                            <span>Access Review</span>
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeepLink('audit-logs', riskCard)}
                            className="flex items-center space-x-1 text-xs"
                          >
                            <FileText className="h-3 w-3" />
                            <span>Audit Logs</span>
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-2 pt-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm" 
                                onClick={() => handleTakeAction(riskCard)}
                                className="flex items-center space-x-1"
                              >
                                <Settings className="h-3 w-3" />
                                <span>Take Action</span>
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Preview Mitigation - {riskCard.title}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="bg-blue-50 p-4 rounded-lg">
                                  <h4 className="font-medium mb-2">Changes to be Applied</h4>
                                  <ul className="text-sm space-y-1">
                                    {getMitigationPreview(riskCard).changes.map((change, index) => (
                                      <li key={index} className="flex items-center space-x-2">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        <span>{change}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h5 className="font-medium text-sm mb-1">Affected Users</h5>
                                    <p className="text-sm text-gray-600">{riskCard.affectedIdentities.length} users</p>
                                  </div>
                                  <div>
                                    <h5 className="font-medium text-sm mb-1">Risk Reduction</h5>
                                    <p className="text-sm text-green-600 font-medium">{riskCard.riskReduction}</p>
                                  </div>
                                  <div>
                                    <h5 className="font-medium text-sm mb-1">Workflow Type</h5>
                                    <p className="text-sm text-gray-600">{getMitigationPreview(riskCard).workflowType}</p>
                                  </div>
                                  <div>
                                    <h5 className="font-medium text-sm mb-1">Estimated Time</h5>
                                    <p className="text-sm text-gray-600">{getMitigationPreview(riskCard).estimatedTime}</p>
                                  </div>
                                </div>
                                <div className="flex space-x-2">
                                  <Button className="flex-1">Execute Now</Button>
                                  <Button variant="outline" className="flex-1">Schedule for Later</Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewInMonitoring(riskCard)}
                            className="flex items-center space-x-1"
                          >
                            <Eye className="h-3 w-3" />
                            <span>View in Monitoring</span>
                          </Button>
                        </div>

                        {/* AI Accuracy Feedback */}
                        <div className="border-t pt-3">
                          <h5 className="font-medium text-sm mb-2">AI Accuracy Feedback</h5>
                          <div className="flex space-x-2">
                            <Button
                              variant={feedbackGiven[riskCard.id] === 'accurate' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handleFeedback(riskCard.id, 'accurate')}
                              className="flex items-center space-x-1"
                            >
                              <CheckCircle className="h-3 w-3" />
                              <span>Accurate</span>
                            </Button>
                            <Button
                              variant={feedbackGiven[riskCard.id] === 'needs-review' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handleFeedback(riskCard.id, 'needs-review')}
                              className="flex items-center space-x-1"
                            >
                              <AlertCircle className="h-3 w-3" />
                              <span>Needs Review</span>
                            </Button>
                            <Button
                              variant={feedbackGiven[riskCard.id] === 'false-positive' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handleFeedback(riskCard.id, 'false-positive')}
                              className="flex items-center space-x-1"
                            >
                              <XCircle className="h-3 w-3" />
                              <span>False Positive</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Empty State */}
      {!isAnalyzing && !analysisComplete && (
        <Card>
          <CardContent className="py-12 text-center">
            <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="font-medium text-gray-900 mb-2">AI Security Analysis</h4>
            <p className="text-gray-600 mb-4">
              Run an AI-powered analysis to identify security risks, orphan accounts, 
              excessive privileges, and policy violations for {application.name}.
            </p>
            <Button onClick={runAIAnalysis} className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4" />
              <span>Start AI Analysis</span>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ApplicationAIAnalysisTab;
