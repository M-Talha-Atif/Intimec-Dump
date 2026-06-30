import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, CheckCircle, XCircle, AlertCircle, RotateCcw, Play } from 'lucide-react';
import { remediationService } from '@/services/accessReviewService';
import type { RemediationStatus } from '@/types/accessReview';
import { toast } from 'sonner';

export const RemediationDashboard: React.FC = () => {
  const [remediations, setRemediations] = useState<RemediationStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRemediations();
  }, []);

  const loadRemediations = async () => {
    try {
      const data = await remediationService.getRemediationQueue();
      setRemediations(data);
    } catch (error) {
      toast.error('Failed to load remediation queue');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async (id: string) => {
    try {
      await remediationService.retryRemediation(id);
      toast.success('Remediation retry initiated');
      loadRemediations();
    } catch (error) {
      toast.error('Failed to retry remediation');
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await remediationService.cancelRemediation(id);
      toast.success('Remediation cancelled');
      loadRemediations();
    } catch (error) {
      toast.error('Failed to cancel remediation');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'queued':
        return <Clock className="h-4 w-4 text-amber-600" />;
      case 'in-progress':
        return <Play className="h-4 w-4 text-blue-600 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'queued':
        return 'bg-amber-100 text-amber-700';
      case 'in-progress':
        return 'bg-blue-100 text-blue-700';
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getActionTypeColor = (type: string) => {
    switch (type) {
      case 'deprovision':
        return 'destructive';
      case 'notify':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return <Card><CardContent className="p-8 text-center">Loading remediation queue...</CardContent></Card>;
  }

  const completedCount = remediations.filter(r => r.status === 'completed').length;
  const failedCount = remediations.filter(r => r.status === 'failed').length;
  const inProgressCount = remediations.filter(r => r.status === 'in-progress').length;
  const queuedCount = remediations.filter(r => r.status === 'queued').length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Queued</p>
                <p className="text-2xl font-bold">{queuedCount}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">{inProgressCount}</p>
              </div>
              <Play className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{completedCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold">{failedCount}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Remediation Queue</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {remediations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No remediations in queue
            </div>
          ) : (
            remediations.map(rem => {
              const completedActions = rem.actions.filter(a => a.status === 'completed').length;
              const progress = (completedActions / rem.actions.length) * 100;

              return (
                <Card key={rem.id}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(rem.status)}
                          <div>
                            <Badge className={getStatusColor(rem.status)} variant="secondary">
                              {rem.status}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              {rem.actions.length} actions • {completedActions} completed
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {rem.status === 'failed' && (
                            <Button size="sm" variant="outline" onClick={() => handleRetry(rem.id)}>
                              <RotateCcw className="h-3 w-3" />
                            </Button>
                          )}
                          {(rem.status === 'queued' || rem.status === 'in-progress') && (
                            <Button size="sm" variant="destructive" onClick={() => handleCancel(rem.id)}>
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>

                      <Progress value={progress} className="h-2" />

                      <div className="space-y-1">
                        {rem.actions.map(action => (
                          <div key={action.id} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <Badge variant={getActionTypeColor(action.type)} className="text-xs">
                                {action.type}
                              </Badge>
                              <span className="text-muted-foreground">{action.target}</span>
                            </div>
                            <Badge variant={action.status === 'completed' ? 'default' : 'outline'} className="text-xs">
                              {action.status}
                            </Badge>
                          </div>
                        ))}
                      </div>

                      {rem.errorMessage && (
                        <Card className="bg-red-50 border-red-200">
                          <CardContent className="p-2">
                            <p className="text-xs text-red-700">{rem.errorMessage}</p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
};
