import { Application } from '@/data/mock-applications';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Users, ShieldAlert, History, CheckCircle, XCircle, AlertTriangle, Info, AppWindow, View, Edit, Activity, MoreVertical, ClipboardList, Download, Upload } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { ImportDataModal } from './ImportDataModal';
import { ApplicationAuditLogModal } from './ApplicationAuditLogModal';
import { ExportApplicationModal } from './ExportApplicationModal';
import { ImportApplicationModal } from './ImportApplicationModal';

const StatusBadge = ({ status }: { status: Application['status'] }) => {
  switch (status) {
    case 'Connected':
      return (
        <Badge className="flex items-center border-green-200 bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle className="mr-1 h-3 w-3 text-green-600" />
          Connected
        </Badge>
      );
    case 'Connection Problem':
      return (
        <Badge className="flex items-center border-yellow-200 bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          <AlertTriangle className="mr-1 h-3 w-3 text-yellow-600" />
          Problem
        </Badge>
      );
    case 'Offline':
      return (
        <Badge className="flex items-center border-red-200 bg-red-100 text-red-800 hover:bg-red-100">
          <XCircle className="mr-1 h-3 w-3 text-red-600" />
          Offline
        </Badge>
      );
  }
};

const AiBadge = ({ status }: { status: Application['aiStatus'] }) => {
  switch (status) {
    case 'AI Analyzed':
      return (
        <Badge variant="outline" className="border-blue-200 bg-blue-50 font-normal text-blue-800">
          AI Analyzed
        </Badge>
      );
    case 'AI Pending':
      return (
        <Badge variant="outline" className="border-border bg-muted/50 font-normal text-muted-foreground">
          AI Pending
        </Badge>
      );
  }
};

const ApplicationCard = ({ application, onEdit, onViewDetails }: { application: Application; onEdit: (application: Application) => void; onViewDetails: (application: Application) => void; }) => {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAuditLogModalOpen, setIsAuditLogModalOpen] = useState(false);
  const [isExportAppModalOpen, setIsExportAppModalOpen] = useState(false);
  const [isImportAppModalOpen, setIsImportAppModalOpen] = useState(false);
  const showRisky = application.riskyCount > 0;

  // Owner is not in mock data—use `source` as a placeholder
  const ownerLabel = application.source === 'authoritative' ? 'IT (Authoritative)' : 'Business';

  // For type, just use `category`
  const typeLabel = application.category;

  // For AI Suggestions, placeholder text
  const aiSuggestionText = application.riskyCount > 0
    ? "We recommend reviewing risky accounts or adding missing flows."
    : "No suggestions at this time.";

  const handleImportData = () => {
    setIsImportModalOpen(true);
  };

  const handleViewAuditLogs = () => {
    setIsAuditLogModalOpen(true);
  };

  const handleExportApplication = () => {
    setIsExportAppModalOpen(true);
  };

  const handleImportApplication = () => {
    setIsImportAppModalOpen(true);
  };

  // Helper function to get identity type display name
  const getIdentityTypeDisplay = (identityType?: string) => {
    switch (identityType) {
      case 'employee': return 'Employee';
      case 'non-employee': return 'Non-Employee';
      case 'non-human': return 'Non-Human';
      default: return 'Mixed';
    }
  };

  return (
    <TooltipProvider>
    <Card className="group relative flex flex-col justify-between overflow-hidden transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl">
      <div className="absolute right-3 top-3 z-10 flex gap-1">
        {application.isAuthoritative && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="destructive" className="border-red-500 bg-red-500 text-white">
                Authoritative
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>This application is an authoritative identity source for {getIdentityTypeDisplay(application.identityType)}</p>
            </TooltipContent>
          </Tooltip>
        )}
        {application.source === 'authoritative' && !application.isAuthoritative && (
          <Badge variant="destructive" className="border-red-500 bg-red-500 text-white">
            Authoritative
          </Badge>
        )}
        <Tooltip>
          <TooltipTrigger className="cursor-pointer">
            <Info className="h-4 w-4 text-blue-400 opacity-80 transition hover:text-blue-600" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <span className="font-semibold">AI Suggestions</span>
            <div className="text-xs mt-1">{aiSuggestionText}</div>
          </TooltipContent>
        </Tooltip>
        
        {/* Three-dot menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild className="flex items-center space-x-2">
              <Link href={`/applications/${application.id}/tasks`}>
                <ClipboardList className="h-4 w-4" />
                <span>Tasks</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(application)} className="flex items-center space-x-2">
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleViewAuditLogs} className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Audit Logs</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportApplication} className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 bg-muted rounded-md p-2">
            <AppWindow className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <CardTitle className="truncate text-lg pr-20">{application.name}</CardTitle>
            <CardDescription>
              Type: {typeLabel} &nbsp;|&nbsp; Owner: {ownerLabel}
              {application.identityType && (
                <span>&nbsp;|&nbsp; Identity: {getIdentityTypeDisplay(application.identityType)}</span>
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="grid grid-cols-2 gap-4 pb-2">
        <div className="flex items-start gap-2">
          <Users className="mt-0.5 h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-lg font-bold">{application.orphanCount}</p>
            <p className="text-xs text-muted-foreground">Orphan Accounts</p>
          </div>
        </div>
        {showRisky && (
          <div className="flex items-start gap-2">
            <ShieldAlert className="mt-0.5 h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-lg font-bold">{application.riskyCount}</p>
              <p className="text-xs text-muted-foreground">Risky Accounts</p>
            </div>
          </div>
        )}
      </CardContent>

        <CardFooter className="flex items-end justify-between rounded-b-lg bg-muted/50 p-4 pt-2">
        <div className="flex flex-col items-start gap-2">
          <StatusBadge status={application.status} />
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <History className="h-3 w-3" />
            <span>{application.lastSync.split(',')[0]}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <AiBadge status={application.aiStatus} />
          <div className="flex items-center space-x-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-6 px-2 text-xs"
                  onClick={handleImportApplication}
                >
                  <Upload className="h-3 w-3 mr-1" />
                  Import App
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <span>Import application configuration</span>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-6 px-2 text-xs"
                  onClick={handleImportData}
                >
                  <Database className="h-3 w-3 mr-1" />
                  Import
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <span>Import accounts & entitlements</span>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </CardFooter>

      <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/80 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onViewDetails(application)}>
            <View className="mr-1 h-4 w-4" />
            View Details
          </Button>
          <Button variant="outline" size="sm" onClick={() => onEdit(application)}>
            <Edit className="mr-1 h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" size="sm" onClick={handleViewAuditLogs}>
            <Activity className="mr-1 h-4 w-4" />
            Audit Logs
          </Button>
        </div>
      </div>
      
      {/* Import Data Modal */}
      <ImportDataModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        application={application}
        enableJobConsole={true}
        guardOnActiveRun={true}
      />

      {/* Audit Log Modal */}
      <ApplicationAuditLogModal
        application={application}
        isOpen={isAuditLogModalOpen}
        onClose={() => setIsAuditLogModalOpen(false)}
      />

      {/* Export Application Modal */}
      <ExportApplicationModal
        isOpen={isExportAppModalOpen}
        onClose={() => setIsExportAppModalOpen(false)}
        appId={application.id.toString()}
        appName={application.name}
      />

      {/* Import Application Modal */}
      <ImportApplicationModal
        isOpen={isImportAppModalOpen}
        onClose={() => setIsImportAppModalOpen(false)}
        appId={application.id.toString()}
        appName={application.name}
      />
    </Card>
    </TooltipProvider>
  );
};

export default ApplicationCard;
