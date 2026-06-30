
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Download, AppWindow } from 'lucide-react';
import { AIConfigureButton } from './AIConfigureButton';
import PageHeader from '@/components/shared/PageHeader';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ApplicationsHeaderProps {
  onAddApplication: () => void;
  onGlobalImport: () => void;
}

const ApplicationsHeader = ({ onAddApplication, onGlobalImport }: ApplicationsHeaderProps) => {
  return (
    <PageHeader
      title="Applications"
      description="Application governance, connectivity, and access lifecycle management"
      icon={<AppWindow className="h-5 w-5 text-primary" />}
      tooltip="Manage connected systems and their access governance lifecycle. Analytics provides insights into application health, risk posture, and entitlement sprawl. Directory lists all onboarded applications."
      actions={
        <div className="flex items-center space-x-2">
          <AIConfigureButton variant="outline" />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={onGlobalImport} variant="outline">
                  <Download className="mr-2 h-4 w-4" /> Import Data
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Run imports for multiple applications at once (Accounts/Entitlements)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button onClick={onAddApplication}>
            <Plus className="mr-2 h-4 w-4" /> Add Application
          </Button>
        </div>
      }
    />
  );
};

export default ApplicationsHeader;