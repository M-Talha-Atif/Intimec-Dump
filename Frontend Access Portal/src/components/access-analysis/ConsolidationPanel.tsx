import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Merge, Eye, Brain, AlertTriangle, Users, Layers, CheckCircle2, XCircle, TrendingDown, Shield, Sparkles, Target, ArrowRight } from 'lucide-react';
import InfoTooltip from '@/components/dashboard/InfoTooltip';
import { AccessAnalysisDrilldownDrawer } from './AccessAnalysisDrilldownDrawer';
import { toast } from 'sonner';

const roleNames = ['Finance Analyst', 'HR Manager', 'Eng Lead', 'Sales Rep', 'IT Admin', 'Compliance', 'Marketing', 'Ops Manager', 'Data Analyst', 'Security Eng'];

const overlapMatrix: number[][] = [
  [100, 12, 8, 15, 22, 18, 10, 25, 32, 14],
  [12, 100, 14, 8, 10, 20, 12, 16, 18, 8],
  [8, 14, 100, 6, 45, 10, 8, 28, 35, 42],
  [15, 8, 6, 100, 5, 8, 38, 12, 10, 4],
  [22, 10, 45, 5, 100, 15, 6, 32, 28, 72],
  [18, 20, 10, 8, 15, 100, 8, 14, 22, 18],
  [10, 12, 8, 38, 6, 8, 100, 15, 12, 5],
  [25, 16, 28, 12, 32, 14, 15, 100, 30, 24],
  [32, 18, 35, 10, 28, 22, 12, 30, 100, 26],
  [14, 8, 42, 4, 72, 18, 5, 24, 26, 100],
];

const mergeRecommendations = [
  { id: 'MR-001', sourceA: 'IT Admin', sourceB: 'Security Eng', overlap: 72, affectedUsers: 18, riskImpact: 'Medium', benefit: 'Eliminate 18 redundant entitlements', targetName: 'Infrastructure Security', benefitScore: 88 },
  { id: 'MR-002', sourceA: 'Eng Lead', sourceB: 'IT Admin', overlap: 45, affectedUsers: 40, riskImpact: 'High', benefit: 'Consolidate 12 shared technical entitlements', targetName: 'Technical Lead', benefitScore: 72 },
  { id: 'MR-003', sourceA: 'Sales Rep', sourceB: 'Marketing', overlap: 38, affectedUsers: 94, riskImpact: 'Low', benefit: 'Unified customer-facing role with 8 shared entitlements', targetName: 'Revenue Operations', benefitScore: 65 },
  { id: 'MR-004', sourceA: 'Data Analyst', sourceB: 'Eng Lead', overlap: 35, affectedUsers: 46, riskImpact: 'Medium', benefit: 'Merge analytics and development access patterns', targetName: 'Analytics Engineer', benefitScore: 58 },
  { id: 'MR-005', sourceA: 'Finance Analyst', sourceB: 'Data Analyst', overlap: 32, affectedUsers: 63, riskImpact: 'Low', benefit: 'Common reporting and analytics access consolidation', targetName: 'Business Intelligence Analyst', benefitScore: 52 },
];

const redundancyCards = [
  { roleA: 'IT Admin', roleB: 'Security Eng', overlap: 72, users: 18, entitlements: 18, savings: 'High' },
  { roleA: 'Eng Lead', roleB: 'IT Admin', overlap: 45, users: 40, entitlements: 12, savings: 'Medium' },
  { roleA: 'Sales Rep', roleB: 'Marketing', overlap: 38, users: 94, entitlements: 8, savings: 'Medium' },
];

