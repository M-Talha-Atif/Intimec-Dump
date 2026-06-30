'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { 
  Download, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Loader2, AlertCircle
} from "lucide-react";
import { useWorkflowAnalytics, WorkflowKpiEntry } from '@/hooks/workflows/analytics/useWorkflowAnalytics';

interface WorkflowKpiDrilldownModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kpiType: string;
  title: string;
  description: string;
}

const statusColor: Record<string, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  DRAFT: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  DEPRECATED: 'bg-muted text-muted-foreground',
};

const riskColor = (score: number) => {
  if (score >= 7) return 'text-destructive font-semibold';
  if (score >= 4) return 'text-amber-600 font-medium';
  return 'text-emerald-600';
};

const WorkflowKpiDrilldownModal: React.FC<WorkflowKpiDrilldownModalProps> = ({
  open,
  onOpenChange,
  kpiType,
  title,
  description,
}) => {
  const { fetchKpiDrilldown, loading } = useWorkflowAnalytics();
  
  const [workflows, setWorkflows] = useState<WorkflowKpiEntry[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalWorkflows, setTotalWorkflows] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pageSize = 50;

  // Fetch drilldown data
  useEffect(() => {
    if (open && kpiType) {
      loadDrilldownData(currentPage);
    }
  }, [open, kpiType, currentPage]);

  const loadDrilldownData = async (page: number) => {
    setError(null);
    
    try {
      const result = await fetchKpiDrilldown(kpiType, page, pageSize, 'name', 'ASC');
      
      if (result) {
        setWorkflows(result.workflows);
        setTotalPages(result.totalPages);
        setTotalWorkflows(result.totalWorkflows);
        setHasNext(result.hasNext);
        setHasPrevious(result.hasPrevious);
      }
    } catch (err) {
      setError('Failed to load workflow data');
      console.error('Error loading drilldown data:', err);
    }
  };

  const handleExportCsv = () => {
    const headers = ['Name', 'Category', 'Status', 'Trigger', 'Risk', 'Executions', 'Avg Time (h)'];
    const rows = workflows.map(w => [
      w.name,
      w.category,
      w.status,
      w.triggerType,
      w.riskScore,
      w.executionCount,
      w.avgExecutionTimeHours || 'N/A',
    ]);
    
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const goToFirstPage = () => setCurrentPage(0);
  const goToLastPage = () => setCurrentPage(totalPages - 1);
  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages - 1));
  const goToPreviousPage = () => setCurrentPage(prev => Math.max(prev - 1, 0));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex justify-between items-center mb-2">
          <p className="text-sm text-muted-foreground">
            Total: <span className="font-semibold">{totalWorkflows}</span> workflows
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExportCsv} 
            className="flex items-center gap-1.5"
            disabled={workflows.length === 0}
          >
            <Download className="h-3.5 w-3.5" /> Export CSV
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto border rounded-md">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
                <p className="text-destructive font-semibold">{error}</p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Trigger</TableHead>
                  <TableHead className="text-right">Risk</TableHead>
                  <TableHead className="text-right">Executions</TableHead>
                  {kpiType === 'AVERAGE_EXECUTION_TIME_WORKFLOWS' && (
                    <TableHead className="text-right">Avg Time</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {workflows.length === 0 ? (
                  <TableRow>
                    <TableCell 
                      colSpan={kpiType === 'AVERAGE_EXECUTION_TIME_WORKFLOWS' ? 7 : 6} 
                      className="text-center text-muted-foreground py-8"
                    >
                      No workflows match this filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  workflows.map(w => (
                    <TableRow key={w.id}>
                      <TableCell className="font-medium max-w-xs truncate" title={w.name}>
                        {w.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {w.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-xs ${statusColor[w.status] || ''}`}>
                          {w.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{w.triggerType}</TableCell>
                      <TableCell className={`text-right ${riskColor(w.riskScore)}`}>
                        {w.riskScore}/10
                      </TableCell>
                      <TableCell className="text-right">{w.executionCount}</TableCell>
                      {kpiType === 'AVERAGE_EXECUTION_TIME_WORKFLOWS' && (
                        <TableCell className="text-right">
                          {w.avgExecutionTimeHours ? `${w.avgExecutionTimeHours}h` : 'N/A'}
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-muted-foreground">
              Page {currentPage + 1} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToFirstPage}
                disabled={!hasPrevious || loading}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousPage}
                disabled={!hasPrevious || loading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextPage}
                disabled={!hasNext || loading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToLastPage}
                disabled={!hasNext || loading}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WorkflowKpiDrilldownModal;