
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Key, RefreshCw, UserCog, Lock, UserX, History, Eye, Waypoints, Download, Sparkles, Network } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import NhiOverviewTab from './detail-tabs/NhiOverviewTab';
import NhiAccountsTab from './detail-tabs/NhiAccountsTab';
import NhiAccessTab from './detail-tabs/NhiAccessTab';
import NhiRelationshipsTab from './detail-tabs/NhiRelationshipsTab';
import NhiExplorerTab from './detail-tabs/NhiExplorerTab';
import NhiRiskTab from './detail-tabs/NhiRiskTab';
import NhiActivityTab from './detail-tabs/NhiActivityTab';
import NhiPolicyTab from './detail-tabs/NhiPolicyTab';
import NonHumanAIAnalysisTab from './detail-tabs/NonHumanAIAnalysisTab';

const statusColors: Record<string, string> = {
  Active: "bg-green-100 text-green-800 border-green-200",
  Inactive: "bg-slate-100 text-slate-800 border-slate-200",
  Dormant: "bg-orange-100 text-orange-800 border-orange-200",
  Suspended: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Expired: "bg-red-100 text-red-800 border-red-200",
};

type IdentityDetailPanelProps = {
  identity: any;
  onClose: () => void;
};

export function IdentityDetailPanel({ identity, onClose }: IdentityDetailPanelProps) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="h-full bg-white">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className=" border-border">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-foreground">{identity.name}</h2>
                <Badge className={cn("text-xs font-bold", statusColors[identity.status] || statusColors.Active)}>{identity.status || 'Active'}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{identity.type} • {identity.provider}</p>
              {identity.owner && <p className="text-sm text-muted-foreground">Owner: {identity.owner}</p>}
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}><X className="h-5 w-5" /></Button>
          </div>
          {/* <div className="flex items-center gap-2 mt-4 flex-wrap">
            {identity.riskLevel === 'High' && <Badge variant="outline" className="text-red-600 border-red-300"><Key className="mr-1.5 h-3 w-3" />High Risk</Badge>}
            {identity.rotationStatus === 'Overdue' && <Badge variant="outline" className="text-orange-600 border-orange-300"><RefreshCw className="mr-1.5 h-3 w-3" />Rotation Overdue</Badge>}
            {identity.daysUnused > 30 && <Badge variant="outline" className="text-yellow-600 border-yellow-300"><UserX className="mr-1.5 h-3 w-3" />Dormant</Badge>}
          </div> */}
          <div className="pt-4 flex gap-2 flex-wrap">
            <Button size="sm"><RefreshCw className="w-4 h-4 mr-2" />Rotate Credentials</Button>
            <Button size="sm" variant="secondary"><UserCog className="w-4 h-4 mr-2" />Reassign Owner</Button>
            <Button size="sm" variant="outline"><Lock className="w-4 h-4 mr-2" />Quarantine</Button>
            <Button size="sm" variant="destructive"><UserX className="w-4 h-4 mr-2" />Terminate</Button>
          </div>
          <div className="pt-4 border-border flex gap-2 flex-wrap">
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
        <div className="flex-1 overflow-y-auto bg-muted/30 pt-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-9">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="accounts">Accounts</TabsTrigger>
              <TabsTrigger value="access">Access</TabsTrigger>
              <TabsTrigger value="relationships">Relationships</TabsTrigger>
              <TabsTrigger value="explorer">Explorer</TabsTrigger>
              <TabsTrigger value="risk">Risk</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="policy">Policy</TabsTrigger>
              <TabsTrigger value="ai-analysis">AI Analysis</TabsTrigger>
            </TabsList>
            <TabsContent value="overview"><NhiOverviewTab identity={identity} /></TabsContent>
            <TabsContent value="accounts"><NhiAccountsTab identity={identity} /></TabsContent>
            <TabsContent value="access"><NhiAccessTab identity={identity} /></TabsContent>
            <TabsContent value="relationships"><NhiRelationshipsTab identity={identity} /></TabsContent>
            <TabsContent value="explorer"><NhiExplorerTab identity={identity} /></TabsContent>
            <TabsContent value="risk"><NhiRiskTab identity={identity} /></TabsContent>
            <TabsContent value="activity"><NhiActivityTab identity={identity} /></TabsContent>
            <TabsContent value="policy"><NhiPolicyTab identity={identity} /></TabsContent>
            <TabsContent value="ai-analysis"><NonHumanAIAnalysisTab identity={identity} /></TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
