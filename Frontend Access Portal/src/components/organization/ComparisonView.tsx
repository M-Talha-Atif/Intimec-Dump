import { useState, useMemo, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { compareOrgTrees } from '@/utils/orgComparison';
import { loadSnapshots } from '@/utils/snapshotManager';
import { MetricCard } from './comparison/MetricCard';
import { SnapshotManager } from './comparison/SnapshotManager';
import { AccessPatternComparison } from './comparison/AccessPatternComparison';
import { RiskComparison } from './comparison/RiskComparison';
import { ComplianceComparison } from './comparison/ComplianceComparison';
import {  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Download, TrendingUp, TrendingDown, Clock, GitCompare } from 'lucide-react';
import { OrgNodeData } from '@/types/organization';
import { HistoricalSnapshot, historicalSnapshots } from '@/data/mock-historical-snapshots';

interface ComparisonViewProps {
  currentTree: OrgNodeData;
  historicalTrees?: Array<{ date: string; data: OrgNodeData; label: string }>;
  selectedUnits?: OrgNodeData[];
}

export function ComparisonView({ currentTree, historicalTrees = [], selectedUnits = [] }: ComparisonViewProps) {
  const [comparisonMode, setComparisonMode] = useState<'temporal' | 'multi-unit'>('multi-unit');
  const [selectedHistorical, setSelectedHistorical] = useState<string>('');
  const [allSnapshots, setAllSnapshots] = useState<HistoricalSnapshot[]>([]);

  useEffect(() => {
    const userSnapshots = loadSnapshots();
    setAllSnapshots([...historicalSnapshots, ...userSnapshots]);
  }, []);

  const refreshSnapshots = () => {
    const userSnapshots = loadSnapshots();
    setAllSnapshots([...historicalSnapshots, ...userSnapshots]);
  };
  
  const temporalDiff = useMemo(() => {
    if (!selectedHistorical || !allSnapshots.length) return [];
    const historicalTree = allSnapshots.find(h => h.date === selectedHistorical);
    if (!historicalTree) return [];
    return compareOrgTrees(historicalTree.data, currentTree);
  }, [selectedHistorical, allSnapshots, currentTree]);
  

  const trendData = useMemo(() => {
    if (!selectedHistorical || !allSnapshots.length) return [];
    const historicalTree = allSnapshots.find(h => h.date === selectedHistorical);
    if (!historicalTree) return [];
    return [
      { period: 'Historical', users: historicalTree.data.userCount, roles: historicalTree.data.roleCount, riskScore: historicalTree.data.riskScore || 0, healthScore: historicalTree.data.healthScore || 0 },
      { period: 'Current', users: currentTree.userCount, roles: currentTree.roleCount, riskScore: currentTree.riskScore || 0, healthScore: currentTree.healthScore || 0 },
    ];
  }, [selectedHistorical, allSnapshots, currentTree]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Organizational Comparison</h2>
        <p className="text-muted-foreground">Compare organizational units or track changes over time with comprehensive IGA metrics</p>
      </div>

      <Tabs value={comparisonMode} onValueChange={(v) => setComparisonMode(v as any)}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="multi-unit"><GitCompare className="w-4 h-4 mr-2" />Multi-Unit Comparison</TabsTrigger>
          <TabsTrigger value="temporal"><Clock className="w-4 h-4 mr-2" />Point-in-Time Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="multi-unit" className="space-y-6">
          {selectedUnits.length < 2 ? (
            <Card className="p-12"><div className="text-center text-muted-foreground space-y-3"><GitCompare className="w-12 h-12 mx-auto opacity-50" /><p className="text-lg font-medium">Select units to compare</p><p className="text-sm">Select at least 2 organizational units from Tree View or Graph View to begin comparison.</p></div></Card>
          ) : (
            <>
              <Card className="p-4"><div className="flex items-center justify-between"><div><h3 className="text-lg font-semibold">Selected Units ({selectedUnits.length})</h3><p className="text-sm text-muted-foreground">Comparing key IGA metrics across organizational units</p></div><Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />Export Report</Button></div><div className="flex flex-wrap gap-2 mt-4">{selectedUnits.map(unit => (<Badge key={unit.id} variant="secondary" className="text-sm py-1 px-3">{unit.name} • {unit.userCount} users</Badge>))}</div></Card>
              <div><h3 className="text-lg font-semibold mb-4">Core Metrics Comparison</h3><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">{selectedUnits.map(unit => (<div key={unit.id}><h4 className="text-sm font-medium mb-3 text-muted-foreground">{unit.name}</h4><div className="space-y-2"><MetricCard title="Users" value={unit.userCount} format="number" /><MetricCard title="Roles" value={unit.roleCount} format="number" /><MetricCard title="Risk Score" value={unit.riskScore || 0} format="number" severity={(unit.riskScore || 0) >= 70 ? 'critical' : (unit.riskScore || 0) >= 50 ? 'high' : (unit.riskScore || 0) >= 30 ? 'medium' : 'low'} /><MetricCard title="Health Score" value={unit.healthScore || 0} format="number" severity={(unit.healthScore || 0) >= 80 ? 'low' : (unit.healthScore || 0) >= 60 ? 'medium' : 'high'} /></div></div>))}</div></div>
              <RiskComparison units={selectedUnits} />
              <ComplianceComparison units={selectedUnits} />
              <AccessPatternComparison units={selectedUnits} />
            </>
          )}
        </TabsContent>

        <TabsContent value="temporal" className="space-y-6">
          <SnapshotManager currentData={currentTree} snapshots={allSnapshots} onSnapshotCreated={refreshSnapshots} />
          {allSnapshots.length === 0 ? (
            <Card className="p-12"><div className="text-center text-muted-foreground space-y-3"><Clock className="w-12 h-12 mx-auto opacity-50" /><p className="text-lg font-medium">No snapshots available</p><p className="text-sm">Create a snapshot to track organizational changes over time.</p></div></Card>
          ) : (
            <>
              <Card className="p-4"><h3 className="text-lg font-semibold mb-3">Select Historical Snapshot</h3><div className="flex gap-4 items-end"><div className="flex-1"><Select value={selectedHistorical} onValueChange={setSelectedHistorical}><SelectTrigger><SelectValue placeholder="Choose a snapshot to compare with current state..." /></SelectTrigger><SelectContent>{allSnapshots.map((snapshot) => (<SelectItem key={snapshot.date} value={snapshot.date}>{new Date(snapshot.date).toLocaleDateString()} - {snapshot.label}</SelectItem>))}</SelectContent></Select></div>{selectedHistorical && (<Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />Export Comparison</Button>)}</div></Card>
              {selectedHistorical && (
                <>
                  <Card className="p-6"><h3 className="text-lg font-semibold mb-4">Metric Trends</h3><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"><MetricCard title="Users" value={currentTree.userCount} previousValue={allSnapshots.find(s => s.date === selectedHistorical)?.data.userCount} format="number" /><MetricCard title="Roles" value={currentTree.roleCount} previousValue={allSnapshots.find(s => s.date === selectedHistorical)?.data.roleCount} format="number" /><MetricCard title="Risk Score" value={currentTree.riskScore || 0} previousValue={allSnapshots.find(s => s.date === selectedHistorical)?.data.riskScore} format="number" severity={(currentTree.riskScore || 0) >= 70 ? 'critical' : (currentTree.riskScore || 0) >= 50 ? 'high' : (currentTree.riskScore || 0) >= 30 ? 'medium' : 'low'} /><MetricCard title="Health Score" value={currentTree.healthScore || 0} previousValue={allSnapshots.find(s => s.date === selectedHistorical)?.data.healthScore} format="number" severity={(currentTree.healthScore || 0) >= 80 ? 'low' : (currentTree.healthScore || 0) >= 60 ? 'medium' : 'high'} /></div><ResponsiveContainer width="100%" height={300}><LineChart data={trendData}><CartesianGrid strokeDasharray="3 3" className="stroke-muted" /><XAxis dataKey="period" /><YAxis /><Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '6px' }} /><Legend /><Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" name="Users" strokeWidth={2} /><Line type="monotone" dataKey="riskScore" stroke="hsl(var(--destructive))" name="Risk Score" strokeWidth={2} /></LineChart></ResponsiveContainer></Card>
                  <Card className="p-6"><h3 className="text-lg font-semibold mb-4">Change Summary</h3><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[{type:'added',icon:TrendingUp,color:'success'},{type:'removed',icon:TrendingDown,color:'destructive'},{type:'modified',icon:null,color:'primary'},{type:'moved',icon:null,color:'secondary'}].map(({type,icon:Icon,color})=>(<Card key={type} className={`p-4 border-l-4 border-l-${color}`}><div className="flex items-center justify-between"><div><div className="text-3xl font-bold">{temporalDiff.filter(d => d.type === type).length}</div><div className="text-sm text-muted-foreground mt-1 capitalize">{type}</div></div>{Icon && <Icon className={`w-8 h-8 text-${color} opacity-50`} />}</div></Card>))}</div></Card>
                </>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
