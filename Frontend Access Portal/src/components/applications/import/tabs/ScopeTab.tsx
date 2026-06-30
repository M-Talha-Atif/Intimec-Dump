
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, CheckCircle, XCircle, Clock, Shield, Users, Database, AlertTriangle } from 'lucide-react';
import { mockApplications } from '@/data/mock-applications';
import { GlobalImportState } from '../GlobalImportModal';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ScopeTabProps {
  state: GlobalImportState;
  updateState: (updates: Partial<GlobalImportState>) => void;
}

export function ScopeTab({ state, updateState }: ScopeTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter applications based on search and category
  const filteredApps = mockApplications.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(mockApplications.map(app => app.category)));

  const handleAppToggle = (appId: string, checked: boolean) => {
    const updatedApps = checked 
      ? [...state.selectedApps, appId]
      : state.selectedApps.filter(id => id !== appId);

    const updatedConfig = { ...state.importConfig };
    
    if (checked) {
      // Initialize default config for new app
      updatedConfig[appId] = {
        accounts: true,
        entitlements: true,
        aggregationMode: 'delta',
        filters: {
          dateFilters: {},
          statusFilters: ['active'],
          ownerFilters: []
        }
      };
    } else {
      // Remove config for unchecked app
      delete updatedConfig[appId];
    }

    updateState({
      selectedApps: updatedApps,
      importConfig: updatedConfig
    });
  };

  const handleSelectAll = () => {
    const eligibleApps = filteredApps.filter(app => app.status === 'Connected');
    const allSelected = eligibleApps.every(app => state.selectedApps.includes(app.id.toString()));
    
    if (allSelected) {
      // Deselect all
      updateState({
        selectedApps: [],
        importConfig: {}
      });
    } else {
      // Select all eligible apps
      const newSelectedApps = eligibleApps.map(app => app.id.toString());
      const newConfig: GlobalImportState['importConfig'] = {};
      
      eligibleApps.forEach(app => {
        newConfig[app.id.toString()] = {
          accounts: true,
          entitlements: true,
          aggregationMode: 'delta',
          filters: {
            dateFilters: {},
            statusFilters: ['active'],
            ownerFilters: []
          }
        };
      });

      updateState({
        selectedApps: newSelectedApps,
        importConfig: newConfig
      });
    }
  };

  const handleObjectToggle = (appId: string, objectType: 'accounts' | 'entitlements', checked: boolean) => {
    const updatedConfig = {
      ...state.importConfig,
      [appId]: {
        ...state.importConfig[appId],
        [objectType]: checked
      }
    };

    updateState({ importConfig: updatedConfig });
  };

  const handleAggregationModeChange = (appId: string, mode: 'full' | 'delta') => {
    const updatedConfig = {
      ...state.importConfig,
      [appId]: {
        ...state.importConfig[appId],
        aggregationMode: mode
      }
    };

    updateState({ importConfig: updatedConfig });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Connection Problem':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'Offline':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const isAppDisabled = (app: any) => {
    return app.status !== 'Connected';
  };

  const getDisabledReason = (app: any) => {
    switch (app.status) {
      case 'Connection Problem':
        return 'Connection issues detected';
      case 'Offline':
        return 'Application is offline';
      default:
        return 'Setup incomplete';
    }
  };

  const selectedCount = state.selectedApps.length;
  const totalObjects = Object.values(state.importConfig).reduce((sum, config) => {
    return sum + (config.accounts ? 1 : 0) + (config.entitlements ? 1 : 0);
  }, 0);

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search applications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={handleSelectAll}>
          Select All Connected
        </Button>
      </div>

      {/* Validation Summary */}
      {selectedCount > 0 && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <div className="flex items-center space-x-2 text-blue-800">
            <Database className="h-5 w-5" />
            <span className="font-medium">
              Selected: {selectedCount} application{selectedCount !== 1 ? 's' : ''} • {totalObjects} object{totalObjects !== 1 ? 's' : ''}
            </span>
          </div>
          {totalObjects === 0 && (
            <p className="text-sm text-blue-600 mt-1">
              Select at least one object type (Accounts or Entitlements) to proceed.
            </p>
          )}
        </div>
      )}

      {/* Applications List */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="space-y-4">
            {filteredApps.map(app => {
              const isSelected = state.selectedApps.includes(app.id.toString());
              const isDisabled = isAppDisabled(app);
              const config = state.importConfig[app.id.toString()];

              return (
                <div key={app.id} className={`border rounded-lg p-4 ${isSelected ? 'border-blue-300 bg-blue-50' : 'border-gray-200'} ${isDisabled ? 'opacity-50' : ''}`}>
                  <div className="flex items-start space-x-4">
                    {/* Selection Checkbox */}
                    <div className="pt-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={(checked) => handleAppToggle(app.id.toString(), !!checked)}
                                disabled={isDisabled}
                              />
                            </div>
                          </TooltipTrigger>
                          {isDisabled && (
                            <TooltipContent>
                              <p>{getDisabledReason(app)}</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    {/* Application Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-medium">{app.name}</h3>
                        <Badge variant="outline">{app.category}</Badge>
                        {app.source === 'authoritative' && (
                          <Badge variant="secondary">
                            <Shield className="h-3 w-3 mr-1" />
                            Authoritative
                          </Badge>
                        )}
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(app.status)}
                          <span className="text-sm text-gray-600">{app.status}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <span className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{app.users} users</span>
                        </span>
                        <span>Last sync: {app.lastSync}</span>
                      </div>

                      {/* Import Configuration */}
                      {isSelected && config && (
                        <div className="bg-background border rounded-lg p-4 space-y-4">
                          <div>
                            <Label className="text-sm font-medium mb-2 block">Objects to Import</Label>
                            <div className="flex items-center space-x-6">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={`accounts-${app.id}`}
                                  checked={config.accounts}
                                  onCheckedChange={(checked) => handleObjectToggle(app.id.toString(), 'accounts', !!checked)}
                                />
                                <Label htmlFor={`accounts-${app.id}`} className="text-sm">Accounts</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={`entitlements-${app.id}`}
                                  checked={config.entitlements}
                                  onCheckedChange={(checked) => handleObjectToggle(app.id.toString(), 'entitlements', !!checked)}
                                />
                                <Label htmlFor={`entitlements-${app.id}`} className="text-sm">Entitlements</Label>
                              </div>
                            </div>
                          </div>

                          <div>
                            <Label className="text-sm font-medium mb-2 block">Aggregation Mode</Label>
                            <Select 
                              value={config.aggregationMode} 
                              onValueChange={(value: 'full' | 'delta') => handleAggregationModeChange(app.id.toString(), value)}
                            >
                              <SelectTrigger className="w-48">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="delta">Delta (Incremental)</SelectItem>
                                <SelectItem value="full">Full (Complete)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
