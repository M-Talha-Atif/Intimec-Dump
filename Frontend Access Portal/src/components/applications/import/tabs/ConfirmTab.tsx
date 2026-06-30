

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Users, Database, Clock, Play, Calendar, Zap } from 'lucide-react';
import { GlobalImportState } from '../GlobalImportModal';
import { GovernanceGuardrail, GovernanceGuardrailData } from '../GovernanceGuardrail';
import { LiveMonitoring } from '../LiveMonitoring';

interface ConfirmTabProps {
  state: GlobalImportState;
  onRunNow: () => void;
  onSchedule: () => void;
  isLoading: boolean;
  currentTaskId?: string;
}

export function ConfirmTab({ state, onRunNow, onSchedule, isLoading, currentTaskId }: ConfirmTabProps) {
  const selectedAppsCount = state.selectedApps.length;
  const totalObjectsCount = Object.values(state.importConfig).reduce((sum, config) => {
    return sum + (config.accounts ? 1 : 0) + (config.entitlements ? 1 : 0);
  }, 0);

  const estimatedDuration = selectedAppsCount * 15; // 15 minutes per app average

  // Calculate estimated changes for governance guardrail
  const estimatedChanges = selectedAppsCount * 1000; // Estimate 1000 changes per app

  const handleGuardrailUpdate = (data: GovernanceGuardrailData) => {
    // Handle governance guardrail updates
    console.log('Governance guardrail updated:', data);
  };

  return (
    <div className="space-y-6 max-h-[60vh] overflow-y-auto">
      {/* Live Monitoring Panel - Show if task is running */}
      {currentTaskId && (
        <LiveMonitoring
          selectedApps={state.selectedApps}
          onCancel={() => console.log('Cancel task')}
          onRetry={(appId) => console.log('Retry app:', appId)}
          taskId={currentTaskId}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>Import Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{selectedAppsCount}</div>
              <div className="text-sm text-gray-600">Applications</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{totalObjectsCount}</div>
              <div className="text-sm text-gray-600">Object Types</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">~{estimatedDuration}m</div>
              <div className="text-sm text-gray-600">Est. Duration</div>
            </div>
          </div>

          <div className="space-y-3">
            {state.selectedApps.map((appId) => {
              const config = state.importConfig[appId];
              
              // Skip rendering if config doesn't exist
              if (!config) {
                console.warn(`No import config found for app: ${appId}`);
                return null;
              }

              return (
                <div key={appId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Database className="h-5 w-5 text-blue-500" />
                    <div>
                      <div className="font-medium capitalize">{appId.replace('-', ' ')}</div>
                      <div className="text-sm text-gray-600">
                        Mode: {config.aggregationMode} • 
                        {config.accounts && ' Accounts'}{config.accounts && config.entitlements && ' •'}
                        {config.entitlements && ' Entitlements'}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline">Ready</Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Governance Guardrail Section */}
      <GovernanceGuardrail 
        estimatedChanges={estimatedChanges}
        onGuardrailUpdate={handleGuardrailUpdate}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {state.scheduling.runNow ? (
              <Play className="h-5 w-5 text-green-500" />
            ) : (
              <Calendar className="h-5 w-5 text-blue-500" />
            )}
            <span>Execution Mode</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {state.scheduling.runNow ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-green-500" />
                <span className="font-medium">Run Now</span>
                <Badge variant="secondary">Immediate</Badge>
              </div>
              <p className="text-sm text-gray-600">
                Import will start immediately and run in the background. You can monitor progress 
                in the Task Center.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Scheduled</span>
                <Badge variant="outline">
                  {state.scheduling.schedule?.frequency} at {state.scheduling.schedule?.time}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">
                Import will be scheduled according to your configured timing and will run automatically.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

