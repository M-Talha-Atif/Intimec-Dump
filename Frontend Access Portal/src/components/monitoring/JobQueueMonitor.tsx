import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Pause, RotateCcw, XCircle, Search, Loader2, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { jobQueue, type JobQueueEntry } from './data/monitoring-data';
import { toast } from 'sonner';

const statusConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  running: { icon: Loader2, color: 'text-blue-600', label: 'Running' },
  queued: { icon: Clock, color: 'text-muted-foreground', label: 'Queued' },
  completed: { icon: CheckCircle, color: 'text-green-600', label: 'Completed' },
  failed: { icon: AlertCircle, color: 'text-destructive', label: 'Failed' },
  cancelled: { icon: XCircle, color: 'text-muted-foreground', label: 'Cancelled' },
};

const typeBadgeColor: Record<string, string> = {
  sync: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  provisioning: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  certification_scan: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  policy_evaluation: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  report_generation: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
};

export const JobQueueMonitor = () => {
  const [jobs, setJobs] = useState<JobQueueEntry[]>(jobQueue);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = jobs.filter(j => {
    const matchSearch = !search || j.name.toLowerCase().includes(search.toLowerCase()) || j.connector.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || j.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    running: jobs.filter(j => j.status === 'running').length,
    queued: jobs.filter(j => j.status === 'queued').length,
    failed: jobs.filter(j => j.status === 'failed').length,
    completed: jobs.filter(j => j.status === 'completed').length,
  };

  const handleRetry = (jobId: string) => {
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'queued' as const, retryCount: j.retryCount + 1, error: undefined, progress: 0, recordsProcessed: 0 } : j));
    toast.success('Job requeued for retry');
  };

  const handleCancel = (jobId: string) => {
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'cancelled' as const } : j));
    toast.info('Job cancelled');
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        {Object.entries(counts).map(([key, val]) => {
          const cfg = statusConfig[key];
          const Icon = cfg.icon;
          return (
            <Card key={key}>
              <CardContent className="p-4 flex items-center gap-3">
                <Icon className={`h-5 w-5 ${cfg.color} ${key === 'running' ? 'animate-spin' : ''}`} />
                <div>
                  <p className="text-2xl font-bold text-foreground">{val}</p>
                  <p className="text-xs text-muted-foreground">{cfg.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search jobs..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="queued">Queued</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Job List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Job Queue ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filtered.map(job => {
              const cfg = statusConfig[job.status];
              const Icon = cfg.icon;
              return (
                <div key={job.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className={`h-5 w-5 ${cfg.color} ${job.status === 'running' ? 'animate-spin' : ''}`} />
                      <div>
                        <p className="font-medium text-foreground">{job.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={typeBadgeColor[job.type] || ''} variant="secondary">
                            {job.type.replace('_', ' ')}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{job.connector}</span>
                          {job.startedAt && <span className="text-xs text-muted-foreground">Started: {job.startedAt}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {job.status === 'failed' && (
                        <Button variant="outline" size="sm" onClick={() => handleRetry(job.id)}>
                          <RotateCcw className="h-3 w-3 mr-1" /> Retry
                        </Button>
                      )}
                      {(job.status === 'running' || job.status === 'queued') && (
                        <Button variant="outline" size="sm" onClick={() => handleCancel(job.id)}>
                          <XCircle className="h-3 w-3 mr-1" /> Cancel
                        </Button>
                      )}
                    </div>
                  </div>

                  {(job.status === 'running' || job.status === 'completed') && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{job.recordsProcessed.toLocaleString()} / {job.recordsTotal.toLocaleString()} records</span>
                        <span>{job.progress}%</span>
                      </div>
                      <Progress value={job.progress} className="h-2" />
                    </div>
                  )}

                  {job.error && (
                    <div className="text-xs text-destructive bg-destructive/10 p-2 rounded">
                      {job.error}
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Operator: {job.operator}</span>
                    {job.retryCount > 0 && <span>Retries: {job.retryCount}</span>}
                    {job.estimatedEnd && <span>ETA: {job.estimatedEnd}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
