
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download, Search, Shield } from 'lucide-react';
import InfoTooltip from '@/components/dashboard/InfoTooltip';
import { sodViolations } from '@/data/mock-risk-analytics';
import { SoDViolation } from '@/types/riskAnalytics';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";

interface Props {
  onViolationClick?: (violation: SoDViolation) => void;
}

export const RiskDataTables: React.FC<Props> = ({ onViolationClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const filtered = sodViolations.filter(v =>
    !searchTerm || v.policyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.violator.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.application.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSeverityBadge = (severity: string) => {
    const map: Record<string, 'destructive' | 'secondary' | 'outline'> = {
      'Critical': 'destructive', 'High': 'secondary', 'Medium': 'outline',
    };
    return <Badge variant={map[severity] || 'outline'} className="text-xs">{severity}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      'Open': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      'In Review': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      'Mitigated': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'Exception Granted': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    };
    return <span className={cn("px-1.5 py-0.5 rounded text-xs font-medium", colors[status])}>{status}</span>;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4 text-primary" />
            SoD & Policy Violations
            <InfoTooltip text="All active Segregation of Duties violations across applications. Each row represents conflicting entitlements held by a single identity." />
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="Search violations..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8 h-8 w-56 text-sm" />
            </div>
            <Button variant="outline" size="sm" onClick={() => toast({ title: "Export Started", description: "SoD violations exported as CSV" })}>
              <Download className="h-3.5 w-3.5 mr-1" /> Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Policy</TableHead>
                <TableHead className="text-xs">Violator</TableHead>
                <TableHead className="text-xs">Conflicting Entitlements</TableHead>
                <TableHead className="text-xs">Application</TableHead>
                <TableHead className="text-xs">Severity</TableHead>
                <TableHead className="text-xs text-center">Days Open</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs">Compensating Control</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((v) => (
                <TableRow key={v.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onViolationClick?.(v)}>
                  <TableCell className="py-2">
                    <div className="font-medium text-sm text-foreground">{v.policyName}</div>
                    <div className="text-xs text-muted-foreground">{v.id}</div>
                  </TableCell>
                  <TableCell className="py-2 text-sm text-foreground">{v.violator}</TableCell>
                  <TableCell className="py-2">
                    <div className="flex flex-col gap-0.5">
                      {v.conflictingEntitlements.map((e, i) => (
                        <Badge key={i} variant="outline" className="text-xs w-fit">{e}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="py-2 text-xs text-muted-foreground">{v.application}</TableCell>
                  <TableCell className="py-2">{getSeverityBadge(v.severity)}</TableCell>
                  <TableCell className="py-2 text-center">
                    <span className={cn("text-xs font-medium", v.daysOpen > 30 ? 'text-destructive' : v.daysOpen > 14 ? 'text-orange-600' : 'text-foreground')}>
                      {v.daysOpen}d
                    </span>
                  </TableCell>
                  <TableCell className="py-2">{getStatusBadge(v.remediationStatus)}</TableCell>
                  <TableCell className="py-2 text-xs text-muted-foreground max-w-[150px] truncate">
                    {v.compensatingControl || <span className="text-destructive">None</span>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
