import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, TrendingUp, TrendingDown } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useCssVariable } from '@/hooks/useCssVariable';
import { toast } from 'sonner';

export interface DrilldownColumn {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}

export interface DrilldownTrendPoint {
  label: string;
  value: number;
}

interface AccessAnalysisDrilldownDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  metric?: {
    value: string | number;
    trend?: { value: number; isPositive: boolean };
  };
  columns: DrilldownColumn[];
  data: Record<string, any>[];
  trendData?: DrilldownTrendPoint[];
  trendLabel?: string;
  onRowClick?: (row: any) => void;
  children?: React.ReactNode;
}

export const AccessAnalysisDrilldownDrawer = ({
  open,
  onOpenChange,
  title,
  description,
  metric,
  columns,
  data,
  trendData,
  trendLabel = 'Trend',
  onRowClick,
  children,
}: AccessAnalysisDrilldownDrawerProps) => {
  const chart1 = useCssVariable('--chart-1');

  const handleExport = () => {
    const headers = columns.map(c => c.label).join(',');
    const rows = data.map(row => columns.map(c => row[c.key] ?? '').join(',')).join('\n');
    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_').toLowerCase()}_export.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle>{title}</DialogTitle>
              {description && <DialogDescription className="mt-1">{description}</DialogDescription>}
            </div>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-1" />Export
            </Button>
          </div>
        </DialogHeader>

        {metric && (
          <div className="flex items-baseline gap-3 p-4 rounded-lg bg-muted/50">
            <span className="text-3xl font-bold">{metric.value}</span>
            {metric.trend && (
              <div className={`flex items-center gap-1 text-sm font-medium ${metric.trend.isPositive ? 'text-success' : 'text-destructive'}`}>
                {metric.trend.isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {metric.trend.isPositive ? '+' : ''}{metric.trend.value}%
              </div>
            )}
          </div>
        )}

        {children}

        {trendData && trendData.length > 0 && (
          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--popover-foreground))' }}
                />
                <Area type="monotone" dataKey="value" name={trendLabel} stroke={`hsl(${chart1})`} fill={`hsl(${chart1} / 0.2)`} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="border rounded-lg overflow-hidden max-h-[400px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map(col => (
                  <TableHead key={col.key}>{col.label}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, i) => (
                <TableRow
                  key={i}
                  className={onRowClick ? 'cursor-pointer hover:bg-muted/50' : ''}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map(col => (
                    <TableCell key={col.key}>
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              {data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center py-8 text-muted-foreground">
                    No data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
};
