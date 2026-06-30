
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Sparkles, 
  Brain,
  TrendingUp,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  Calendar,
  User
} from 'lucide-react';

type NonEmployeeAIAnalysisTabProps = {
  nonEmployee: any;
};

export function NonEmployeeAIAnalysisTab({ nonEmployee }: NonEmployeeAIAnalysisTabProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  const runAnalysis = () => {
    setIsAnalyzing(true);
    // Simulate analysis time
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisComplete(true);
    }, 3000);
  };

  // Mock AI analysis results
  const analysisResults = {
    riskScore: 74,
    insights: [
      {
        id: 'insight_1',
        title: 'Contract Expiration Risk',
        severity: 'HIGH',
        status: 'Active',
        description: 'Contract expires in 15 days but user has active high-privilege access to production systems. Immediate action required.',
        category: 'Time-bound Risk',
        firstSeen: '2024-06-01',
        relatedTabs: ['Overview', 'Risk'],
        linkedObjects: ['Contract: ENG-2024-001', 'Access: Production-DB-Admin'],
        tags: ['SOX', 'Critical Systems'],
        suggestedActions: ['Revoke production access before contract end', 'Initiate access transfer to full-time employee', 'Schedule contract extension review']
      },
      {
        id: 'insight_2',
        title: 'Dormant High-Risk Access',
        severity: 'MEDIUM',
        status: 'Active',
        description: 'User has administrative access to GitHub repositories but hasn\'t used it in 30 days. Access may be excessive.',
        category: 'Access Optimization',
        firstSeen: '2024-05-20',
        relatedTabs: ['Access', 'Activity'],
        linkedObjects: ['Account: github-admin', 'Role: Repository-Admin'],
        tags: ['DevOps', 'Unused Access'],
        suggestedActions: ['Review access necessity with sponsor', 'Downgrade to read-only access', 'Remove if not needed']
      },
      {
        id: 'insight_3',
        title: 'Sponsor Oversight Gap',
        severity: 'MEDIUM',
        status: 'Under Review',
        description: 'Sponsor hasn\'t reviewed contractor\'s access in 60 days, exceeding policy requirements.',
        category: 'Governance',
        firstSeen: '2024-06-10',
        relatedTabs: ['Overview', 'Policy'],
        linkedObjects: ['Sponsor: Jane Smith', 'Policy: NEI-Review-Policy'],
        tags: ['Governance', 'Review Overdue'],
        suggestedActions: ['Notify sponsor of overdue review', 'Escalate to sponsor\'s manager', 'Initiate automated review process']
      }
    ],
    recommendations: [
      'Prioritize contract renewal discussion with sponsor',
      'Conduct comprehensive access review before contract end',
      'Implement automated access removal for contract expiration',
      'Review and optimize current access levels'
    ]
  };

  if (!analysisComplete && !isAnalyzing) {
    return (
      <div className="space-y-6 pt-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5" />
              <span>AI-Powered Identity Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              Deep Identity Analysis Available
            </h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              Run comprehensive AI analysis on {nonEmployee.name}'s complete identity profile, including access patterns, risk factors, and compliance status.
            </p>
            <Button onClick={runAnalysis} className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4" />
              <span>Start AI Analysis</span>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What Will Be Analyzed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Contract & time boundaries</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Access patterns & usage</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Risk indicators</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Sponsor governance</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Policy compliance</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Behavioral anomalies</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isAnalyzing) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="text-center py-8">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Brain className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              Analyzing Identity Profile...
            </h3>
            <p className="text-slate-600 mb-4">
              Processing {nonEmployee.name}'s complete identity context
            </p>
            <Progress value={66} className="w-64 mx-auto" />
            <p className="text-sm text-slate-500 mt-2">This may take a few moments</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analysis Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5" />
              <span>AI Analysis Results</span>
            </div>
            <Button variant="outline" size="sm" onClick={runAnalysis}>
              <Sparkles className="h-4 w-4 mr-1" />
              Re-analyze
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">{analysisResults.riskScore}</div>
              <div className="text-sm text-slate-600 mb-4">AI Risk Score</div>
              <Progress value={analysisResults.riskScore} className="w-full" />
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Critical Issues</span>
                <Badge variant="destructive">
                  {analysisResults.insights.filter(i => i.severity === 'HIGH').length}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Medium Issues</span>
                <Badge className="bg-yellow-100 text-yellow-800">
                  {analysisResults.insights.filter(i => i.severity === 'MEDIUM').length}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Recommendations</span>
                <Badge variant="outline">
                  {analysisResults.recommendations.length}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle>AI-Generated Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analysisResults.insights.map((insight) => (
              <div key={insight.id} className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-medium text-slate-900">{insight.title}</h3>
                      <Badge className={
                        insight.severity === 'HIGH' ? 'bg-red-100 text-red-800' :
                        insight.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }>
                        {insight.severity}
                      </Badge>
                      <Badge variant="outline">{insight.status}</Badge>
                    </div>
                    
                    <p className="text-sm text-slate-600 mb-3">{insight.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-xs font-medium text-slate-600 mb-1">Category</p>
                        <p className="text-sm text-slate-900">{insight.category}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-600 mb-1">First Seen</p>
                        <p className="text-sm text-slate-900">{insight.firstSeen}</p>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-xs font-medium text-slate-600 mb-1">Related Objects</p>
                      <div className="flex flex-wrap gap-1">
                        {insight.linkedObjects.map((obj, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {obj}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-xs font-medium text-slate-600 mb-1">Tags</p>
                      <div className="flex flex-wrap gap-1">
                        {insight.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs font-medium text-slate-600 mb-2">Suggested Actions</p>
                      <ul className="text-sm text-slate-700 space-y-1">
                        {insight.suggestedActions.map((action, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="text-slate-400">•</span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <FileText className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>AI Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analysisResults.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-blue-600">{index + 1}</span>
                </div>
                <span className="text-sm text-slate-900">{recommendation}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
