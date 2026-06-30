
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Clock, User, CheckCircle, XCircle, AlertTriangle, 
  Download, BarChart3, Shield, FileText
} from 'lucide-react';
import { formatTimestamp } from '@/utils/dateFormat';

interface ImportAuditRecord {
  id: string;
  runId: string;
  status: 'completed' | 'failed' | 'cancelled' | 'partial';
  startTime: string;
  endTime?: string;
  duration: number;
  triggeredBy: string;
  appsInvolved: string[];
  totalObjects: number;
  successfulObjects: number;
  failedObjects: number;
  errors: string[];
  summary: {
    accountsProcessed: number;
    entitlementsProcessed: number;
    conflictsDetected: number;
    risksIdentified: number;
  };
  businessJustification?: string;
}

interface AuditDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditRecord: ImportAuditRecord | null;
}

export function AuditDetailModal({ isOpen, onClose, auditRecord }: AuditDetailModalProps) {
  if (!auditRecord) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'failed': return <XCircle className="h-5 w-5 text-red-600" />;
      case 'cancelled': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'partial': return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      default: return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'default',
      failed: 'destructive',
      cancelled: 'secondary',
      partial: 'outline'
    };
    return <Badge variant={variants[status as keyof typeof variants] as any}>{status}</Badge>;
  };

  const formatDuration = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  const successRate = Math.round((auditRecord.successfulObjects / auditRecord.totalObjects) * 100);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            {getStatusIcon(auditRecord.status)}
            <span>Import Run Details - {auditRecord.runId}</span>
            {getStatusBadge(auditRecord.status)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Objects</p>
                    <p className="text-2xl font-bold">{auditRecord.totalObjects.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Successful</p>
                    <p className="text-2xl font-bold text-green-600">{auditRecord.successfulObjects.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Failed</p>
                    <p className="text-2xl font-bold text-red-600">{auditRecord.failedObjects.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="text-2xl font-bold">{formatDuration(auditRecord.duration)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Success Rate */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Overall Success Rate</span>
                  <span className="font-medium">{successRate}%</span>
                </div>
                <Progress value={successRate} className="h-2" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{auditRecord.successfulObjects.toLocaleString()} successful</span>
                  <span>{auditRecord.failedObjects.toLocaleString()} failed</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Run Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Run Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Triggered By</label>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="h-4 w-4" />
                    <span>{auditRecord.triggeredBy}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Start Time</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatTimestamp(auditRecord.startTime)}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Applications Involved</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {auditRecord.appsInvolved.map((app, index) => (
                    <Badge key={index} variant="secondary">{app}</Badge>
                  ))}
                </div>
              </div>

              {auditRecord.businessJustification && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Business Justification</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md italic">
                    {auditRecord.businessJustification}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Processing Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Processing Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{auditRecord.summary.accountsProcessed.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Accounts Processed</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{auditRecord.summary.entitlementsProcessed.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Entitlements Processed</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{auditRecord.summary.conflictsDetected}</div>
                  <div className="text-sm text-muted-foreground">Conflicts Detected</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{auditRecord.summary.risksIdentified}</div>
                  <div className="text-sm text-muted-foreground">Risks Identified</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Errors */}
          {auditRecord.errors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Errors & Issues ({auditRecord.errors.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {auditRecord.errors.map((error, index) => (
                    <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <div className="flex items-start gap-2">
                        <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-red-700">{error}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button variant="outline">
                <Shield className="h-4 w-4 mr-2" />
                View Security Analysis
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
