
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, AlertTriangle, Clock, PlayCircle, CheckCircle, AlertCircle, XCircle, Shield, Key, Database } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

type NonHumanAIAnalysisTabProps = {
  identity: any;
};

const NonHumanAIAnalysisTab = ({ identity }: NonHumanAIAnalysisTabProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  // Mock KPI data for non-human identities
  const kpiData = {
    riskScore: identity.riskLevel === 'High' ? 85 : identity.riskLevel === 'Medium' ? 55 : 25,
    linkedApps: identity.applications?.length || 0,
    rotationStatus: identity.rotationStatus,
    daysUnused: identity.daysUnused || 0,
    privilegeCount: identity.privileges?.length || 0
  };

  // Mock insights for non-human identities
  const nonHumanInsights = [
    {
      id: 'credential-rotation-1',
      title: 'Credential Rotation Overdue',
      description: `Service account credentials haven't been rotated in ${identity.daysUnused} days, exceeding security policy`,
      severity: identity.rotationStatus === 'Overdue' ? 'critical' : 'medium',
      category: 'Credential Management',
      recommendation: 'Initiate immediate credential rotation and establish automated rotation schedule'
    },
    {
      id: 'dormant-account-1',
      title: 'Dormant Service Account',
      description: `No authentication activity detected for ${identity.daysUnused} days`,
      severity: identity.daysUnused > 90 ? 'high' : 'medium',
      category: 'Access Hygiene',
      recommendation: 'Review business justification or decommission if no longer needed'
    },
    {
      id: 'privileged-access-1',
      title: 'High-Privilege Service Account',
      description: `Account holds ${identity.privileges?.length || 0} elevated privileges across multiple systems`,
      severity: 'high',
      category: 'Privilege Management',
      recommendation: 'Review privileges against principle of least privilege and minimize access scope'
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const runAIAnalysis = async () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisComplete(true);
    }, 2500);
  };

  return (
    <div className="space-y-6 pt-4">
      {/* AI Analysis Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-orange-600" />
          <h3 className="text-lg font-semibold">AI Service Account Analysis</h3>
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
                <span>Start Analysis</span>
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
                  <Sparkles className="h-12 w-12 text-orange-600" />
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Analyzing Service Account</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Reviewing credentials, privileges, and activity patterns for {identity.name}...
                </p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-orange-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Complete */}
      {analysisComplete && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{kpiData.riskScore}</div>
                <div className="text-sm text-gray-600">Risk Score</div>
                <Badge className={cn("text-xs mt-1", getSeverityColor(identity.riskLevel?.toLowerCase() || 'medium'))}>
                  {identity.riskLevel || 'Medium'}
                </Badge>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{kpiData.linkedApps}</div>
                <div className="text-sm text-gray-600">Applications</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-sm font-bold text-orange-600">{kpiData.rotationStatus}</div>
                <div className="text-sm text-gray-600">Rotation Status</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{kpiData.daysUnused}</div>
                <div className="text-sm text-gray-600">Days Unused</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{kpiData.privilegeCount}</div>
                <div className="text-sm text-gray-600">Privileges</div>
              </CardContent>
            </Card>
          </div>

          {/* Summary Banner */}
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-orange-600 rounded-full">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-orange-900">Service Account Analysis Complete</h4>
                    <div className="flex items-center space-x-4 mt-1">
                      <Badge className="bg-red-100 text-red-800">
                        {nonHumanInsights.filter(i => i.severity === 'critical').length} Critical
                      </Badge>
                      <Badge className="bg-orange-100 text-orange-800">
                        {nonHumanInsights.filter(i => i.severity === 'high').length} High Risk
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Insights */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Security & Compliance Insights</h4>
            {nonHumanInsights.map((insight) => (
              <Card key={insight.id} className="border-l-4" style={{
                borderLeftColor: insight.severity === 'critical' ? '#ef4444' : 
                                insight.severity === 'high' ? '#f97316' :
                                insight.severity === 'medium' ? '#eab308' : '#3b82f6'
              }}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <CardTitle className="text-base">{insight.title}</CardTitle>
                        <Badge className={cn("text-xs", getSeverityColor(insight.severity))}>
                          {insight.severity.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                      
                      {/* Category Badge */}
                      <Badge variant="outline" className="text-xs text-blue-700 border-blue-300 mb-3">
                        {insight.category}
                      </Badge>

                      {/* AI Recommendation */}
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <h5 className="font-medium text-sm mb-1 flex items-center space-x-1">
                          <CheckCircle className="h-3 w-3 text-blue-600" />
                          <span>Recommended Action</span>
                        </h5>
                        <p className="text-sm text-gray-700">{insight.recommendation}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
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
            <h4 className="font-medium text-gray-900 mb-2">AI Service Account Analysis</h4>
            <p className="text-gray-600 mb-4">
              Analyze {identity.name} for credential hygiene, privilege compliance, 
              and security risks specific to service accounts.
            </p>
            <Button onClick={runAIAnalysis} className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4" />
              <span>Start Analysis</span>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NonHumanAIAnalysisTab;
