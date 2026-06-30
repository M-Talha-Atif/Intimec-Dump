
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Calendar, UserCog, UserX, History, Eye, Waypoints, Download, Sparkles, Network, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { NonEmployeeOverviewTab } from './detail-tabs/NonEmployeeOverviewTab';
import { NonEmployeeAccountsTab } from './detail-tabs/NonEmployeeAccountsTab';
import { NonEmployeeAccessTab } from './detail-tabs/NonEmployeeAccessTab';
import { NonEmployeeRelationshipsTab } from './detail-tabs/NonEmployeeRelationshipsTab';
import { NonEmployeeExplorerTab } from './detail-tabs/NonEmployeeExplorerTab';
import { NonEmployeeRiskTab } from './detail-tabs/NonEmployeeRiskTab';
import { NonEmployeeActivityTab } from './detail-tabs/NonEmployeeActivityTab';
import { NonEmployeePolicyTab } from './detail-tabs/NonEmployeePolicyTab';
import { NonEmployeeAIAnalysisTab } from './detail-tabs/NonEmployeeAIAnalysisTab';

const statusColors: Record<string, string> = {
  Active: "bg-green-100 text-green-800 border-green-200",
  'Expiring Soon': "bg-orange-100 text-orange-800 border-orange-200",
  Expired: "bg-red-100 text-red-800 border-red-200",
  Suspended: "bg-slate-100 text-slate-800 border-slate-200",
};

type NonEmployeeDetailPanelProps = {
  nonEmployee: any;
  onClose: () => void;
};

export function NonEmployeeDetailPanel({ nonEmployee, onClose }: NonEmployeeDetailPanelProps) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="h-full">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-foreground">{nonEmployee.name}</h2>
                <Badge className={cn("text-xs font-bold", statusColors[nonEmployee.status] || statusColors.Active)}>{nonEmployee.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{nonEmployee.type} • {nonEmployee.department}</p>
              {nonEmployee.sponsor && <p className="text-sm text-muted-foreground">Sponsor: {nonEmployee.sponsor}</p>}
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}><X className="h-5 w-5" /></Button>
          </div>
          {/* <div className="flex items-center gap-2 pt-4 flex-wrap">
            {nonEmployee.riskLevel === 'High' && <Badge variant="outline" className="text-red-600 border-red-300">High Risk</Badge>}
            {nonEmployee.daysToExpiry <= 30 && <Badge variant="outline" className="text-orange-600 border-orange-300"><Clock className="mr-1.5 h-3 w-3" />{nonEmployee.daysToExpiry} days left</Badge>}
          </div> */}
          <div className="pt-4 flex gap-2 flex-wrap">
            <Button size="sm"><Calendar className="w-4 h-4 mr-2" />Extend Contract</Button>
            <Button size="sm" variant="secondary"><UserCog className="w-4 h-4 mr-2" />Reassign Sponsor</Button>
            <Button size="sm" variant="outline"><Clock className="w-4 h-4 mr-2" />Suspend</Button>
            <Button size="sm" variant="destructive"><UserX className="w-4 h-4 mr-2" />Terminate Access</Button>
          </div>
          <div className="mt-4 border-border flex gap-2 flex-wrap">
            <Button size="sm" variant="outline" onClick={() => setActiveTab('activity')}><History className="w-4 h-4 mr-2" />View Change Log</Button>
            <Button size="sm" variant="outline"><Eye className="w-4 h-4 mr-2" />Audit Visibility</Button>
            <Button size="sm" variant="outline" onClick={() => setActiveTab('explorer')}><Waypoints className="w-4 h-4 mr-2" />Access Explorer</Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button size="sm" variant="outline"><Download className="w-4 h-4 mr-2" />Export</Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Export as JSON</DropdownMenuItem>
                <DropdownMenuItem>Export as XML</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex-1 overflow-y-auto mt-4 bg-muted/30">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-9">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="accounts">Accounts</TabsTrigger>
              <TabsTrigger value="access">Access</TabsTrigger>
              <TabsTrigger value="relationships" className="flex items-center space-x-1">Relationships</TabsTrigger>
              <TabsTrigger value="explorer">Explorer</TabsTrigger>
              <TabsTrigger value="risk">Risk</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="policy">Policy</TabsTrigger>
              <TabsTrigger value="ai-analysis" className="flex items-center space-x-1">AI Analysis</TabsTrigger>
            </TabsList>
            <TabsContent value="overview"><NonEmployeeOverviewTab nonEmployee={nonEmployee} /></TabsContent>
            <TabsContent value="accounts"><NonEmployeeAccountsTab nonEmployee={nonEmployee} /></TabsContent>
            <TabsContent value="access"><NonEmployeeAccessTab nonEmployee={nonEmployee} /></TabsContent>
            <TabsContent value="relationships"><NonEmployeeRelationshipsTab nonEmployee={nonEmployee} /></TabsContent>
            <TabsContent value="explorer"><NonEmployeeExplorerTab nonEmployee={nonEmployee} /></TabsContent>
            <TabsContent value="risk"><NonEmployeeRiskTab nonEmployee={nonEmployee} /></TabsContent>
            <TabsContent value="activity"><NonEmployeeActivityTab nonEmployee={nonEmployee} /></TabsContent>
            <TabsContent value="policy"><NonEmployeePolicyTab nonEmployee={nonEmployee} /></TabsContent>
            <TabsContent value="ai-analysis"><NonEmployeeAIAnalysisTab nonEmployee={nonEmployee} /></TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
