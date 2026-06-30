import React, { useState, useEffect } from 'react';
import { useConfirm } from '@/hooks/useConfirm';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, X, ArrowLeft, ArrowRight, Play, Calendar, AlertTriangle, FileText, History } from 'lucide-react';
import { ScopeTab } from './tabs/ScopeTab';
import { PreviewTab } from './tabs/PreviewTab';
import { SchedulingTab } from './tabs/SchedulingTab';
import { ConfirmTab } from './tabs/ConfirmTab';
import { AuditLogTab } from './AuditLogTab';
import { ImportTemplates } from './ImportTemplates';
import { useTaskScheduling } from '@/hooks/useTaskScheduling';
import { TaskSchedule, TaskContext } from '@/types/scheduling';

interface GlobalImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface GlobalImportState {
  selectedApps: string[];
  importConfig: {
    [appId: string]: {
      accounts: boolean;
      entitlements: boolean;
      aggregationMode: 'full' | 'delta';
      filters: {
        dateFilters: {
          createdAfter?: string;
          lastSeenAfter?: string;
        };
        statusFilters: string[];
        ownerFilters: string[];
      };
    };
  };
  preview: {
    isDryRun: boolean;
    results: any[];
    conflicts: any[];
    isLoading: boolean;
  };
  scheduling: {
    runNow: boolean;
    schedule?: TaskSchedule;
  };
  hasUnsavedChanges: boolean;
}

const TAB_ORDER = ['scope', 'preview', 'scheduling', 'confirm', 'audit'] as const;