const getRoleUsersForConsolidation = (roleName: string) => {
  const userSets: Record<string, { name: string; department: string; riskScore: number }[]> = {
    'IT Admin': [
      { name: 'James Wilson', department: 'IT', riskScore: 38 },
      { name: 'Robert Lee', department: 'IT', riskScore: 30 },
      { name: 'Thomas Brown', department: 'IT', riskScore: 25 },
      { name: 'Kevin Zhang', department: 'Infrastructure', riskScore: 42 },
      { name: 'Maria Garcia', department: 'IT', riskScore: 18 },
    ],
    'Security Eng': [
      { name: 'James Wilson', department: 'Security', riskScore: 38 },
      { name: 'Nina Patel', department: 'Security', riskScore: 52 },
      { name: 'Oliver Chen', department: 'Security', riskScore: 35 },
      { name: 'Kevin Zhang', department: 'Infrastructure', riskScore: 42 },
    ],
    'Eng Lead': [
      { name: 'Alex Johnson', department: 'Engineering', riskScore: 18 },
      { name: 'Priya Sharma', department: 'Engineering', riskScore: 25 },
      { name: 'Carlos Rivera', department: 'Engineering', riskScore: 14 },
      { name: 'James Wilson', department: 'DevOps', riskScore: 38 },
      { name: 'Sophie Taylor', department: 'Engineering', riskScore: 20 },
      { name: 'David Park', department: 'Engineering', riskScore: 22 },
    ],
    'Sales Rep': [
      { name: 'Rachel Adams', department: 'Sales', riskScore: 10 },
      { name: 'Mark Thompson', department: 'Sales', riskScore: 8 },
      { name: 'Laura White', department: 'Sales', riskScore: 12 },
      { name: 'Chris Evans', department: 'Sales', riskScore: 15 },
      { name: 'Jennifer Lee', department: 'Sales', riskScore: 6 },
    ],
    'Marketing': [
      { name: 'Samantha Clark', department: 'Marketing', riskScore: 8 },
      { name: 'Daniel Harris', department: 'Marketing', riskScore: 12 },
      { name: 'Rachel Adams', department: 'Marketing', riskScore: 10 },
      { name: 'Amy Foster', department: 'Marketing', riskScore: 5 },
    ],
    'Finance Analyst': [
      { name: 'Sarah Chen', department: 'Finance', riskScore: 12 },
      { name: 'Michael Torres', department: 'Finance', riskScore: 8 },
      { name: 'Emily Watson', department: 'Finance', riskScore: 15 },
      { name: 'David Park', department: 'Accounting', riskScore: 22 },
      { name: 'Lisa Kim', department: 'Finance', riskScore: 45 },
    ],
    'Data Analyst': [
      { name: 'Priya Sharma', department: 'Analytics', riskScore: 25 },
      { name: 'Michael Torres', department: 'Analytics', riskScore: 8 },
      { name: 'Sophie Taylor', department: 'Data Science', riskScore: 20 },
      { name: 'Amy Foster', department: 'Analytics', riskScore: 14 },
    ],
  };
  return userSets[roleName] || [
    { name: 'User 1', department: 'General', riskScore: 15 },
    { name: 'User 2', department: 'General', riskScore: 20 },
    { name: 'User 3', department: 'General', riskScore: 10 },
  ];
};

const getSharedEntitlements = (row: number, col: number) => {
  const overlap = overlapMatrix[row][col];
  const count = Math.max(2, Math.round(overlap / 15));
  const allEnts = [
    { entitlement: 'Email Access', application: 'O365', risk: 'Low', inRoleA: true, inRoleB: true, recommendation: 'Keep in merged role' },
    { entitlement: 'VPN Access', application: 'Network', risk: 'Low', inRoleA: true, inRoleB: true, recommendation: 'Keep in merged role' },
    { entitlement: 'Directory Read', application: 'AD', risk: 'Low', inRoleA: true, inRoleB: true, recommendation: 'Keep in merged role' },
    { entitlement: 'Cloud Console', application: 'AWS', risk: 'Medium', inRoleA: true, inRoleB: true, recommendation: 'Review necessity' },
    { entitlement: 'Reporting Dashboard', application: 'Tableau', risk: 'Low', inRoleA: true, inRoleB: false, recommendation: 'Keep for Role A only' },
    { entitlement: 'Document Management', application: 'SharePoint', risk: 'Low', inRoleA: false, inRoleB: true, recommendation: 'Keep for Role B only' },
    { entitlement: 'CI/CD Pipeline', application: 'Jenkins', risk: 'High', inRoleA: true, inRoleB: true, recommendation: 'Flag for review — high risk' },
    { entitlement: 'Cloud Infrastructure', application: 'AWS', risk: 'High', inRoleA: true, inRoleB: true, recommendation: 'Review SoD implications' },
  ];
  return allEnts.slice(0, count);
};

