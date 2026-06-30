
import React, { useState } from 'react';
import { Application } from '@/data/mock-applications';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, CheckCircle, AlertTriangle, XCircle, Minimize2, Maximize2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import ApplicationOverviewTab from './ApplicationOverviewTab';
import ApplicationAccountsTab from './ApplicationAccountsTab';
import ApplicationEntitlementsTab from './ApplicationEntitlementsTab';
import ApplicationAccessMatrixTab from './ApplicationAccessMatrixTab';
import ApplicationAIAnalysisTab from './ApplicationAIAnalysisTab';

type ApplicationDetailPanelProps = {
  application: Application;
  onClose: () => void;
};

const statusConfig = {
  Connected: {
    icon: <CheckCircle className="mr-1.5 h-3 w-3 text-green-600" />,
    className: "border-green-200 bg-green-100 text-green-800",
  },
  'Connection Problem': {
    icon: <AlertTriangle className="mr-1.5 h-3 w-3 text-yellow-600" />,
    className: "border-yellow-200 bg-yellow-100 text-yellow-800",
  },
  Offline: {
    icon: <XCircle className="mr-1.5 h-3 w-3 text-red-600" />,
    className: "border-red-200 bg-red-100 text-red-800",
  },
};

const ApplicationDetailPanel = ({ application, onClose }: ApplicationDetailPanelProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isMinimized, setIsMinimized] = useState(false);
  const statusInfo = statusConfig[application.status];

  return (
    <div className="h-full  if (
import React, { useState } from 'react';
import { Application } from '@/data/mock-applications';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, CheckCircle, AlertTriangle, XCircle, Minimize2, Maximize2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import ApplicationOverviewTab from './ApplicationOverviewTab';
import ApplicationAccountsTab from './ApplicationAccountsTab';
import ApplicationEntitlementsTab from './ApplicationEntitlementsTab';
import ApplicationAccessMatrixTab from './ApplicationAccessMatrixTab';
import ApplicationAIAnalysisTab from './ApplicationAIAnalysisTab';

type ApplicationDetailPanelProps = {
  application: Application;
  onClose: () => void;
};

const statusConfig = {
  Connected: {
    icon: <CheckCircle className="mr-1.5 h-3 w-3 text-green-600" />,
    className: "border-green-200 bg-green-100 text-green-800",
  },
  'Connection Problem': {
    icon: <AlertTriangle className="mr-1.5 h-3 w-3 text-yellow-600" />,
    className: "border-yellow-200 bg-yellow-100 text-yellow-800",
  },
  Offline: {
    icon: <XCircle className="mr-1.5 h-3 w-3 text-red-600" />,
    className: "border-red-200 bg-red-100 text-red-800",
  },
};

const ApplicationDetailPanel = ({ application, onClose }: ApplicationDetailPanelProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isMinimized, setIsMinimized] = useState(false);
  const statusInfo = statusConfig[application.status];

  return (
    <div className="h-full bg-background border-l-2 border-border flex flex-col overflow-hidden shadow-2xl">
      {/* Sticky Panel Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border flex-shrink-0">
        <div className="p-4 lg:p-6">
          <div className="flex justify-between items-start">
            <div className="min-w-0 flex-1 pr-4">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl lg:text-2xl font-bold text-muted-foreground truncate">{application.name}</h2>
                <Badge className={cn("text-xs font-semibold flex items-center flex-shrink-0", statusInfo.className)}>
                  {statusInfo.icon}
                  {application.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {application.category} • Owner: {application.source === 'authoritative' ? 'IT' : 'Business'}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-8 w-8"
                title={isMinimized ? "Expand panel" : "Minimize panel"}
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Quick metadata badges */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {application.source === 'authoritative' && (
              <Badge variant="outline" className="text-blue-600 border-blue-300 text-xs">
                Authoritative Source
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {application.orphanCount} Orphan Accounts
            </Badge>
            {application.riskyCount > 0 && (
              <Badge variant="outline" className="text-orange-600 border-orange-300 text-xs">
                {application.riskyCount} Risky Accounts
              </Badge>
            )}
          </div>
        </div>
      </div>
      
      {/* Panel Content */}
      {!isMinimized && (
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="px-4 lg:px-6 pt-2 flex-shrink-0">
              <TabsList className="grid w-full grid-cols-5 h-9">
                <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
                <TabsTrigger value="accounts" className="text-xs">Accounts</TabsTrigger>
                <TabsTrigger value="entitlements" className="text-xs">Entitlements</TabsTrigger>
                <TabsTrigger value="access-matrix" className="text-xs">Access Matrix</TabsTrigger>
                <TabsTrigger value="ai-analysis" className="text-xs flex items-center space-x-1">
                  <Sparkles className="h-3 w-3" />
                  <span>AI Analysis</span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            <ScrollArea className="flex-1 px-4 lg:px-6 pb-6">
              <div className="pt-4">
                <TabsContent value="overview" className="mt-0">
                  <ApplicationOverviewTab application={application} />
                </TabsContent>
                <TabsContent value="accounts" className="mt-0">
                   <ApplicationAccountsTab application={application} />
                </TabsContent>
                <TabsContent value="entitlements" className="mt-0">
                   <ApplicationEntitlementsTab application={application} />
                </TabsContent>
                <TabsContent value="access-matrix" className="mt-0">
                   <ApplicationAccessMatrixTab application={application} />
                </TabsContent>
                <TabsContent value="ai-analysis" className="mt-0">
                   <ApplicationAIAnalysisTab application={application} />
                </TabsContent>
              </div>
            </ScrollArea>
          </Tabs>
        </div>
      )}

      {/* Minimized state - show only key info */}
      {isMinimized && (
        <div className="p-4 border-t border-border">
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Quick Stats</div>
            <div className="grid grid-cols-1 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium">{application.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Accounts</span>
                <span className="font-medium">{application.orphanCount}</span>
              </div>
              {application.riskyCount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Risky</span>
                  <span className="font-medium text-orange-600">{application.riskyCount}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationDetailPanel;
.Value -match '/') { 'bg-background/' + 
import React, { useState } from 'react';
import { Application } from '@/data/mock-applications';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, CheckCircle, AlertTriangle, XCircle, Minimize2, Maximize2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import ApplicationOverviewTab from './ApplicationOverviewTab';
import ApplicationAccountsTab from './ApplicationAccountsTab';
import ApplicationEntitlementsTab from './ApplicationEntitlementsTab';
import ApplicationAccessMatrixTab from './ApplicationAccessMatrixTab';
import ApplicationAIAnalysisTab from './ApplicationAIAnalysisTab';

type ApplicationDetailPanelProps = {
  application: Application;
  onClose: () => void;
};

const statusConfig = {
  Connected: {
    icon: <CheckCircle className="mr-1.5 h-3 w-3 text-green-600" />,
    className: "border-green-200 bg-green-100 text-green-800",
  },
  'Connection Problem': {
    icon: <AlertTriangle className="mr-1.5 h-3 w-3 text-yellow-600" />,
    className: "border-yellow-200 bg-yellow-100 text-yellow-800",
  },
  Offline: {
    icon: <XCircle className="mr-1.5 h-3 w-3 text-red-600" />,
    className: "border-red-200 bg-red-100 text-red-800",
  },
};

const ApplicationDetailPanel = ({ application, onClose }: ApplicationDetailPanelProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isMinimized, setIsMinimized] = useState(false);
  const statusInfo = statusConfig[application.status];

  return (
    <div className="h-full bg-background border-l-2 border-border flex flex-col overflow-hidden shadow-2xl">
      {/* Sticky Panel Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border flex-shrink-0">
        <div className="p-4 lg:p-6">
          <div className="flex justify-between items-start">
            <div className="min-w-0 flex-1 pr-4">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl lg:text-2xl font-bold text-muted-foreground truncate">{application.name}</h2>
                <Badge className={cn("text-xs font-semibold flex items-center flex-shrink-0", statusInfo.className)}>
                  {statusInfo.icon}
                  {application.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {application.category} • Owner: {application.source === 'authoritative' ? 'IT' : 'Business'}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-8 w-8"
                title={isMinimized ? "Expand panel" : "Minimize panel"}
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Quick metadata badges */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {application.source === 'authoritative' && (
              <Badge variant="outline" className="text-blue-600 border-blue-300 text-xs">
                Authoritative Source
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {application.orphanCount} Orphan Accounts
            </Badge>
            {application.riskyCount > 0 && (
              <Badge variant="outline" className="text-orange-600 border-orange-300 text-xs">
                {application.riskyCount} Risky Accounts
              </Badge>
            )}
          </div>
        </div>
      </div>
      
      {/* Panel Content */}
      {!isMinimized && (
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="px-4 lg:px-6 pt-2 flex-shrink-0">
              <TabsList className="grid w-full grid-cols-5 h-9">
                <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
                <TabsTrigger value="accounts" className="text-xs">Accounts</TabsTrigger>
                <TabsTrigger value="entitlements" className="text-xs">Entitlements</TabsTrigger>
                <TabsTrigger value="access-matrix" className="text-xs">Access Matrix</TabsTrigger>
                <TabsTrigger value="ai-analysis" className="text-xs flex items-center space-x-1">
                  <Sparkles className="h-3 w-3" />
                  <span>AI Analysis</span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            <ScrollArea className="flex-1 px-4 lg:px-6 pb-6">
              <div className="pt-4">
                <TabsContent value="overview" className="mt-0">
                  <ApplicationOverviewTab application={application} />
                </TabsContent>
                <TabsContent value="accounts" className="mt-0">
                   <ApplicationAccountsTab application={application} />
                </TabsContent>
                <TabsContent value="entitlements" className="mt-0">
                   <ApplicationEntitlementsTab application={application} />
                </TabsContent>
                <TabsContent value="access-matrix" className="mt-0">
                   <ApplicationAccessMatrixTab application={application} />
                </TabsContent>
                <TabsContent value="ai-analysis" className="mt-0">
                   <ApplicationAIAnalysisTab application={application} />
                </TabsContent>
              </div>
            </ScrollArea>
          </Tabs>
        </div>
      )}

      {/* Minimized state - show only key info */}
      {isMinimized && (
        <div className="p-4 border-t border-border">
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Quick Stats</div>
            <div className="grid grid-cols-1 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium">{application.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Accounts</span>
                <span className="font-medium">{application.orphanCount}</span>
              </div>
              {application.riskyCount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Risky</span>
                  <span className="font-medium text-orange-600">{application.riskyCount}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationDetailPanel;
.Value.Split('/')[-1] } else { 'bg-background' }  border-l-2 border-border flex flex-col overflow-hidden shadow-2xl">
      {/* Sticky Panel Header */}
      <div className="sticky top-0 z-20  if (
import React, { useState } from 'react';
import { Application } from '@/data/mock-applications';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, CheckCircle, AlertTriangle, XCircle, Minimize2, Maximize2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import ApplicationOverviewTab from './ApplicationOverviewTab';
import ApplicationAccountsTab from './ApplicationAccountsTab';
import ApplicationEntitlementsTab from './ApplicationEntitlementsTab';
import ApplicationAccessMatrixTab from './ApplicationAccessMatrixTab';
import ApplicationAIAnalysisTab from './ApplicationAIAnalysisTab';

type ApplicationDetailPanelProps = {
  application: Application;
  onClose: () => void;
};

const statusConfig = {
  Connected: {
    icon: <CheckCircle className="mr-1.5 h-3 w-3 text-green-600" />,
    className: "border-green-200 bg-green-100 text-green-800",
  },
  'Connection Problem': {
    icon: <AlertTriangle className="mr-1.5 h-3 w-3 text-yellow-600" />,
    className: "border-yellow-200 bg-yellow-100 text-yellow-800",
  },
  Offline: {
    icon: <XCircle className="mr-1.5 h-3 w-3 text-red-600" />,
    className: "border-red-200 bg-red-100 text-red-800",
  },
};

const ApplicationDetailPanel = ({ application, onClose }: ApplicationDetailPanelProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isMinimized, setIsMinimized] = useState(false);
  const statusInfo = statusConfig[application.status];

  return (
    <div className="h-full bg-background border-l-2 border-border flex flex-col overflow-hidden shadow-2xl">
      {/* Sticky Panel Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border flex-shrink-0">
        <div className="p-4 lg:p-6">
          <div className="flex justify-between items-start">
            <div className="min-w-0 flex-1 pr-4">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl lg:text-2xl font-bold text-muted-foreground truncate">{application.name}</h2>
                <Badge className={cn("text-xs font-semibold flex items-center flex-shrink-0", statusInfo.className)}>
                  {statusInfo.icon}
                  {application.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {application.category} • Owner: {application.source === 'authoritative' ? 'IT' : 'Business'}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-8 w-8"
                title={isMinimized ? "Expand panel" : "Minimize panel"}
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Quick metadata badges */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {application.source === 'authoritative' && (
              <Badge variant="outline" className="text-blue-600 border-blue-300 text-xs">
                Authoritative Source
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {application.orphanCount} Orphan Accounts
            </Badge>
            {application.riskyCount > 0 && (
              <Badge variant="outline" className="text-orange-600 border-orange-300 text-xs">
                {application.riskyCount} Risky Accounts
              </Badge>
            )}
          </div>
        </div>
      </div>
      
      {/* Panel Content */}
      {!isMinimized && (
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="px-4 lg:px-6 pt-2 flex-shrink-0">
              <TabsList className="grid w-full grid-cols-5 h-9">
                <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
                <TabsTrigger value="accounts" className="text-xs">Accounts</TabsTrigger>
                <TabsTrigger value="entitlements" className="text-xs">Entitlements</TabsTrigger>
                <TabsTrigger value="access-matrix" className="text-xs">Access Matrix</TabsTrigger>
                <TabsTrigger value="ai-analysis" className="text-xs flex items-center space-x-1">
                  <Sparkles className="h-3 w-3" />
                  <span>AI Analysis</span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            <ScrollArea className="flex-1 px-4 lg:px-6 pb-6">
              <div className="pt-4">
                <TabsContent value="overview" className="mt-0">
                  <ApplicationOverviewTab application={application} />
                </TabsContent>
                <TabsContent value="accounts" className="mt-0">
                   <ApplicationAccountsTab application={application} />
                </TabsContent>
                <TabsContent value="entitlements" className="mt-0">
                   <ApplicationEntitlementsTab application={application} />
                </TabsContent>
                <TabsContent value="access-matrix" className="mt-0">
                   <ApplicationAccessMatrixTab application={application} />
                </TabsContent>
                <TabsContent value="ai-analysis" className="mt-0">
                   <ApplicationAIAnalysisTab application={application} />
                </TabsContent>
              </div>
            </ScrollArea>
          </Tabs>
        </div>
      )}

      {/* Minimized state - show only key info */}
      {isMinimized && (
        <div className="p-4 border-t border-border">
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Quick Stats</div>
            <div className="grid grid-cols-1 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium">{application.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Accounts</span>
                <span className="font-medium">{application.orphanCount}</span>
              </div>
              {application.riskyCount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Risky</span>
                  <span className="font-medium text-orange-600">{application.riskyCount}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationDetailPanel;
.Value -match '/') { 'bg-background/' + 
import React, { useState } from 'react';
import { Application } from '@/data/mock-applications';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, CheckCircle, AlertTriangle, XCircle, Minimize2, Maximize2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import ApplicationOverviewTab from './ApplicationOverviewTab';
import ApplicationAccountsTab from './ApplicationAccountsTab';
import ApplicationEntitlementsTab from './ApplicationEntitlementsTab';
import ApplicationAccessMatrixTab from './ApplicationAccessMatrixTab';
import ApplicationAIAnalysisTab from './ApplicationAIAnalysisTab';

type ApplicationDetailPanelProps = {
  application: Application;
  onClose: () => void;
};

const statusConfig = {
  Connected: {
    icon: <CheckCircle className="mr-1.5 h-3 w-3 text-green-600" />,
    className: "border-green-200 bg-green-100 text-green-800",
  },
  'Connection Problem': {
    icon: <AlertTriangle className="mr-1.5 h-3 w-3 text-yellow-600" />,
    className: "border-yellow-200 bg-yellow-100 text-yellow-800",
  },
  Offline: {
    icon: <XCircle className="mr-1.5 h-3 w-3 text-red-600" />,
    className: "border-red-200 bg-red-100 text-red-800",
  },
};

const ApplicationDetailPanel = ({ application, onClose }: ApplicationDetailPanelProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isMinimized, setIsMinimized] = useState(false);
  const statusInfo = statusConfig[application.status];

  return (
    <div className="h-full bg-background border-l-2 border-border flex flex-col overflow-hidden shadow-2xl">
      {/* Sticky Panel Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border flex-shrink-0">
        <div className="p-4 lg:p-6">
          <div className="flex justify-between items-start">
            <div className="min-w-0 flex-1 pr-4">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl lg:text-2xl font-bold text-muted-foreground truncate">{application.name}</h2>
                <Badge className={cn("text-xs font-semibold flex items-center flex-shrink-0", statusInfo.className)}>
                  {statusInfo.icon}
                  {application.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {application.category} • Owner: {application.source === 'authoritative' ? 'IT' : 'Business'}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-8 w-8"
                title={isMinimized ? "Expand panel" : "Minimize panel"}
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Quick metadata badges */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {application.source === 'authoritative' && (
              <Badge variant="outline" className="text-blue-600 border-blue-300 text-xs">
                Authoritative Source
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {application.orphanCount} Orphan Accounts
            </Badge>
            {application.riskyCount > 0 && (
              <Badge variant="outline" className="text-orange-600 border-orange-300 text-xs">
                {application.riskyCount} Risky Accounts
              </Badge>
            )}
          </div>
        </div>
      </div>
      
      {/* Panel Content */}
      {!isMinimized && (
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="px-4 lg:px-6 pt-2 flex-shrink-0">
              <TabsList className="grid w-full grid-cols-5 h-9">
                <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
                <TabsTrigger value="accounts" className="text-xs">Accounts</TabsTrigger>
                <TabsTrigger value="entitlements" className="text-xs">Entitlements</TabsTrigger>
                <TabsTrigger value="access-matrix" className="text-xs">Access Matrix</TabsTrigger>
                <TabsTrigger value="ai-analysis" className="text-xs flex items-center space-x-1">
                  <Sparkles className="h-3 w-3" />
                  <span>AI Analysis</span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            <ScrollArea className="flex-1 px-4 lg:px-6 pb-6">
              <div className="pt-4">
                <TabsContent value="overview" className="mt-0">
                  <ApplicationOverviewTab application={application} />
                </TabsContent>
                <TabsContent value="accounts" className="mt-0">
                   <ApplicationAccountsTab application={application} />
                </TabsContent>
                <TabsContent value="entitlements" className="mt-0">
                   <ApplicationEntitlementsTab application={application} />
                </TabsContent>
                <TabsContent value="access-matrix" className="mt-0">
                   <ApplicationAccessMatrixTab application={application} />
                </TabsContent>
                <TabsContent value="ai-analysis" className="mt-0">
                   <ApplicationAIAnalysisTab application={application} />
                </TabsContent>
              </div>
            </ScrollArea>
          </Tabs>
        </div>
      )}

      {/* Minimized state - show only key info */}
      {isMinimized && (
        <div className="p-4 border-t border-border">
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Quick Stats</div>
            <div className="grid grid-cols-1 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium">{application.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Accounts</span>
                <span className="font-medium">{application.orphanCount}</span>
              </div>
              {application.riskyCount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Risky</span>
                  <span className="font-medium text-orange-600">{application.riskyCount}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationDetailPanel;
.Value.Split('/')[-1] } else { 'bg-background' }  backdrop-blur-sm border-b border-border flex-shrink-0">
        <div className="p-4 lg:p-6">
          <div className="flex justify-between items-start">
            <div className="min-w-0 flex-1 pr-4">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl lg:text-2xl font-bold text-muted-foreground truncate">{application.name}</h2>
                <Badge className={cn("text-xs font-semibold flex items-center flex-shrink-0", statusInfo.className)}>
                  {statusInfo.icon}
                  {application.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {application.category} • Owner: {application.source === 'authoritative' ? 'IT' : 'Business'}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-8 w-8"
                title={isMinimized ? "Expand panel" : "Minimize panel"}
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Quick metadata badges */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {application.source === 'authoritative' && (
              <Badge variant="outline" className="text-blue-600 border-blue-300 text-xs">
                Authoritative Source
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {application.orphanCount} Orphan Accounts
            </Badge>
            {application.riskyCount > 0 && (
              <Badge variant="outline" className="text-orange-600 border-orange-300 text-xs">
                {application.riskyCount} Risky Accounts
              </Badge>
            )}
          </div>
        </div>
      </div>
      
      {/* Panel Content */}
      {!isMinimized && (
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="px-4 lg:px-6 pt-2 flex-shrink-0">
              <TabsList className="grid w-full grid-cols-5 h-9">
                <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
                <TabsTrigger value="accounts" className="text-xs">Accounts</TabsTrigger>
                <TabsTrigger value="entitlements" className="text-xs">Entitlements</TabsTrigger>
                <TabsTrigger value="access-matrix" className="text-xs">Access Matrix</TabsTrigger>
                <TabsTrigger value="ai-analysis" className="text-xs flex items-center space-x-1">
                  <Sparkles className="h-3 w-3" />
                  <span>AI Analysis</span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            <ScrollArea className="flex-1 px-4 lg:px-6 pb-6">
              <div className="pt-4">
                <TabsContent value="overview" className="mt-0">
                  <ApplicationOverviewTab application={application} />
                </TabsContent>
                <TabsContent value="accounts" className="mt-0">
                   <ApplicationAccountsTab application={application} />
                </TabsContent>
                <TabsContent value="entitlements" className="mt-0">
                   <ApplicationEntitlementsTab application={application} />
                </TabsContent>
                <TabsContent value="access-matrix" className="mt-0">
                   <ApplicationAccessMatrixTab application={application} />
                </TabsContent>
                <TabsContent value="ai-analysis" className="mt-0">
                   <ApplicationAIAnalysisTab application={application} />
                </TabsContent>
              </div>
            </ScrollArea>
          </Tabs>
        </div>
      )}

      {/* Minimized state - show only key info */}
      {isMinimized && (
        <div className="p-4 border-t border-border">
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Quick Stats</div>
            <div className="grid grid-cols-1 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium">{application.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Accounts</span>
                <span className="font-medium">{application.orphanCount}</span>
              </div>
              {application.riskyCount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Risky</span>
                  <span className="font-medium text-orange-600">{application.riskyCount}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationDetailPanel;
