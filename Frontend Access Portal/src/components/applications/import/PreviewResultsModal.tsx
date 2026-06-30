
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  Database, 
  Eye, 
  FileText,
  Zap,
  Shield,
  Info,
  Users,
  Bot,
  UserCheck
} from 'lucide-react';

interface PreviewData {
  connectionStatus: 'success' | 'failed' | 'timeout';
  recordCount: number;
  validationWarnings: string[];
  lastImportTimestamp?: string;
  schemaFields: { field: string; mapped: boolean; type: string }[];
  samplePayload: any[];
  qualityScore: number;
  aiDiagnostic?: string;
  suggestedFixes: string[];
}

interface PreviewResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'accounts' | 'entitlements';
  identityType: 'employee' | 'non-employee' | 'non-human';
  applicationName: string;
  previewData: PreviewData | null;
  isLoading: boolean;
}

export function PreviewResultsModal({ 
  isOpen, 
  onClose, 
  type, 
  identityType, 
  applicationName, 
  previewData,
  isLoading 
}: PreviewResultsModalProps) {
  const getIdentityIcon = () => {
    switch (identityType) {
      case 'employee': return Users;
      case 'non-employee': return UserCheck;
      case 'non-human': return Bot;
      default: return Users;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'timeout': return <Clock className="h-5 w-5 text-yellow-500" />;
      default: return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getQualityColor = (score: number) => {
    if (score >= 4) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 3) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const IdentityIcon = getIdentityIcon();

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Preview Results - {type}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-4">
              <div className="animate-spin">
                <Database className="h-8 w-8 text-blue-500" />
              </div>
              <div>
                <p className="font-medium">Running dry-run validation...</p>
                <p className="text-sm text-muted-foreground">Testing connection and analyzing data structure</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!previewData) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Preview Results</DialogTitle>
          </DialogHeader>
          <div className="text-center p-8">
            <p className="text-muted-foreground">No preview data available</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <IdentityIcon className="h-4 w-4" />
            <span>Preview Results - {applicationName} {type}</span>
            <Badge variant="outline">{identityType.replace('-', ' ')}</Badge>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[75vh]">
          <div className="space-y-6 p-1">
            {/* Connection Status */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2">
                  {getStatusIcon(previewData.connectionStatus)}
                  <span>Connection Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-1">Status</p>
                    <Badge variant={previewData.connectionStatus === 'success' ? 'default' : 'destructive'}>
                      {previewData.connectionStatus.toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Records Found</p>
                    <p className="text-2xl font-bold text-blue-600">{previewData.recordCount.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">{type} will be imported</p>
                  </div>
                </div>
                {previewData.lastImportTimestamp && (
                  <div className="mt-4 p-3 bg-muted/50 rounded">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Last Import: {previewData.lastImportTimestamp}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quality Scorecard */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Quality Scorecard</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`p-4 rounded-lg border ${getQualityColor(previewData.qualityScore)}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Import Readiness Score</p>
                      <p className="text-sm opacity-80">
                        {previewData.qualityScore >= 4 ? 'Ready for import' : 
                         previewData.qualityScore >= 3 ? 'Review warnings before import' : 
                         'Issues detected - fix before import'}
                      </p>
                    </div>
                    <div className="text-3xl font-bold">
                      {previewData.qualityScore}/5
                    </div>
                  </div>
                </div>
                
                {previewData.aiDiagnostic && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                    <div className="flex items-start space-x-2">
                      <Zap className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">AI Diagnostic</p>
                        <p className="text-sm text-blue-700">{previewData.aiDiagnostic}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Validation Warnings */}
            {previewData.validationWarnings.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    <span>Validation Warnings</span>
                    <Badge variant="outline">{previewData.validationWarnings.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {previewData.validationWarnings.map((warning, index) => (
                      <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded flex items-start space-x-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                        <span className="text-sm text-yellow-800">{warning}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Schema Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Schema Summary</span>
                </CardTitle>
                <CardDescription>Key fields detected and mapping status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {previewData.schemaFields.map((field, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium text-sm">{field.field}</p>
                        <p className="text-xs text-muted-foreground">{field.type}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {field.mapped ? (
                          <Badge variant="default">Mapped</Badge>
                        ) : (
                          <Badge variant="destructive">Unmapped</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Suggested Fixes */}
            {previewData.suggestedFixes.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2">
                    <Info className="h-5 w-5 text-blue-500" />
                    <span>Suggested Fixes</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {previewData.suggestedFixes.map((fix, index) => (
                      <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-sm text-blue-800">{fix}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Sample Payload */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="h-5 w-5" />
                  <span>Sample Payload</span>
                </CardTitle>
                <CardDescription>Preview of {previewData.samplePayload.length} sample records</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64 w-full">
                  <pre className="text-xs bg-muted/50 p-4 rounded overflow-x-auto">
                    {JSON.stringify(previewData.samplePayload, null, 2)}
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        <Separator />

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="outline" onClick={onClose}>
            Close Preview
          </Button>
          {previewData.qualityScore >= 3 && (
            <Button>
              Proceed to Import
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
