
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users } from 'lucide-react';
import InfoTooltip from '@/components/dashboard/InfoTooltip';
import { highRiskIdentities } from '@/data/mock-risk-analytics';
import { HighRiskIdentity } from '@/types/riskAnalytics';
import { cn } from '@/lib/utils';

interface Props {
  onIdentityClick?: (identity: HighRiskIdentity) => void;
}

export const TopRiskyIdentities: React.FC<Props> = ({ onIdentityClick }) => {
  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      'Open': 'destructive',
      'In Progress': 'secondary',
      'Mitigated': 'outline',
      'Accepted': 'outline',
    };
    return <Badge variant={map[status] as any || 'outline'} className="text-xs">{status}</Badge>;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-destructive font-bold';
    if (score >= 60) return 'text-orange-600 font-semibold';
    if (score >= 40) return 'text-yellow-600';
    return 'text-muted-foreground';
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      'Employee': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'Contractor': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      'NHI': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
      'Privileged': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };
    return <span className={cn("px-1.5 py-0.5 rounded text-xs font-medium", colors[type])}>{type}</span>;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-4 w-4 text-primary" />
          Top Risky Identities
          <InfoTooltip text="Ranked list of identities with highest composite risk scores. Score breakdown: Access (excessive/unused entitlements), SoD (policy violations), Certification (overdue/rubber-stamped reviews), Privilege (elevated access without controls)." />
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Identity</TableHead>
                <TableHead className="text-xs">Type</TableHead>
                <TableHead className="text-xs">Dept</TableHead>
                <TableHead className="text-xs text-center">Risk</TableHead>
                <TableHead className="text-xs text-center">Access</TableHead>
                <TableHead className="text-xs text-center">SoD</TableHead>
                <TableHead className="text-xs text-center">Cert</TableHead>
                <TableHead className="text-xs text-center">Priv</TableHead>
                <TableHead className="text-xs text-center">Violations</TableHead>
                <TableHead className="text-xs">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {highRiskIdentities.map((identity) => (
                <TableRow key={identity.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onIdentityClick?.(identity)}>
                  <TableCell className="py-2">
                    <div className="font-medium text-sm text-foreground">{identity.name}</div>
                    <div className="text-xs text-muted-foreground">{identity.id}</div>
                  </TableCell>
                  <TableCell className="py-2">{getTypeBadge(identity.type)}</TableCell>
                  <TableCell className="py-2 text-xs text-muted-foreground">{identity.department}</TableCell>
                  <TableCell className="py-2 text-center">
                    <span className={cn("text-sm", getScoreColor(identity.riskScore))}>{identity.riskScore}</span>
                  </TableCell>
                  <TableCell className="py-2 text-center text-xs text-muted-foreground">{identity.accessScore}</TableCell>
                  <TableCell className="py-2 text-center text-xs text-muted-foreground">{identity.sodScore}</TableCell>
                  <TableCell className="py-2 text-center text-xs text-muted-foreground">{identity.certScore}</TableCell>
                  <TableCell className="py-2 text-center text-xs text-muted-foreground">{identity.privilegeScore}</TableCell>
                  <TableCell className="py-2 text-center text-xs font-medium text-foreground">{identity.violations}</TableCell>
                  <TableCell className="py-2">{getStatusBadge(identity.remediationStatus)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
