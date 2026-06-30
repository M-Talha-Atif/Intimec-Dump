import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Play, 
  Eye, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  ExternalLink,
  Loader2,
  TrendingUp,
  Users,
  Shield
} from 'lucide-react';
import { GlobalImportState } from '../GlobalImportModal';
import { mockApplications } from '@/data/mock-applications';
import { AdvancedDryRun } from '../AdvancedDryRun';

interface PreviewTabProps {
  state: GlobalImportState;
  updateState: (updates: Partial<GlobalImportState>) => void;
}

interface PreviewResult {
  applicationId: string;
  applicationName: string;
  object: 'accounts' | 'entitlements';
  estimatedAdds: number;
  estimatedUpdates: number;
  estimatedDisables: number;
  predictedErrors: number;
  estimatedDuration: string;
  status: 'pending' | 'analyzing' | 'completed' | 'error';
}

interface Conflict {
  type: 'sod' | 'schema' | 'correlation' | 'throttling';
  severity: 'low' | 'medium' | 'high' | 'critical';
  applicationId: string;
  applicationName: string;
  description: string;
  recommendation: string;
}

export function PreviewTab({ state, updateState }: PreviewTabProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [previewResults, setPreviewResults] = useState<PreviewResult[]>([]);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);

  const handleDryRunToggle = (checked: boolean) => {
    updateState({
      preview: {
        ...state.preview,
        isDryRun: checked
      }
    });
  };

  const runPreviewAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setPreviewResults([]);
    setConflicts([]);

    try {
      // Generate preview results for each selected app and object
      const results: PreviewResult[] = [];
      const newConflicts: Conflict[] = [];

      for (const appId of state.selectedApps) {
        const app = mockApplications.find(a => a.id.toString() === appId);
        const config = state.importConfig[appId];
        
        if (!app || !config) continue;

        // Simulate analysis progress
        setAnalysisProgress(prev => Math.min(prev + 20, 90));
        await new Promise(resolve => setTimeout(resolve, 500));

        if (config.accounts) {
          results.push({
            applicationId: appId,
            applicationName: app.name,
            object: 'accounts',
            estimatedAdds: Math.floor(Math.random() * 50) + 10,
            estimatedUpdates: Math.floor(Math.random() * 200) + 50,
            estimatedDisables: Math.floor(Math.random() * 20),
            predictedErrors: Math.floor(Math.random() * 5),
            estimatedDuration: `${Math.floor(Math.random() * 10) + 5}min`,
            status: 'completed'
          });
        }

        if (config.entitlements) {
          results.push({
            applicationId: appId,
            applicationName: app.name,
            object: 'entitlements',
            estimatedAdds: Math.floor(Math.random() * 30) + 5,
            estimatedUpdates: Math.floor(Math.random() * 100) + 20,
            estimatedDisables: Math.floor(Math.random() * 10),
            predictedErrors: Math.floor(Math.random() * 3),
            estimatedDuration: `${Math.floor(Math.random() * 8) + 3}min`,
            status: 'completed'
          });
        }

        // Generate some conflicts
        if (Math.random() > 0.7) {
          newConflicts.push({
            type: 'schema',
            severity: 'medium',
            applicationId: appId,
            applicationName: app.name,
            description: 'Missing email attribute mapping detected',
            recommendation: 'Review attribute mapping in connector configuration'
          });
        }

        if (app.risky && Math.random() > 0.8) {
          newConflicts.push({
            type: 'sod',
            severity: 'high',
            applicationId: appId,
            applicationName: app.name,
            description: 'Potential SoD violations detected in role assignments',
            recommendation: 'Review high-risk entitlements before import'
          });
        }
      }

      setAnalysisProgress(100);
      setPreviewResults(results);
      setConflicts(newConflicts);

      updateState({
        preview: {
          ...state.preview,
          results,
          conflicts: newConflicts,
          isLoading: false
        }
      });
    } catch (error) {
      console.error('Preview analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getConflictIcon = (type: string) => {
    switch (type) {
      case 'sod': return <Shield className="h-4 w-4" />;
      case 'schema': return <AlertTriangle className="h-4 w-4" />;
      case 'correlation': return <Users className="h-4 w-4" />;
      case 'throttling': return <Clock className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const totalEstimatedChanges = previewResults.reduce((sum, result) => 
    sum + result.estimatedAdds + result.estimatedUpdates + result.estimatedDisables, 0
  );

  const totalPredictedErrors = previewResults.reduce((sum, result) => sum + result.predictedErrors, 0);

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Dry Run Toggle and Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="dry-run"
              checked={state.preview.isDryRun}
              onCheckedChange={handleDryRunToggle}
            />
            <Label htmlFor="dry-run" className="text-sm font-medium">
              Dry Run Mode
            </Label>
          </div>
          <p className="text-sm text-gray-600">
            {state.preview.isDryRun ? 'Analyze and estimate changes without writing data' : 'Execute actual import with data changes'}
          </p>
        </div>
        
        <Button 
          onClick={runPreviewAnalysis} 
          disabled={isAnalyzing || state.selectedApps.length === 0}
          className="flex items-center space-x-2"
        >
          {isAnalyzing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          <span>{isAnalyzing ? 'Analyzing...' : 'Run Preview Analysis'}</span>
        </Button>
      </div>

      {/* Analysis Progress */}
      {isAnalyzing && (
        <div className="bg-muted/50 p-4 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium">Running Impact Analysis</span>
            <span className="text-sm text-muted-foreground">{Math.round(analysisProgress)}%</span>
          </div>
          <Progress value={analysisProgress} className="w-full" />
          <p className="text-sm text-muted-foreground">
            Analyzing data sources, estimating changes, and identifying potential conflicts...
          </p>
        </div>
      )}

      {/* Results Summary */}
      {previewResults.length > 0 && !isAnalyzing && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-800">Total Changes</span>
            </div>
            <p className="text-2xl font-bold text-blue-900 mt-1">{totalEstimatedChanges.toLocaleString()}</p>
          </div>
          
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-800">Applications</span>
            </div>
            <p className="text-2xl font-bold text-green-900 mt-1">{state.selectedApps.length}</p>
          </div>
          
          <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <span className="font-medium text-orange-800">Conflicts</span>
            </div>
            <p className="text-2xl font-bold text-orange-900 mt-1">{conflicts.length}</p>
          </div>
          
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="font-medium text-red-800">Predicted Errors</span>
            </div>
            <p className="text-2xl font-bold text-red-900 mt-1">{totalPredictedErrors}</p>
          </div>
        </div>
      )}

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Impact Preview Table */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <Eye className="h-5 w-5" />
            <span>Impact Preview</span>
          </h3>
          
          <ScrollArea className="h-96 border rounded-lg">
            <div className="p-4">
              {previewResults.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Eye className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Run preview analysis to see estimated impact</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {previewResults.map((result, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-background">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{result.applicationName}</span>
                          <Badge variant="outline">{result.object}</Badge>
                        </div>
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Open Details
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Adds:</span>
                          <span className="ml-2 font-medium text-green-600">+{result.estimatedAdds}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Updates:</span>
                          <span className="ml-2 font-medium text-blue-600">{result.estimatedUpdates}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Disables:</span>
                          <span className="ml-2 font-medium text-orange-600">{result.estimatedDisables}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Duration:</span>
                          <span className="ml-2 font-medium">{result.estimatedDuration}</span>
                        </div>
                      </div>
                      
                      {result.predictedErrors > 0 && (
                        <div className="mt-2 text-sm text-red-600">
                          <AlertTriangle className="h-4 w-4 inline mr-1" />
                          {result.predictedErrors} predicted error{result.predictedErrors !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Conflicts & Risks Panel */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Conflicts & Risks</span>
          </h3>
          
          <ScrollArea className="h-96 border rounded-lg">
            <div className="p-4">
              {conflicts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No conflicts detected</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {conflicts.map((conflict, index) => (
                    <div key={index} className={`border rounded-lg p-4 ${getSeverityColor(conflict.severity)}`}>
                      <div className="flex items-start space-x-3">
                        <div className="pt-0.5">
                          {getConflictIcon(conflict.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium">{conflict.applicationName}</span>
                            <Badge variant="outline" className="text-xs">
                              {conflict.severity.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm mb-2">{conflict.description}</p>
                          <p className="text-xs font-medium">
                            Recommendation: {conflict.recommendation}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Advanced Dry-Run Section */}
      <AdvancedDryRun selectedApps={state.selectedApps} />
    </div>
  );
}
