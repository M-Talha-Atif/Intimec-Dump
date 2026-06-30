
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, AlertTriangle, Target, Brain, Play, RotateCcw, Loader2 } from 'lucide-react';
import { getIdentityProfile } from '@/data/mock-identity-profiles';
import { type User } from '@/data/mock-users';

const IdentityAIAnalysisTab = ({ user }: { user: User }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [lastAnalyzedAt, setLastAnalyzedAt] = useState<Date | null>(null);
  
  const profile = getIdentityProfile(user.id);

  // Check if analysis has been run before (simulate persistence)
  useEffect(() => {
    const savedAnalysisData = localStorage.getItem(`ai-analysis-${user.id}`);
    if (savedAnalysisData) {
      const data = JSON.parse(savedAnalysisData);
      setHasAnalyzed(true);
      setLastAnalyzedAt(new Date(data.timestamp));
    }
  }, [user.id]);

  const runAIAnalysis = async () => {
    setIsAnalyzing(true);
    
    try {
      // Simulate AI analysis processing time
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Aggregate data from all identity detail tabs
      const analysisData = {
        overview: {
          name: user.name,
          department: user.department,
          type: user.type,
          status: user.status,
          manager: user.manager || 'N/A'
        },
        accounts: profile?.accounts || user.accounts || [],
        access: profile?.access || user.access || [],
        riskFactors: user.riskFactors || [],
        activity: profile?.activity || user.activity || [],
        riskEvents: profile?.riskEvents || [],
        policies: profile?.policies || [],
        timestamp: new Date().toISOString()
      };

      // Save analysis data to localStorage (simulate persistence)
      localStorage.setItem(`ai-analysis-${user.id}`, JSON.stringify(analysisData));
      
      const now = new Date();
      setLastAnalyzedAt(now);
      setHasAnalyzed(true);
      
      console.log('AI Analysis completed for:', user.name, 'with comprehensive data from all tabs');
      
    } catch (error) {
      console.error('AI Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  const getButtonContent = () => {
    if (isAnalyzing) {
      return (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          <span>Analyzing...</span>
        </>
      );
    }
    
    if (hasAnalyzed) {
      return (
        <>
          <RotateCcw className="w-4 h-4 mr-2" />
          <span>Re-run Analysis</span>
        </>
      );
    }
    
    return (
      <>
        <Play className="w-4 h-4 mr-2" />
        <span>Start Analysis</span>
      </>
    );
  };

  // Show analysis trigger if no insights or first time
  if (!profile?.aiInsights || profile.aiInsights.length === 0 || !hasAnalyzed) {
    return (
      <Card className="pt-4">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Brain className="w-5 h-5 mr-2 text-brand-purple" />
              AI-Powered Identity Analysis
            </div>
            <Button 
              onClick={runAIAnalysis} 
              disabled={isAnalyzing}
              className="flex items-center"
            >
              {getButtonContent()}
            </Button>
          </CardTitle>
          <CardDescription>
            Comprehensive AI analysis of {user.name}'s identity profile, access patterns, and risk factors.
            {lastAnalyzedAt && (
              <div className="mt-2 text-sm text-slate-500">
                Last analyzed on {formatTimestamp(lastAnalyzedAt)}
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-brand-purple/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-brand-purple" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {hasAnalyzed ? 'Analysis Complete' : 'Ready for AI Analysis'}
            </h3>
            <p className="text-slate-600 mb-4 max-w-md mx-auto">
              {hasAnalyzed 
                ? `AI analysis completed on ${formatTimestamp(lastAnalyzedAt!)}. Click "Re-run Analysis" to generate fresh insights.`
                : `Generate AI-powered insights by analyzing data from all identity tabs including overview, accounts, access, risk factors, activity patterns, and policy compliance.`
              }
            </p>
            
            {!hasAnalyzed && (
              <div className="mt-4">
                <h4 className="font-medium text-slate-900 mb-3">Analysis will include:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm text-slate-600 max-w-md mx-auto">
                  <div>• Profile & Employment</div>
                  <div>• Account Relationships</div>
                  <div>• Access Entitlements</div>
                  <div>• Risk Indicators</div>
                  <div>• Activity Patterns</div>
                  <div>• Policy Compliance</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show analysis results with re-run option
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'Insight': return <TrendingUp className="w-4 h-4" />;
      case 'Recommendation': return <Target className="w-4 h-4" />;
      case 'Anomaly': return <AlertTriangle className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'Insight': return 'bg-blue-100 text-blue-800';
      case 'Recommendation': return 'bg-green-100 text-green-800';
      case 'Anomaly': return 'bg-red-100 text-red-800';
      default: return 'bg-purple-100 text-purple-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Access': return 'bg-indigo-100 text-indigo-800';
      case 'Risk': return 'bg-red-100 text-red-800';
      case 'Compliance': return 'bg-amber-100 text-amber-800';
      case 'Optimization': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-6 mt-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Brain className="w-5 h-5 mr-2 text-brand-purple" />
              AI-Powered Identity Analysis
            </div>
            <Button 
              onClick={runAIAnalysis} 
              disabled={isAnalyzing}
              variant="outline"
              className="flex items-center"
            >
              {getButtonContent()}
            </Button>
          </CardTitle>
          <CardDescription>
            Insights and recommendations generated by our AI engine based on access patterns, behavior, and risk factors.
            {lastAnalyzedAt && (
              <div className="mt-2 text-sm text-slate-500">
                Last analyzed on {formatTimestamp(lastAnalyzedAt)}
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {profile.aiInsights.map((insight) => (
              <div key={insight.id} className="p-4 border rounded-lg hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className={getInsightColor(insight.type)}>
                      {getInsightIcon(insight.type)}
                      <span className="ml-1.5">{insight.type}</span>
                    </Badge>
                    <Badge variant="secondary" className={getCategoryColor(insight.category)}>
                      {insight.category}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-500">{insight.generatedOn}</span>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-slate-600">{Math.round(insight.confidence * 100)}%</span>
                    </div>
                  </div>
                </div>
                <h4 className="font-semibold text-slate-800 mb-2">{insight.title}</h4>
                <p className="text-slate-600 text-sm leading-relaxed">{insight.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2 text-green-600" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Recommended actions based on AI analysis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {profile.aiInsights
              .filter(insight => insight.type === 'Recommendation')
              .map((recommendation) => (
                <div key={recommendation.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-green-800">{recommendation.title}</p>
                    <p className="text-sm text-green-600">{recommendation.description}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-sm px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                      Apply
                    </button>
                    <button className="text-sm px-3 py-1 border border-green-600 text-green-600 rounded-md hover:bg-green-50 transition-colors">
                      Review
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IdentityAIAnalysisTab;
