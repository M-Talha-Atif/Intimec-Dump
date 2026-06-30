
import React, { useState, useEffect } from 'react';
import { TreeNode } from '@/types/hierarchical-delegation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Search, Plus, Minus, RefreshCw } from 'lucide-react';
import { objectsAPI, ObjectKind } from '@/lib/delegation/objects-api';
import { toast } from 'sonner';

interface ScopeObjectsTabProps {
  nodeId: string;
  node?: TreeNode | null;
}

const objectTabs = [
  { id: 'application' as ObjectKind, label: 'Applications', icon: '🏢' },
  { id: 'user' as ObjectKind, label: 'Users', icon: '👤' },
  { id: 'role' as ObjectKind, label: 'Roles', icon: '🎭' },
  { id: 'entitlement' as ObjectKind, label: 'Entitlements', icon: '🔑' }
];

export function ScopeObjectsTab({ nodeId, node }: ScopeObjectsTabProps) {
  const [activeObjectTab, setActiveObjectTab] = useState<ObjectKind>('application');
  const [searchQuery, setSearchQuery] = useState('');
  const [availableObjects, setAvailableObjects] = useState<string[]>([]);
  const [assignedObjects, setAssignedObjects] = useState<string[]>([]);
  const [selectedAvailable, setSelectedAvailable] = useState<string[]>([]);
  const [selectedAssigned, setSelectedAssigned] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Load data when tab or node changes
  useEffect(() => {
    loadData();
  }, [activeObjectTab, nodeId]);

  // Search when query changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchObjects();
      } else {
        loadAvailableObjects();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, activeObjectTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadAvailableObjects(),
        loadAssignedObjects()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableObjects = async () => {
    try {
      const objects = await objectsAPI.searchObjects(activeObjectTab, '', 1);
      setAvailableObjects(objects);
    } catch (error) {
      toast.error('Failed to load available objects');
    }
  };

  const loadAssignedObjects = async () => {
    try {
      const objects = await objectsAPI.getAssignedObjects(nodeId, activeObjectTab);
      setAssignedObjects(objects);
    } catch (error) {
      toast.error('Failed to load assigned objects');
    }
  };

  const searchObjects = async () => {
    try {
      const objects = await objectsAPI.searchObjects(activeObjectTab, searchQuery, 1);
      setAvailableObjects(objects);
    } catch (error) {
      toast.error('Failed to search objects');
    }
  };

  const handleAssign = async () => {
    if (selectedAvailable.length === 0) return;

    setLoading(true);
    try {
      await objectsAPI.assignObjects(nodeId, activeObjectTab, selectedAvailable);
      
      // Update local state optimistically
      setAssignedObjects(prev => [...prev, ...selectedAvailable]);
      setSelectedAvailable([]);
      
      toast.success(`${selectedAvailable.length} ${activeObjectTab}(s) assigned successfully`);
    } catch (error) {
      toast.error('Failed to assign objects');
    } finally {
      setLoading(false);
    }
  };

  const handleUnassign = async () => {
    if (selectedAssigned.length === 0) return;

    setLoading(true);
    try {
      await objectsAPI.unassignObjects(nodeId, activeObjectTab, selectedAssigned);
      
      // Update local state optimistically
      setAssignedObjects(prev => prev.filter(id => !selectedAssigned.includes(id)));
      setSelectedAssigned([]);
      
      toast.success(`${selectedAssigned.length} ${activeObjectTab}(s) unassigned successfully`);
    } catch (error) {
      toast.error('Failed to unassign objects');
    } finally {
      setLoading(false);
    }
  };

  const handleAvailableToggle = (objectId: string) => {
    setSelectedAvailable(prev => 
      prev.includes(objectId) 
        ? prev.filter(id => id !== objectId)
        : [...prev, objectId]
    );
  };

  const handleAssignedToggle = (objectId: string) => {
    setSelectedAssigned(prev => 
      prev.includes(objectId) 
        ? prev.filter(id => id !== objectId)
        : [...prev, objectId]
    );
  };

  const handleSelectAllAvailable = () => {
    const unassignedAvailable = availableObjects.filter(obj => !assignedObjects.includes(obj));
    setSelectedAvailable(
      selectedAvailable.length === unassignedAvailable.length ? [] : unassignedAvailable
    );
  };

  const handleSelectAllAssigned = () => {
    setSelectedAssigned(
      selectedAssigned.length === assignedObjects.length ? [] : assignedObjects
    );
  };

  const unassignedAvailable = availableObjects.filter(obj => !assignedObjects.includes(obj));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Object Management</h3>
          <p className="text-sm text-muted-foreground">
            Assign and manage objects for this scope
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadData}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs value={activeObjectTab} onValueChange={(value) => setActiveObjectTab(value as ObjectKind)}>
        <TabsList className="grid w-full grid-cols-4">
          {objectTabs.map(tab => (
            <TabsTrigger key={tab.id} value={tab.id} className="text-xs">
              <span className="mr-1">{tab.icon}</span>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {objectTabs.map(tab => (
          <TabsContent key={tab.id} value={tab.id} className="mt-4">
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={`Search ${tab.label.toLowerCase()}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Object Lists */}
              <div className="grid grid-cols-2 gap-6">
                {/* Available Objects */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        Available ({unassignedAvailable.length})
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleSelectAllAvailable}
                          disabled={unassignedAvailable.length === 0}
                        >
                          {selectedAvailable.length === unassignedAvailable.length ? 'None' : 'All'}
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleAssign}
                          disabled={selectedAvailable.length === 0 || loading}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Assign ({selectedAvailable.length})
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {unassignedAvailable.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          {searchQuery ? 'No matching objects found' : 'All objects are assigned'}
                        </div>
                      ) : (
                        unassignedAvailable.map(objectId => (
                          <div
                            key={objectId}
                            className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50"
                          >
                            <Checkbox
                              checked={selectedAvailable.includes(objectId)}
                              onCheckedChange={() => handleAvailableToggle(objectId)}
                            />
                            <span className="text-sm flex-1">{objectId}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Assigned Objects */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        Assigned ({assignedObjects.length})
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleSelectAllAssigned}
                          disabled={assignedObjects.length === 0}
                        >
                          {selectedAssigned.length === assignedObjects.length ? 'None' : 'All'}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleUnassign}
                          disabled={selectedAssigned.length === 0 || loading}
                        >
                          <Minus className="h-4 w-4 mr-1" />
                          Unassign ({selectedAssigned.length})
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {assignedObjects.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          No objects assigned
                        </div>
                      ) : (
                        assignedObjects.map(objectId => (
                          <div
                            key={objectId}
                            className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50"
                          >
                            <Checkbox
                              checked={selectedAssigned.includes(objectId)}
                              onCheckedChange={() => handleAssignedToggle(objectId)}
                            />
                            <span className="text-sm flex-1">{objectId}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Summary */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Recent Changes</span>
                    <div className="flex gap-4">
                      <Badge variant="outline">
                        Last 5 assignments: View audit log
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
