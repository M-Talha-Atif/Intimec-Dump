
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  ChevronDown, 
  ChevronUp, 
  Play, 
  Download, 
  AlertTriangle, 
  Shield, 
  Users, 
  TrendingUp,
  TrendingDown,
  Minus,
  FileWarning,
  Database,
  Loader2
} from 'lucide-react';
import { runAdvancedDryRun, DryRunResponse, ApplicationDryRunResult } from '@/lib/api/dry-run-api';
import { getSeverityBadgeClass } from '@/utils/getBadgeClass';
import { cn } from '@/lib/utils';

// Utility functions moved outside to be accessible by both components
const getLocalSeverityColor = (severity: string) => getSeverityBadgeClass(severity);

const getChangeIcon = (changeType: string) => {
  switch (changeType) {
    case 'increase': return <TrendingUp className="h-4 w-4 text-green-600" />;
    case 'decrease': return <TrendingDown className="h-4 w-4 text-red-600" />;
    default: return <Minus className="h-4 w-4 text-gray-400" />;
  }
};

interface AdvancedDryRunProps {
  selectedApps: string[];
}

export function AdvancedDryRun({ selectedApps }: AdvancedDryRunProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<DryRunResponse | null>(null);

  const handleRunDryRun = async () => {
    setIsRunning(true);
    setProgress(0);
    setResults(null);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    try {
      const dryRunResults = await runAdvancedDryRun(selectedApps);
      setResults(dryRunResults);
      setProgress(100);
    } catch (error) {
      console.error('Dry run failed:', error);
    } finally {
      setIsRunning(false);
      clearInterval(progressInterval);
    }
  };

  const handleExportReport = () => {
    // Mock export functionality
    const reportData = {
      timestamp: new Date().toISOString(),
      results,
      exportType: 'Advanced Dry-Run Report'
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dry-run-report-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="mt-4">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-purple-600" />
                <span>Advanced Dry-Run Analysis</span>
                <Badge variant="outline" className="bg-purple-50 text-purple-700">
                  Enterprise
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                {!isExpanded && selectedApps.length > 0 && (
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsExpanded(true);
                      handleRunDryRun();
                    }}
                    disabled={isRunning}
                    size="sm"
                    className="mr-2"
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Quick Run
                  </Button>
                )}
                {isExpanded ? <ChevronUp /> : <ChevronDown />}
              </div>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Controls */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium mb-1">Enterprise Impact Analysis</h4>
                <p className="text-sm text-gray-600">
                  Deep analysis of schema diffs, conflicts, and compliance risks
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {results && (
                  <Button 
                    onClick={handleExportReport}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-1"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export Report</span>
                  </Button>
                )}
                <Button 
                  onClick={handleRunDryRun}
                  disabled={isRunning || selectedApps.length === 0}
                  className="flex items-center space-x-1"
                >
                  {isRunning ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  <span>{isRunning ? 'Analyzing...' : 'Run Advanced Analysis'}</span>
                </Button>
              </div>
            </div>

            {/* Progress */}
            {isRunning && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Running comprehensive analysis...</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}

            {/* Results */}
            {results && (
              <div className="space-y-6">
                {/* Global Risk Summary */}
                <Card className="border-orange-200 bg-orange-50">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-orange-800">
                      <Shield className="h-5 w-5" />
                      <span>Global Risk & Impact Summary</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {results.globalRiskSummary.sodConflicts.estimated}
                        </div>
                        <div className="text-sm text-gray-600">SoD Conflicts</div>
                        <div className="text-xs text-red-600">
                          {results.globalRiskSummary.sodConflicts.critical} critical
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {results.globalRiskSummary.orphanAccounts.detected}
                        </div>
                        <div className="text-sm text-gray-600">Orphan Accounts</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">
                          {results.globalRiskSummary.highRiskEntitlements.flagged}
                        </div>
                        <div className="text-sm text-gray-600">High-Risk Entitlements</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {results.globalRiskSummary.complianceImpact.score}%
                        </div>
                        <div className="text-sm text-gray-600">Compliance Score</div>
                      </div>
                    </div>

                    {results.recommendations.length > 0 && (
                      <Alert className="mt-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="font-medium mb-2">Key Recommendations:</div>
                          <ul className="list-disc list-inside space-y-1">
                            {results.recommendations.map((rec, index) => (
                              <li key={index} className="text-sm">{rec}</li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>

                {/* Per-Application Analysis */}
                {results.applications.map((app) => (
                  <ApplicationAnalysis key={app.applicationId} application={app} />
                ))}
              </div>
            )}

            {!results && !isRunning && selectedApps.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Database className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Select applications to run advanced dry-run analysis</p>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

interface ApplicationAnalysisProps {
  application: ApplicationDryRunResult;
}

function ApplicationAnalysis({ application }: ApplicationAnalysisProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span>{application.applicationName}</span>
                <Badge variant="outline">
                  {application.confidence}% confidence
                </Badge>
              </div>
              {isExpanded ? <ChevronUp /> : <ChevronDown />}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-4">
            {/* Object Counts */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium mb-2">Account Changes</h5>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>New:</span>
                    <span className="text-green-600 font-medium">+{application.accounts.new}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Updates:</span>
                    <span className="text-blue-600 font-medium">{application.accounts.update}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Disable:</span>
                    <span className="text-orange-600 font-medium">{application.accounts.disable}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delete:</span>
                    <span className="text-red-600 font-medium">{application.accounts.delete}</span>
                  </div>
                </div>
              </div>
              <div>
                <h5 className="font-medium mb-2">Entitlement Changes</h5>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>New:</span>
                    <span className="text-green-600 font-medium">+{application.entitlements.new}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Updates:</span>
                    <span className="text-blue-600 font-medium">{application.entitlements.update}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Disable:</span>
                    <span className="text-orange-600 font-medium">{application.entitlements.disable}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delete:</span>
                    <span className="text-red-600 font-medium">{application.entitlements.delete}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Before vs After Comparison */}
            <div>
              <h5 className="font-medium mb-3">Before vs After Comparison</h5>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    <TableHead className="text-right">Before</TableHead>
                    <TableHead className="text-right">After</TableHead>
                    <TableHead className="text-right">Change</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {application.comparison.map((comp, index) => (
                    <TableRow key={index}>
                      <TableCell>{comp.metric}</TableCell>
                      <TableCell className="text-right font-mono">{comp.before.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono">{comp.after.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-1">
                          {getChangeIcon(comp.changeType)}
                          <span className={`font-mono ${
                            comp.changeType === 'increase' ? 'text-green-600' :
                            comp.changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {comp.change > 0 ? '+' : ''}{comp.change}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Schema Diffs */}
            {application.schemaDiffs.length > 0 && (
              <div>
                <h5 className="font-medium mb-3 flex items-center space-x-2">
                  <FileWarning className="h-4 w-4" />
                  <span>Schema Differences</span>
                </h5>
                <div className="space-y-2">
                  {application.schemaDiffs.map((diff, index) => (
                    <div key={index} className={`p-3 rounded border text-sm ${
                      diff.status === 'missing' ? 'bg-red-50 border-red-200' :
                      diff.status === 'extra' ? 'bg-yellow-50 border-yellow-200' :
                      'bg-orange-50 border-orange-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{diff.attribute}</span>
                        <Badge variant="outline" className={
                          diff.status === 'missing' ? 'text-red-700 bg-red-100' :
                          diff.status === 'extra' ? 'text-yellow-700 bg-yellow-100' :
                          'text-orange-700 bg-orange-100'
                        }>
                          {diff.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mt-1">{diff.description}</p>
                      {diff.currentType && diff.expectedType && (
                        <p className="text-xs mt-1">
                          <span className="font-medium">Expected:</span> {diff.expectedType} | 
                          <span className="font-medium"> Found:</span> {diff.currentType}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Conflicts */}
            {application.conflicts.length > 0 && (
              <div>
                <h5 className="font-medium mb-3 flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Conflicting Records</span>
                </h5>
                <div className="space-y-2">
                  {application.conflicts.map((conflict) => (
                    <div key={conflict.id} className={`p-3 rounded border ${getLocalSeverityColor(conflict.severity)}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{conflict.id}</span>
                        <Badge variant="outline" className="capitalize">
                          {conflict.severity}
                        </Badge>
                      </div>
                      <p className="text-sm mb-2">{conflict.description}</p>
                      <div className="text-xs">
                        <div><span className="font-medium">Affected:</span> {conflict.affectedFields.join(', ')}</div>
                        <div><span className="font-medium">Recommendation:</span> {conflict.recommendation}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
