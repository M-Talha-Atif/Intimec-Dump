import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, History } from 'lucide-react';
import { EmailTemplate, TemplateVersion, TriggerTypeVariable } from '../../../../types/emailTemplateTypes';
import { getAvailableVariables } from '../../../../utils/emailTemplate-utils';
import { triggerTypes } from './constants';
import { formatTimestampToLocal } from '@/utils/timestamp-utils';

interface VariablesSidebarProps {
  currentTemplate: EmailTemplate;
  triggerTypeVariables: TriggerTypeVariable[];
  isEditing: boolean;
  onInsertVariable: (variable: string) => void;
  onVersionHistoryClick: () => void;
  versionHistory: TemplateVersion[];
}

export const VariablesSidebar: React.FC<VariablesSidebarProps> = ({
  currentTemplate,
  triggerTypeVariables,
  isEditing,
  onInsertVariable,
  onVersionHistoryClick,
  versionHistory
}) => {
  const availableVars = getAvailableVariables(currentTemplate.triggerType, triggerTypeVariables);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Available Variables</CardTitle>
          {currentTemplate.triggerType && (
            <p className="text-xs text-gray-500">
              Variables for: {triggerTypes.find(t => t.value === currentTemplate.triggerType)?.label}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {availableVars.map((variable) => (
                <div
                  key={variable}
                  className="flex items-center justify-between p-2 rounded hover:bg-primary hover:text-navbar-text transition-colors duration-200 ease-in-out cursor-pointer"
                  onClick={() => onInsertVariable(variable)}
                >
                  <span className="text-sm font-mono">{variable}</span>
                  <Button variant="ghost" size="sm">
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
            {!currentTemplate.triggerType && (
              <div className="text-xs text-gray-500 text-center mt-4">
                Select a trigger type to see specific variables
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Template Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-xs text-muted-foreground">
              <div>Current Version: {currentTemplate.version}</div>
              <div>Last Modified: {formatTimestampToLocal(currentTemplate.lastModified)}</div>
              <div>Modified By: {currentTemplate.modifiedBy}</div>
              <div>Total Versions: {versionHistory.length}</div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onVersionHistoryClick}
              className="w-full"
            >
              <History className="h-4 w-4 mr-1" />
              Version History
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};