export function GlobalImportModal({ isOpen, onClose }: GlobalImportModalProps) {
  const { confirm: confirmAction, isOpen: isConfirmOpen, options: confirmOptions, handleConfirm: onConfirmAction, handleCancel: onCancelAction } = useConfirm();
  const [activeTab, setActiveTab] = useState<string>('scope');
  const [showTemplates, setShowTemplates] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [state, setState] = useState<GlobalImportState>({
    selectedApps: [],
    importConfig: {},
    preview: {
      isDryRun: true,
      results: [],
      conflicts: [],
      isLoading: false
    },
    scheduling: {
      runNow: true
    },
    hasUnsavedChanges: false
  });

  const { createScheduledTask, executeTask, isLoading } = useTaskScheduling();

  // Load draft state on modal open
  useEffect(() => {
    if (isOpen) {
      const draftState = localStorage.getItem('global-import-draft');
      if (draftState) {
        setState(JSON.parse(draftState));
      }
    }
  }, [isOpen]);

  // Save draft state on changes
  useEffect(() => {
    if (state.hasUnsavedChanges) {
      localStorage.setItem('global-import-draft', JSON.stringify(state));
    }
  }, [state]);

  const updateState = (updates: Partial<GlobalImportState>) => {
    setState(prev => ({
      ...prev,
      ...updates,
      hasUnsavedChanges: true
    }));
  };

  const currentTabIndex = TAB_ORDER.indexOf(activeTab as any);
  const canGoNext = currentTabIndex < TAB_ORDER.length - 1;
  const canGoBack = currentTabIndex > 0;

  const handleNext = () => {
    if (canGoNext) {
      setActiveTab(TAB_ORDER[currentTabIndex + 1]);
    }
  };

  const handleBack = () => {
    if (canGoBack) {
      setActiveTab(TAB_ORDER[currentTabIndex - 1]);
    }
  };

  const handleLoadTemplate = (template: any) => {
    setState(prev => ({
      ...prev,
      selectedApps: template.configuration.selectedApps || [],
      importConfig: template.configuration.importConfig || {},
      hasUnsavedChanges: true
    }));
  };

  const handleRunNow = async () => {
    try {
      // Generate task ID for monitoring
      const taskId = `task-${Date.now()}`;
      setCurrentTaskId(taskId);

      // Execute import for each selected application
      for (const appId of state.selectedApps) {
        const config = state.importConfig[appId];
        if (!config) continue;

        const taskContext: TaskContext = {
          applicationId: appId,
          aggregationMode: config.aggregationMode,
          filters: config.filters
        };

        const task = await createScheduledTask(
          `Batch Import - ${appId}`,
          'data-import',
          {
            frequency: 'one-time',
            time: new Date().toTimeString().slice(0, 5),
            timezone: 'UTC',
            runImmediately: true
          },
          taskContext
        );

        await executeTask(task.id);
      }

      // Clear draft and close
      localStorage.removeItem('global-import-draft');
      setState(prev => ({ ...prev, hasUnsavedChanges: false }));
      onClose();
      
      // Navigate to Task Center
      window.location.href = '/task-center';
    } catch (error) {
      console.error('Failed to execute batch import:', error);
    }
  };

  const handleSchedule = async () => {
    if (!state.scheduling.schedule) return;

    try {
      // Create scheduled task for batch import
      for (const appId of state.selectedApps) {
        const config = state.importConfig[appId];
        if (!config) continue;

        const taskContext: TaskContext = {
          applicationId: appId,
          aggregationMode: config.aggregationMode,
          filters: config.filters
        };

        await createScheduledTask(
          `Scheduled Batch Import - ${appId}`,
          'data-import',
          state.scheduling.schedule,
          taskContext
        );
      }

      // Clear draft and close
      localStorage.removeItem('global-import-draft');
      setState(prev => ({ ...prev, hasUnsavedChanges: false }));
      onClose();
    } catch (error) {
      console.error('Failed to schedule batch import:', error);
    }
  };

  const handleClose = async () => {
    if (state.hasUnsavedChanges) {
      const { confirmed } = await confirmAction({
        title: 'Unsaved Changes',
        description: 'You have unsaved changes. Are you sure you want to close?',
        confirmText: 'Close',
        variant: 'destructive',
      });
      if (!confirmed) return;
    }
    
    // Clear draft if user confirms
    localStorage.removeItem('global-import-draft');
    setState(prev => ({ ...prev, hasUnsavedChanges: false }));
    onClose();
  };

  const getTabValidation = () => {
    switch (activeTab) {
      case 'scope':
        return state.selectedApps.length > 0;
      case 'preview':
        return true; // Preview is always valid
      case 'scheduling':
        return state.scheduling.runNow || !!state.scheduling.schedule;
      case 'confirm':
        return true;
      default:
        return false;
    }
  };

  const selectedAppsCount = state.selectedApps.length;
  const totalObjectsCount = Object.values(state.importConfig).reduce((sum, config) => {
    return sum + (config.accounts ? 1 : 0) + (config.entitlements ? 1 : 0);
  }, 0);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-3">
              <Download className="h-6 w-6 text-blue-500" />
              <span>Global Import Data</span>
              {selectedAppsCount > 0 && (
                <Badge variant="outline" className="ml-2">
                  {selectedAppsCount} app{selectedAppsCount !== 1 ? 's' : ''} • {totalObjectsCount} object{totalObjectsCount !== 1 ? 's' : ''}
                </Badge>
              )}
              {state.hasUnsavedChanges && (
                <Badge variant="secondary" className="ml-2">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Unsaved Changes
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={() => setShowTemplates(true)}>
                <FileText className="h-4 w-4 mr-1" />
                Templates
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-full space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="scope" className="flex items-center space-x-2">
                <span>1. Scope</span>
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center space-x-2" disabled={state.selectedApps.length === 0}>
                <span>2. Preview</span>
              </TabsTrigger>
              <TabsTrigger value="scheduling" className="flex items-center space-x-2" disabled={state.selectedApps.length === 0}>
                <span>3. Scheduling</span>
              </TabsTrigger>
              <TabsTrigger value="confirm" className="flex items-center space-x-2" disabled={state.selectedApps.length === 0}>
                <span>4. Confirm</span>
              </TabsTrigger>
              <TabsTrigger value="audit" className="flex items-center space-x-2">
                <History className="h-4 w-4" />
                <span>Audit</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 mt-4 min-h-0">
              <TabsContent value="scope" className="mt-0 h-full">
                <ScopeTab state={state} updateState={updateState} />
              </TabsContent>

              <TabsContent value="preview" className="mt-0 h-full">
                <PreviewTab state={state} updateState={updateState} />
              </TabsContent>

              <TabsContent value="scheduling" className="mt-0 h-full">
                <SchedulingTab state={state} updateState={updateState} />
              </TabsContent>

              <TabsContent value="confirm" className="mt-0 h-full">
                <ConfirmTab 
                  state={state} 
                  onRunNow={handleRunNow}
                  onSchedule={handleSchedule}
                  isLoading={isLoading}
                  currentTaskId={currentTaskId}
                />
              </TabsContent>

              <TabsContent value="audit" className="mt-0 h-full">
                <AuditLogTab />
              </TabsContent>
            </div>
          </Tabs>

          {/* Navigation Footer - only show for main workflow tabs */}
          {activeTab !== 'audit' && (
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex space-x-2">
                <Button variant="outline" onClick={handleClose}>
                  <X className="h-4 w-4 mr-2" />
                  Close
                </Button>
              </div>

              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={handleBack} 
                  disabled={!canGoBack}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                
                {activeTab === 'confirm' ? (
                  <div className="flex space-x-2">
                    {state.scheduling.runNow ? (
                      <Button onClick={handleRunNow} disabled={isLoading || !getTabValidation()}>
                        <Play className="h-4 w-4 mr-2" />
                        {isLoading ? 'Starting...' : 'Run Now'}
                      </Button>
                    ) : (
                      <Button onClick={handleSchedule} disabled={isLoading || !getTabValidation()}>
                        <Calendar className="h-4 w-4 mr-2" />
                        {isLoading ? 'Scheduling...' : 'Schedule Task'}
                      </Button>
                    )}
                  </div>
                ) : (
                  <Button 
                    onClick={handleNext} 
                    disabled={!canGoNext || !getTabValidation()}
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Templates Modal */}
        <ImportTemplates
          isOpen={showTemplates}
          onClose={() => setShowTemplates(false)}
          currentState={state}
          onLoadTemplate={handleLoadTemplate}
        />
      </DialogContent>
      <ConfirmDialog isOpen={isConfirmOpen} options={confirmOptions} onConfirm={onConfirmAction} onCancel={onCancelAction} />
    </Dialog>
  );
}
