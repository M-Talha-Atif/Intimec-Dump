
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { RiskFilter, RiskKPIData } from '@/types/riskAnalytics';
import { useAIAssistant } from '@/contexts/AIAssistantContext';

interface AIRiskInsightsProps {
  filters: RiskFilter;
  riskData: RiskKPIData | null;
}

interface RiskRecommendation {
  id: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  impact: string;
  category: string;
  steps: string[];
}

export const AIRiskInsights: React.FC<AIRiskInsightsProps> = ({
  filters,
  riskData
}) => {
  const { setIsAssistantOpen } = useAIAssistant();
  const [recommendations, setRecommendations] = useState<RiskRecommendation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const mockRecommendations: RiskRecommendation[] = [
    {
      id: 'rec1',
      title: 'Immediate SoD Violation Remediation',
      description: 'Critical segregation of duties violations detected in Finance department requiring immediate attention.',
      priority: 'critical',
      effort: 'low',
      impact: 'Eliminate 7 critical compliance violations within 24 hours',
      category: 'Policy & Compliance',
      steps: [
        'Review John Smith\'s dual AP Manager/Approver roles',
        'Implement emergency role separation',
        'Update approval workflows to prevent future conflicts',
        'Document remediation for audit compliance'
      ]
    },
    {
      id: 'rec2',
      title: 'Optimize ServiceNow Provisioning Process',
      description: 'Recurring timeout issues in ServiceNow connector causing 67% of provisioning failures.',
      priority: 'high',
      effort: 'medium',
      impact: 'Reduce provisioning failures by 80% and improve user experience',
      category: 'Process Automation',
      steps: [
        'Increase ServiceNow connector timeout from 20s to 45s',
        'Implement retry logic for failed provisioning requests',
        'Add monitoring alerts for connector performance',
        'Schedule regular connector health checks'
      ]
    },
    {
      id: 'rec3',
      title: 'Contractor Access Review Campaign',
      description: 'Non-employee accounts show 40% higher risk profile with 8 contracts expiring soon.',
      priority: 'medium',
      effort: 'high',
      impact: 'Proactive risk reduction and compliance maintenance',
      category: 'Identity Management',
      steps: [
        'Launch immediate review for expiring contractor accounts',
        'Implement automated renewal reminders 60 days before expiration',
        'Establish sponsor accountability for contractor access',
        'Create risk-based access policies for non-employees'
      ]
    }
  ];

  useEffect(() => {
    // Simulate AI analysis based on current risk data
    if (riskData) {
      setRecommendations(mockRecommendations);
    }
  }, [riskData, filters]);

  const handleAIAnalysis = () => {
    setIsAnalyzing(true);
    setIsAssistantOpen(true);

    // Generate contextual analysis prompt
    const analysisPrompt = `Analyze current risk landscape and provide recommendations:

**Current Risk State:**
- Total Critical Risks: ${riskData?.totalCriticalRisks.value || 0}
- SoD Violations: ${riskData?.sodViolations.value || 0}
- Orphan Accounts: ${riskData?.orphanAccounts.value || 0}
- Excessive Access: ${riskData?.excessiveAccess.value || 0}

**Filters Applied:**
- Time Range: ${filters.timeRange}
- Severity: ${filters.severity.join(', ')}
- Identity Types: ${filters.identityTypes.join(', ')}

Please provide:
1. **Root Cause Analysis**: What's driving the current risk levels?
2. **Immediate Actions**: What needs to be done in the next 24-48 hours?
3. **Policy Improvements**: How can we prevent similar risks?
4. **Long-term Strategy**: What systemic changes would reduce overall risk?
5. **Similar Patterns**: Are there related risks we should monitor?`;

    // Store the analysis context
    localStorage.setItem('ai-risk-analysis-prompt', analysisPrompt);
    localStorage.setItem('ai-risk-analysis-context', JSON.stringify({ filters, riskData }));
    
    // Dispatch event to notify AI Assistant
    window.dispatchEvent(new CustomEvent('ai-risk-analysis-requested', {
      detail: { prompt: analysisPrompt, context: { filters, riskData } }
    }));

    setTimeout(() => setIsAnalyzing(false), 2000);
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      'critical': 'destructive',
      'high': 'destructive',
      'medium': 'secondary',
      'low': 'outline'
    } as const;
    
    return <Badge variant={variants[priority as keyof typeof variants] || 'outline'}>{priority}</Badge>;
  };

  const getEffortBadge = (effort: string) => {
    const colors = {
      'low': 'bg-green-100 text-green-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'high': 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[effort as keyof typeof colors]}`}>
        {effort} effort
      </span>
    );
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'high':
        return <TrendingUp className="h-5 w-5 text-orange-600" />;
      case 'medium':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return <CheckCircle className="h-5 w-5 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Analysis Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <span>AI-Powered Risk Insights</span>
            </CardTitle>
            <Button 
              onClick={handleAIAnalysis}
              disabled={isAnalyzing}
              className="flex items-center space-x-2"
            >
              <Sparkles className="h-4 w-4" />
              <span>{isAnalyzing ? 'Analyzing...' : 'Deep AI Analysis'}</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Risk Patterns Detected</h4>
              <p className="text-sm text-blue-700">
                Finance department concentration, service account sprawl, and approval bottlenecks
              </p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <h4 className="font-semibold text-orange-800 mb-2">Correlation Analysis</h4>
              <p className="text-sm text-orange-700">
                SoD violations correlate with recent role changes and system integrations
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">Predictive Risk Score</h4>
              <p className="text-sm text-green-700">
                Current trajectory suggests 15% risk increase without intervention
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>AI Risk Remediation Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {recommendations.map((rec) => (
              <div key={rec.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {getPriorityIcon(rec.priority)}
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{rec.title}</h4>
                      <p className="text-gray-600 mt-1">{rec.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getPriorityBadge(rec.priority)}
                    {getEffortBadge(rec.effort)}
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <h5 className="font-medium text-gray-800 mb-1">Expected Impact:</h5>
                  <p className="text-sm text-gray-700">{rec.impact}</p>
                </div>

                <div>
                  <h5 className="font-medium text-gray-800 mb-2">Recommended Steps:</h5>
                  <ol className="space-y-1">
                    {rec.steps.map((step, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm">
                        <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </span>
                        <span className="text-gray-700">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <Badge variant="outline">{rec.category}</Badge>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    <Button size="sm">
                      Implement
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