const getConsolidationAssessment = (roleA: string, roleB: string, overlap: number) => {
  const riskLevel = overlap >= 60 ? 'High' : overlap >= 30 ? 'Medium' : 'Low';
  const estimatedSavings = Math.round(overlap * 0.6);
  
  let recommendation = '';
  if (overlap >= 60) {
    recommendation = `Strong consolidation candidate. ${roleA} and ${roleB} share ${overlap}% of their entitlements, indicating significant redundancy. Merging would reduce the total role count and simplify access certification. Recommend proceeding with a phased merge after SoD validation.`;
  } else if (overlap >= 30) {
    recommendation = `Moderate consolidation opportunity. The ${overlap}% overlap between ${roleA} and ${roleB} suggests shared baseline access. Consider creating a parent role for common entitlements while preserving unique access as child roles. This approach maintains governance granularity while reducing duplication.`;
  } else {
    recommendation = `Limited consolidation benefit. The ${overlap}% overlap between ${roleA} and ${roleB} is primarily common infrastructure access. These roles serve distinct governance purposes and merging is not recommended. Consider a shared birthright role for the common entitlements instead.`;
  }

  const governanceNotes = overlap >= 50
    ? 'Review SoD constraints before merging — high-overlap roles may combine conflicting duties. Ensure merged role undergoes full certification cycle.'
    : 'No significant governance concerns identified. Standard approval workflow applies.';

  return { riskLevel, estimatedSavings, recommendation, governanceNotes };
};

const getMergePreview = (rec: any) => [
  { category: 'Shared Entitlements', sourceA: Math.round(rec.overlap * 0.25), sourceB: Math.round(rec.overlap * 0.25), merged: Math.round(rec.overlap * 0.25), status: 'Consolidated' },
  { category: 'Unique to ' + rec.sourceA, sourceA: Math.round((100 - rec.overlap) * 0.15), sourceB: '—', merged: Math.round((100 - rec.overlap) * 0.15), status: 'Kept' },
  { category: 'Unique to ' + rec.sourceB, sourceA: '—', sourceB: Math.round((100 - rec.overlap) * 0.12), merged: Math.round((100 - rec.overlap) * 0.12), status: 'Kept' },
  { category: 'Redundant (removed)', sourceA: Math.round(rec.overlap * 0.18), sourceB: Math.round(rec.overlap * 0.18), merged: 0, status: 'Removed' },
  { category: 'Total Users', sourceA: Math.round(rec.affectedUsers * 0.6), sourceB: Math.round(rec.affectedUsers * 0.4), merged: rec.affectedUsers, status: 'Combined' },
  { category: 'SoD Conflicts', sourceA: rec.riskImpact === 'High' ? 2 : 1, sourceB: rec.riskImpact === 'High' ? 1 : 0, merged: rec.riskImpact === 'High' ? 1 : 0, status: rec.riskImpact === 'High' ? 'Partially Resolved' : 'Resolved' },
];

const getRedundancyAnalysis = (card: typeof redundancyCards[0]) => [
  { entitlement: 'Email Access', application: 'O365', inRoleA: true, inRoleB: true, risk: 'Low', recommendation: 'Keep in merged role' },
  { entitlement: 'VPN Access', application: 'Network', inRoleA: true, inRoleB: true, risk: 'Low', recommendation: 'Keep in merged role' },
  { entitlement: 'Cloud Console', application: 'AWS', inRoleA: true, inRoleB: true, risk: 'Medium', recommendation: 'Review necessity' },
  { entitlement: 'Directory Read', application: 'AD', inRoleA: true, inRoleB: true, risk: 'Low', recommendation: 'Keep in merged role' },
  { entitlement: 'CI/CD Pipeline', application: 'Jenkins', inRoleA: true, inRoleB: false, risk: 'High', recommendation: 'Keep for technical users only' },
  { entitlement: 'Infra Admin', application: 'AWS', inRoleA: false, inRoleB: true, risk: 'High', recommendation: 'Keep for security users only' },
  { entitlement: 'Reporting Dashboard', application: 'Tableau', inRoleA: true, inRoleB: true, risk: 'Low', recommendation: 'Keep in merged role' },
  { entitlement: 'Audit Logs', application: 'Splunk', inRoleA: false, inRoleB: true, risk: 'Medium', recommendation: 'Keep in merged role' },
];

const getCellColor = (value: number, isDiagonal: boolean) => {
  if (isDiagonal) return 'bg-muted/30';
  if (value >= 60) return 'bg-destructive/15 text-destructive font-medium';
  if (value >= 30) return 'bg-warning/15 text-warning font-medium';
  if (value >= 15) return 'bg-muted/50';
  return '';
};

const getRiskBadge = (risk: string) => {
  switch (risk) {
    case 'High': return <Badge variant="destructive">{risk}</Badge>;
    case 'Medium': return <Badge className="bg-warning/15 text-warning border-warning/30">{risk}</Badge>;
    default: return <Badge variant="outline">{risk}</Badge>;
  }
};

const BenefitScoreCircle = ({ score }: { score: number }) => {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 75 ? 'text-success' : score >= 50 ? 'text-warning' : 'text-muted-foreground';

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="48" height="48" className="-rotate-90">
        <circle cx="24" cy="24" r={radius} fill="none" strokeWidth="4" className="stroke-muted" />
        <circle cx="24" cy="24" r={radius} fill="none" strokeWidth="4" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className={`${color} stroke-current`} />
      </svg>
      <span className="absolute text-xs font-bold">{score}</span>
    </div>
  );
};

export const ConsolidationPanel = () => {
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [selectedMerge, setSelectedMerge] = useState<any>(null);
  const [selectedRedundancy, setSelectedRedundancy] = useState<typeof redundancyCards[0] | null>(null);
  const [sortByOverlap, setSortByOverlap] = useState(false);

  const handleCellClick = (row: number, col: number) => {
    if (row === col) return;
    setSelectedCell({ row, col });
  };

  const sortedIndices = useMemo(() => {
    if (!sortByOverlap) return roleNames.map((_, i) => i);
    const pairs: { idx: number; maxOverlap: number }[] = roleNames.map((_, i) => ({
      idx: i,
      maxOverlap: Math.max(...overlapMatrix[i].filter((_, j) => j !== i)),
    }));
    pairs.sort((a, b) => b.maxOverlap - a.maxOverlap);
    return pairs.map(p => p.idx);
  }, [sortByOverlap]);

  const cellAssessment = useMemo(() => {
    if (!selectedCell) return null;
    return getConsolidationAssessment(
      roleNames[selectedCell.row],
      roleNames[selectedCell.col],
      overlapMatrix[selectedCell.row][selectedCell.col]
    );
  }, [selectedCell]);

  const cellUsersA = useMemo(() => {
    if (!selectedCell) return [];
    return getRoleUsersForConsolidation(roleNames[selectedCell.row]);
  }, [selectedCell]);

  const cellUsersB = useMemo(() => {
    if (!selectedCell) return [];
    return getRoleUsersForConsolidation(roleNames[selectedCell.col]);
  }, [selectedCell]);

  const redundancyAssessment = useMemo(() => {
    if (!selectedRedundancy) return null;
    return getConsolidationAssessment(selectedRedundancy.roleA, selectedRedundancy.roleB, selectedRedundancy.overlap);
  }, [selectedRedundancy]);

  const mergeUsersA = useMemo(() => {
    if (!selectedMerge) return [];
    return getRoleUsersForConsolidation(selectedMerge.sourceA);
  }, [selectedMerge]);

  const mergeUsersB = useMemo(() => {
    if (!selectedMerge) return [];
    return getRoleUsersForConsolidation(selectedMerge.sourceB);
  }, [selectedMerge]);

  return (
    <div className="space-y-6">
      {/* Overlap Matrix */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-1.5">
              Role Overlap Matrix
              <InfoTooltip text="Pairwise entitlement overlap between roles. Click any cell to see shared entitlements, user comparisons, and consolidation recommendations." />
            </CardTitle>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                Sort by highest overlap
                <InfoTooltip text="When enabled, roles with the highest maximum overlap are shown first." />
              </span>
              <Switch checked={sortByOverlap} onCheckedChange={setSortByOverlap} />
            </div>
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs">
            <div className="flex items-center gap-1.5"><div className="w-4 h-3 rounded bg-muted/50" /><span className="text-muted-foreground">Low (&lt;15%)</span></div>
            <div className="flex items-center gap-1.5"><div className="w-4 h-3 rounded bg-muted" /><span className="text-muted-foreground">Medium (15-30%)</span></div>
            <div className="flex items-center gap-1.5"><div className="w-4 h-3 rounded bg-warning/15" /><span className="text-muted-foreground">High (30-60%)</span></div>
            <div className="flex items-center gap-1.5"><div className="w-4 h-3 rounded bg-destructive/15" /><span className="text-muted-foreground">Critical (&gt;60%)</span></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 bg-background z-10 min-w-[120px]">Role</TableHead>
                  {sortedIndices.map(i => (
                    <TableHead key={i} className="text-center text-xs min-w-[80px] whitespace-nowrap">{roleNames[i]}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedIndices.map(rowIdx => (
                  <TableRow key={rowIdx}>
                    <TableCell className="sticky left-0 bg-background z-10 font-medium text-sm">{roleNames[rowIdx]}</TableCell>
                    {sortedIndices.map(colIdx => {
                      const isDiagonal = rowIdx === colIdx;
                      const value = overlapMatrix[rowIdx][colIdx];
                      return (
                        <TableCell
                          key={colIdx}
                          className={`text-center text-xs transition-colors ${isDiagonal ? 'bg-muted/30 text-muted-foreground' : 'cursor-pointer hover:ring-2 hover:ring-primary/50'} ${getCellColor(value, isDiagonal)}`}
                          onClick={() => handleCellClick(rowIdx, colIdx)}
                        >
                          {isDiagonal ? '—' : `${value}%`}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Merge Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-1.5">
            <Brain className="h-5 w-5 text-primary" />
            AI Merge Recommendations
            <Badge variant="outline">{mergeRecommendations.length} suggestions</Badge>
            <InfoTooltip text="AI-generated role merge recommendations ranked by consolidation benefit score." />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mergeRecommendations.map(rec => (
              <div key={rec.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <BenefitScoreCircle score={rec.benefitScore} />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary">{rec.sourceA}</Badge>
                        <Merge className="h-4 w-4 text-muted-foreground" />
                        <Badge variant="secondary">{rec.sourceB}</Badge>
                        <span className="text-muted-foreground">→</span>
                        <Badge className="bg-primary/10 text-primary">{rec.targetName}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Layers className="h-3.5 w-3.5" />{rec.overlap}% overlap</span>
                        <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{rec.affectedUsers} users</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={rec.riskImpact === 'High' ? 'destructive' : rec.riskImpact === 'Medium' ? 'outline' : 'secondary'}>
                    {rec.riskImpact} Risk
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{rec.benefit}</p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setSelectedMerge(rec)}>
                    <Eye className="h-4 w-4 mr-1" />Preview Merge
                  </Button>
                  <Button size="sm" variant="default" onClick={() => toast.success(`Merge approved: ${rec.sourceA} + ${rec.sourceB} → ${rec.targetName}`)}>
                    <CheckCircle2 className="h-4 w-4 mr-1" />Approve Merge
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => toast.info(`Dismissed: ${rec.sourceA} + ${rec.sourceB}`)}>
                    <XCircle className="h-4 w-4 mr-1" />Dismiss
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Redundancy Report */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-1.5">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Redundancy Report
            <InfoTooltip text="Roles with greater than 30% entitlement overlap. Click 'Analyze Consolidation' to see detailed analysis with user comparisons and AI recommendations." />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {redundancyCards.map((card, i) => (
              <Card key={i} className="border-warning/30">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">{card.overlap}% overlap</Badge>
                    <Badge variant="outline">{card.savings} savings</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">{card.roleA}</span>
                    <span className="text-muted-foreground">↔</span>
                    <span className="font-medium">{card.roleB}</span>
                  </div>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>{card.users} affected users</span>
                    <span>{card.entitlements} shared entitlements</span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => setSelectedRedundancy(card)}>
                    <TrendingDown className="h-3 w-3 mr-1" />Analyze Consolidation
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cell Drilldown — enriched with summary cards, user comparison, AI recommendation */}
      <AccessAnalysisDrilldownDrawer
        open={!!selectedCell}
        onOpenChange={(open) => !open && setSelectedCell(null)}
        title={selectedCell ? `${roleNames[selectedCell.row]} ↔ ${roleNames[selectedCell.col]}` : ''}
        description={selectedCell ? `Entitlement overlap analysis with user comparison and consolidation assessment` : ''}
        metric={selectedCell ? { value: `${overlapMatrix[selectedCell.row][selectedCell.col]}%` } : undefined}
        columns={[
          { key: 'entitlement', label: 'Entitlement' },
          { key: 'application', label: 'Application' },
          { key: 'risk', label: 'Risk', render: (v) => getRiskBadge(v) },
          { key: 'inRoleA', label: selectedCell ? roleNames[selectedCell.row] : 'Role A', render: (v) => v ? <CheckCircle2 className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-muted-foreground/40" /> },
          { key: 'inRoleB', label: selectedCell ? roleNames[selectedCell.col] : 'Role B', render: (v) => v ? <CheckCircle2 className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-muted-foreground/40" /> },
          { key: 'recommendation', label: 'Recommendation' },
        ]}
        data={selectedCell ? getSharedEntitlements(selectedCell.row, selectedCell.col) : []}
      >
        {selectedCell && cellAssessment && (
          <div className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg border bg-muted/30 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Layers className="h-3.5 w-3.5" />Overlap
                </div>
                <p className="text-2xl font-bold">{overlapMatrix[selectedCell.row][selectedCell.col]}%</p>
                <p className="text-xs text-muted-foreground">
                  {overlapMatrix[selectedCell.row][selectedCell.col] >= 60 ? 'Critical — strong merge candidate' : overlapMatrix[selectedCell.row][selectedCell.col] >= 30 ? 'Significant — review recommended' : 'Low — likely distinct roles'}
                </p>
              </div>
              <div className="p-3 rounded-lg border bg-muted/30 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Shield className="h-3.5 w-3.5" />Consolidation Risk
                </div>
                <div className="pt-1">{getRiskBadge(cellAssessment.riskLevel)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {cellAssessment.riskLevel === 'High' ? 'SoD validation required before merge' : 'Standard approval workflow applies'}
                </p>
              </div>
              <div className="p-3 rounded-lg border bg-muted/30 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <TrendingDown className="h-3.5 w-3.5" />Estimated Savings
                </div>
                <p className="text-2xl font-bold">{cellAssessment.estimatedSavings}%</p>
                <p className="text-xs text-muted-foreground">Entitlement reduction if consolidated</p>
              </div>
            </div>

            {/* Users Comparison */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">User Comparison</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">{roleNames[selectedCell.row]}</Badge>
                    <span className="text-xs text-muted-foreground">{cellUsersA.length} users</span>
                  </div>
                  {cellUsersA.map((u, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span>{u.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{u.department}</span>
                        <Badge variant={u.riskScore >= 40 ? 'destructive' : 'secondary'} className="text-xs">{u.riskScore}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">{roleNames[selectedCell.col]}</Badge>
                    <span className="text-xs text-muted-foreground">{cellUsersB.length} users</span>
                  </div>
                  {cellUsersB.map((u, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span>{u.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{u.department}</span>
                        <Badge variant={u.riskScore >= 40 ? 'destructive' : 'secondary'} className="text-xs">{u.riskScore}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {(() => {
                const sharedUsers = cellUsersA.filter(a => cellUsersB.some(b => b.name === a.name));
                if (sharedUsers.length === 0) return null;
                return (
                  <div className="p-2 rounded-md bg-primary/5 border border-primary/20 text-xs">
                    <span className="font-medium text-primary">Shared users ({sharedUsers.length}):</span>{' '}
                    <span className="text-muted-foreground">{sharedUsers.map(u => u.name).join(', ')}</span>
                  </div>
                );
              })()}
            </div>

            {/* AI Consolidation Recommendation */}
            <div className="p-4 rounded-lg border bg-muted/20 space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">AI Consolidation Assessment</span>
              </div>
              <p className="text-xs text-muted-foreground">{cellAssessment.recommendation}</p>
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground">Governance Notes:</span> {cellAssessment.governanceNotes}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground pt-1">
              <Layers className="h-3.5 w-3.5" />
              Entitlement Details
            </div>
          </div>
        )}
      </AccessAnalysisDrilldownDrawer>

      {/* Merge Preview Drawer — enriched with before/after and shared users */}
      <AccessAnalysisDrilldownDrawer
        open={!!selectedMerge}
        onOpenChange={(open) => !open && setSelectedMerge(null)}
        title={`Merge Preview: ${selectedMerge?.targetName || ''}`}
        description={`${selectedMerge?.sourceA} + ${selectedMerge?.sourceB} → ${selectedMerge?.targetName}`}
        metric={selectedMerge ? { value: `${selectedMerge.overlap}%`, trend: { value: selectedMerge.affectedUsers, isPositive: false } } : undefined}
        columns={[
          { key: 'category', label: 'Category' },
          { key: 'sourceA', label: selectedMerge?.sourceA || 'Source A' },
          { key: 'sourceB', label: selectedMerge?.sourceB || 'Source B' },
          { key: 'merged', label: 'After Merge' },
          { key: 'status', label: 'Status', render: (v) => (
            <Badge variant={v === 'Removed' ? 'destructive' : v === 'Consolidated' ? 'default' : 'outline'} className="text-xs">{v}</Badge>
          )},
        ]}
        data={selectedMerge ? getMergePreview(selectedMerge) : []}
      >
        {selectedMerge && (
          <div className="space-y-4">
            {/* Before/After Summary */}
            <div className="p-4 rounded-lg border bg-muted/20 space-y-3">
              <div className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Before vs After Merge</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Entitlements</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-lg font-bold text-muted-foreground line-through">{Math.round(selectedMerge.overlap * 0.5 + 20)}</span>
                    <ArrowRight className="h-3 w-3 text-primary" />
                    <span className="text-lg font-bold text-success">{Math.round(selectedMerge.overlap * 0.25 + 15)}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Users</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-lg font-bold text-muted-foreground">{selectedMerge.affectedUsers}</span>
                    <ArrowRight className="h-3 w-3 text-primary" />
                    <span className="text-lg font-bold">{selectedMerge.affectedUsers}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Risk Score</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-lg font-bold text-muted-foreground">{selectedMerge.riskImpact === 'High' ? 78 : selectedMerge.riskImpact === 'Medium' ? 52 : 28}</span>
                    <ArrowRight className="h-3 w-3 text-primary" />
                    <span className="text-lg font-bold text-success">{selectedMerge.riskImpact === 'High' ? 62 : selectedMerge.riskImpact === 'Medium' ? 40 : 22}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* User Membership */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">User Membership</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="border rounded-lg p-3 space-y-2">
                  <Badge variant="secondary" className="text-xs">{selectedMerge.sourceA}</Badge>
                  {mergeUsersA.map((u, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span>{u.name}</span>
                      <span className="text-muted-foreground">{u.department}</span>
                    </div>
                  ))}
                </div>
                <div className="border rounded-lg p-3 space-y-2">
                  <Badge variant="secondary" className="text-xs">{selectedMerge.sourceB}</Badge>
                  {mergeUsersB.map((u, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span>{u.name}</span>
                      <span className="text-muted-foreground">{u.department}</span>
                    </div>
                  ))}
                </div>
              </div>
              {(() => {
                const shared = mergeUsersA.filter(a => mergeUsersB.some(b => b.name === a.name));
                if (shared.length === 0) return null;
                return (
                  <div className="p-2 rounded-md bg-primary/5 border border-primary/20 text-xs">
                    <span className="font-medium text-primary">Shared users ({shared.length}):</span>{' '}
                    <span className="text-muted-foreground">{shared.map(u => u.name).join(', ')}</span>
                  </div>
                );
              })()}
            </div>

            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground pt-1">
              <Layers className="h-3.5 w-3.5" />
              Merge Breakdown
            </div>
          </div>
        )}
      </AccessAnalysisDrilldownDrawer>

      {/* Redundancy Analysis Drawer — enriched */}
      <AccessAnalysisDrilldownDrawer
        open={!!selectedRedundancy}
        onOpenChange={(open) => !open && setSelectedRedundancy(null)}
        title={selectedRedundancy ? `Consolidation: ${selectedRedundancy.roleA} ↔ ${selectedRedundancy.roleB}` : ''}
        description={selectedRedundancy ? `Comprehensive redundancy analysis with user comparison and governance assessment` : ''}
        metric={selectedRedundancy ? { value: `${selectedRedundancy.overlap}%` } : undefined}
        columns={[
          { key: 'entitlement', label: 'Entitlement' },
          { key: 'application', label: 'Application' },
          { key: 'inRoleA', label: selectedRedundancy?.roleA || 'Role A', render: (v) => v ? <CheckCircle2 className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-muted-foreground/40" /> },
          { key: 'inRoleB', label: selectedRedundancy?.roleB || 'Role B', render: (v) => v ? <CheckCircle2 className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-muted-foreground/40" /> },
          { key: 'risk', label: 'Risk', render: (v) => getRiskBadge(v) },
          { key: 'recommendation', label: 'Recommendation' },
        ]}
        data={selectedRedundancy ? getRedundancyAnalysis(selectedRedundancy) : []}
      >
        {selectedRedundancy && redundancyAssessment && (
          <div className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg border bg-muted/30 space-y-1">
                <span className="text-xs font-medium text-muted-foreground">Overlap</span>
                <p className="text-2xl font-bold">{selectedRedundancy.overlap}%</p>
                <p className="text-xs text-muted-foreground">{selectedRedundancy.entitlements} shared entitlements</p>
              </div>
              <div className="p-3 rounded-lg border bg-muted/30 space-y-1">
                <span className="text-xs font-medium text-muted-foreground">Risk Level</span>
                <div className="pt-1">{getRiskBadge(redundancyAssessment.riskLevel)}</div>
              </div>
              <div className="p-3 rounded-lg border bg-muted/30 space-y-1">
                <span className="text-xs font-medium text-muted-foreground">Savings Potential</span>
                <p className="text-2xl font-bold">{redundancyAssessment.estimatedSavings}%</p>
                <p className="text-xs text-muted-foreground">{selectedRedundancy.users} affected users</p>
              </div>
            </div>

            {/* User Comparison */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">User Comparison</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="border rounded-lg p-3 space-y-2">
                  <Badge variant="secondary" className="text-xs">{selectedRedundancy.roleA}</Badge>
                  {getRoleUsersForConsolidation(selectedRedundancy.roleA).map((u, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span>{u.name}</span>
                      <Badge variant={u.riskScore >= 40 ? 'destructive' : 'secondary'} className="text-xs">{u.riskScore}</Badge>
                    </div>
                  ))}
                </div>
                <div className="border rounded-lg p-3 space-y-2">
                  <Badge variant="secondary" className="text-xs">{selectedRedundancy.roleB}</Badge>
                  {getRoleUsersForConsolidation(selectedRedundancy.roleB).map((u, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span>{u.name}</span>
                      <Badge variant={u.riskScore >= 40 ? 'destructive' : 'secondary'} className="text-xs">{u.riskScore}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Assessment */}
            <div className="p-4 rounded-lg border bg-muted/20 space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">AI Consolidation Recommendation</span>
              </div>
              <p className="text-xs text-muted-foreground">{redundancyAssessment.recommendation}</p>
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground">Governance:</span> {redundancyAssessment.governanceNotes}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground pt-1">
              <Layers className="h-3.5 w-3.5" />
              Entitlement Analysis
            </div>
          </div>
        )}
      </AccessAnalysisDrilldownDrawer>
    </div>
  );
};
